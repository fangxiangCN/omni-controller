import type { ScrcpyOptions3_1 } from '@yume-chan/scrcpy'
import { ScrcpyVideoCodecId } from '@yume-chan/scrcpy'
import { BufferedReadableStream, PushReadableStream, ReadableStream } from '@yume-chan/stream-extra'
import { InsertableStreamVideoFrameRenderer, WebCodecsVideoDecoder } from '@yume-chan/scrcpy-decoder-webcodecs'
import { getUint32BigEndian } from '@yume-chan/no-data-view'

export class AndroidStreamDecoder {
  private renderer = new InsertableStreamVideoFrameRenderer()
  private decoder?: WebCodecsVideoDecoder

  get element(): HTMLVideoElement {
    return this.renderer.element
  }

  async attach(videoStream: ReadableStream<Uint8Array>, options: ScrcpyOptions3_1) {
    const { stream, metadata } = await options.parseVideoStreamMetadata(videoStream)
    let codec: ScrcpyVideoCodecId = ScrcpyVideoCodecId.H264
    if (metadata.codec === ScrcpyVideoCodecId.H264) {
      codec = ScrcpyVideoCodecId.H264
    }
    this.decoder = new WebCodecsVideoDecoder({
      codec,
      renderer: this.renderer,
    })
    await stream.pipeThrough(options.createMediaStreamTransformer()).pipeTo(this.decoder.writable)
  }
}

export async function detectAudioStream(stream: ReadableStream<Uint8Array>) {
  const buffered = new BufferedReadableStream(stream)
  const buffer = await buffered.readExactly(4)
  const codecMetadataValue = getUint32BigEndian(buffer, 0)

  const readableStream = new PushReadableStream<Uint8Array>(async (controller) => {
    await controller.enqueue(buffer)
    const rest = buffered.release()
    const reader = rest.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      await controller.enqueue(value)
    }
  })

  return {
    audio: codecMetadataValue !== 0x00_00_00_00,
    stream: readableStream,
  }
}
