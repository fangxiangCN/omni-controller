import { g as getDefaultExportFromCjs, c as commonjsGlobal } from "./main-BooSMG1P.js";
import require$$1 from "util";
import require$$1$1 from "path";
import require$$0 from "fs";
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
var photon_rs$1 = { exports: {} };
photon_rs$1.exports;
(function(module) {
  let imports = {};
  imports["__wbindgen_placeholder__"] = module.exports;
  let wasm;
  const { TextEncoder, TextDecoder } = require$$1;
  const heap = new Array(32).fill(void 0);
  heap.push(void 0, null, true, false);
  function getObject(idx) {
    return heap[idx];
  }
  let heap_next = heap.length;
  function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
  }
  function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
  }
  function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
  }
  function debugString(val) {
    const type = typeof val;
    if (type == "number" || type == "boolean" || val == null) {
      return `${val}`;
    }
    if (type == "string") {
      return `"${val}"`;
    }
    if (type == "symbol") {
      const description = val.description;
      if (description == null) {
        return "Symbol";
      } else {
        return `Symbol(${description})`;
      }
    }
    if (type == "function") {
      const name = val.name;
      if (typeof name == "string" && name.length > 0) {
        return `Function(${name})`;
      } else {
        return "Function";
      }
    }
    if (Array.isArray(val)) {
      const length = val.length;
      let debug = "[";
      if (length > 0) {
        debug += debugString(val[0]);
      }
      for (let i = 1; i < length; i++) {
        debug += ", " + debugString(val[i]);
      }
      debug += "]";
      return debug;
    }
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
      className = builtInMatches[1];
    } else {
      return toString.call(val);
    }
    if (className == "Object") {
      try {
        return "Object(" + JSON.stringify(val) + ")";
      } catch (_) {
        return "Object";
      }
    }
    if (val instanceof Error) {
      return `${val.name}: ${val.message}
${val.stack}`;
    }
    return className;
  }
  let WASM_VECTOR_LEN = 0;
  let cachegetUint8Memory0 = null;
  function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
      cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
  }
  let cachedTextEncoder = new TextEncoder("utf-8");
  const encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
  } : function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
  function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === void 0) {
      const buf = cachedTextEncoder.encode(arg);
      const ptr2 = malloc(buf.length);
      getUint8Memory0().subarray(ptr2, ptr2 + buf.length).set(buf);
      WASM_VECTOR_LEN = buf.length;
      return ptr2;
    }
    let len = arg.length;
    let ptr = malloc(len);
    const mem = getUint8Memory0();
    let offset = 0;
    for (; offset < len; offset++) {
      const code = arg.charCodeAt(offset);
      if (code > 127) break;
      mem[ptr + offset] = code;
    }
    if (offset !== len) {
      if (offset !== 0) {
        arg = arg.slice(offset);
      }
      ptr = realloc(ptr, len, len = offset + arg.length * 3);
      const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
      const ret = encodeString(arg, view);
      offset += ret.written;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
  }
  let cachegetInt32Memory0 = null;
  function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
      cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
  }
  let cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
  cachedTextDecoder.decode();
  function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
  }
  function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
      throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
  }
  module.exports.crop = function(photon_image, x1, y1, x2, y2) {
    _assertClass(photon_image, PhotonImage);
    var ret = wasm.crop(photon_image.ptr, x1, y1, x2, y2);
    return PhotonImage.__wrap(ret);
  };
  module.exports.crop_img_browser = function(source_canvas, width, height, left, top) {
    var ret = wasm.crop_img_browser(addHeapObject(source_canvas), width, height, left, top);
    return takeObject(ret);
  };
  module.exports.fliph = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.fliph(photon_image.ptr);
  };
  module.exports.flipv = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.flipv(photon_image.ptr);
  };
  module.exports.resize_img_browser = function(photon_img, width, height, sampling_filter) {
    _assertClass(photon_img, PhotonImage);
    var ret = wasm.resize_img_browser(photon_img.ptr, width, height, sampling_filter);
    return takeObject(ret);
  };
  module.exports.resize = function(photon_img, width, height, sampling_filter) {
    _assertClass(photon_img, PhotonImage);
    var ret = wasm.resize(photon_img.ptr, width, height, sampling_filter);
    return PhotonImage.__wrap(ret);
  };
  module.exports.seam_carve = function(img, width, height) {
    _assertClass(img, PhotonImage);
    var ret = wasm.seam_carve(img.ptr, width, height);
    return PhotonImage.__wrap(ret);
  };
  module.exports.padding_uniform = function(img, padding, padding_rgba) {
    _assertClass(img, PhotonImage);
    _assertClass(padding_rgba, Rgba);
    var ptr0 = padding_rgba.ptr;
    padding_rgba.ptr = 0;
    var ret = wasm.padding_uniform(img.ptr, padding, ptr0);
    return PhotonImage.__wrap(ret);
  };
  module.exports.padding_left = function(img, padding, padding_rgba) {
    _assertClass(img, PhotonImage);
    _assertClass(padding_rgba, Rgba);
    var ptr0 = padding_rgba.ptr;
    padding_rgba.ptr = 0;
    var ret = wasm.padding_left(img.ptr, padding, ptr0);
    return PhotonImage.__wrap(ret);
  };
  module.exports.padding_right = function(img, padding, padding_rgba) {
    _assertClass(img, PhotonImage);
    _assertClass(padding_rgba, Rgba);
    var ptr0 = padding_rgba.ptr;
    padding_rgba.ptr = 0;
    var ret = wasm.padding_right(img.ptr, padding, ptr0);
    return PhotonImage.__wrap(ret);
  };
  module.exports.padding_top = function(img, padding, padding_rgba) {
    _assertClass(img, PhotonImage);
    _assertClass(padding_rgba, Rgba);
    var ptr0 = padding_rgba.ptr;
    padding_rgba.ptr = 0;
    var ret = wasm.padding_top(img.ptr, padding, ptr0);
    return PhotonImage.__wrap(ret);
  };
  module.exports.padding_bottom = function(img, padding, padding_rgba) {
    _assertClass(img, PhotonImage);
    _assertClass(padding_rgba, Rgba);
    var ptr0 = padding_rgba.ptr;
    padding_rgba.ptr = 0;
    var ret = wasm.padding_bottom(img.ptr, padding, ptr0);
    return PhotonImage.__wrap(ret);
  };
  module.exports.rotate = function(img, angle) {
    _assertClass(img, PhotonImage);
    var ret = wasm.rotate(img.ptr, angle);
    return PhotonImage.__wrap(ret);
  };
  module.exports.resample = function(img, dst_width, dst_height) {
    _assertClass(img, PhotonImage);
    var ret = wasm.resample(img.ptr, dst_width, dst_height);
    return PhotonImage.__wrap(ret);
  };
  module.exports.draw_text_with_border = function(photon_img, text, x, y) {
    _assertClass(photon_img, PhotonImage);
    var ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.draw_text_with_border(photon_img.ptr, ptr0, len0, x, y);
  };
  module.exports.draw_text = function(photon_img, text, x, y) {
    _assertClass(photon_img, PhotonImage);
    var ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.draw_text(photon_img.ptr, ptr0, len0, x, y);
  };
  function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
  }
  function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
  }
  module.exports.run = function() {
    wasm.run();
  };
  let stack_pointer = 32;
  function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error("out of js stack");
    heap[--stack_pointer] = obj;
    return stack_pointer;
  }
  module.exports.get_image_data = function(canvas, ctx) {
    try {
      var ret = wasm.get_image_data(addBorrowedObject(canvas), addBorrowedObject(ctx));
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = void 0;
      heap[stack_pointer++] = void 0;
    }
  };
  module.exports.putImageData = function(canvas, ctx, new_image) {
    _assertClass(new_image, PhotonImage);
    var ptr0 = new_image.ptr;
    new_image.ptr = 0;
    wasm.putImageData(addHeapObject(canvas), addHeapObject(ctx), ptr0);
  };
  module.exports.open_image = function(canvas, ctx) {
    var ret = wasm.open_image(addHeapObject(canvas), addHeapObject(ctx));
    return PhotonImage.__wrap(ret);
  };
  module.exports.to_raw_pixels = function(imgdata) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.to_raw_pixels(retptr, addHeapObject(imgdata));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var v0 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  };
  module.exports.base64_to_image = function(base64) {
    var ptr0 = passStringToWasm0(base64, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.base64_to_image(ptr0, len0);
    return PhotonImage.__wrap(ret);
  };
  module.exports.base64_to_vec = function(base64) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = passStringToWasm0(base64, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.base64_to_vec(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  };
  module.exports.to_image_data = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    var ptr0 = photon_image.ptr;
    photon_image.ptr = 0;
    var ret = wasm.to_image_data(ptr0);
    return takeObject(ret);
  };
  module.exports.alter_channel = function(img, channel, amt) {
    _assertClass(img, PhotonImage);
    wasm.alter_channel(img.ptr, channel, amt);
  };
  module.exports.alter_red_channel = function(photon_image, amt) {
    _assertClass(photon_image, PhotonImage);
    wasm.alter_red_channel(photon_image.ptr, amt);
  };
  module.exports.alter_green_channel = function(img, amt) {
    _assertClass(img, PhotonImage);
    wasm.alter_green_channel(img.ptr, amt);
  };
  module.exports.alter_blue_channel = function(img, amt) {
    _assertClass(img, PhotonImage);
    wasm.alter_blue_channel(img.ptr, amt);
  };
  module.exports.alter_two_channels = function(img, channel1, amt1, channel2, amt2) {
    _assertClass(img, PhotonImage);
    wasm.alter_two_channels(img.ptr, channel1, amt1, channel2, amt2);
  };
  module.exports.alter_channels = function(img, r_amt, g_amt, b_amt) {
    _assertClass(img, PhotonImage);
    wasm.alter_channels(img.ptr, r_amt, g_amt, b_amt);
  };
  module.exports.remove_channel = function(img, channel, min_filter) {
    _assertClass(img, PhotonImage);
    wasm.remove_channel(img.ptr, channel, min_filter);
  };
  module.exports.remove_red_channel = function(img, min_filter) {
    _assertClass(img, PhotonImage);
    wasm.remove_red_channel(img.ptr, min_filter);
  };
  module.exports.remove_green_channel = function(img, min_filter) {
    _assertClass(img, PhotonImage);
    wasm.remove_green_channel(img.ptr, min_filter);
  };
  module.exports.remove_blue_channel = function(img, min_filter) {
    _assertClass(img, PhotonImage);
    wasm.remove_blue_channel(img.ptr, min_filter);
  };
  module.exports.swap_channels = function(img, channel1, channel2) {
    _assertClass(img, PhotonImage);
    wasm.swap_channels(img.ptr, channel1, channel2);
  };
  module.exports.invert = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.invert(photon_image.ptr);
  };
  module.exports.selective_hue_rotate = function(photon_image, ref_color, degrees) {
    _assertClass(photon_image, PhotonImage);
    _assertClass(ref_color, Rgb);
    var ptr0 = ref_color.ptr;
    ref_color.ptr = 0;
    wasm.selective_hue_rotate(photon_image.ptr, ptr0, degrees);
  };
  module.exports.selective_color_convert = function(photon_image, ref_color, new_color, fraction) {
    _assertClass(photon_image, PhotonImage);
    _assertClass(ref_color, Rgb);
    var ptr0 = ref_color.ptr;
    ref_color.ptr = 0;
    _assertClass(new_color, Rgb);
    var ptr1 = new_color.ptr;
    new_color.ptr = 0;
    wasm.selective_color_convert(photon_image.ptr, ptr0, ptr1, fraction);
  };
  module.exports.selective_lighten = function(img, ref_color, amt) {
    _assertClass(img, PhotonImage);
    _assertClass(ref_color, Rgb);
    var ptr0 = ref_color.ptr;
    ref_color.ptr = 0;
    wasm.selective_lighten(img.ptr, ptr0, amt);
  };
  module.exports.selective_desaturate = function(img, ref_color, amt) {
    _assertClass(img, PhotonImage);
    _assertClass(ref_color, Rgb);
    var ptr0 = ref_color.ptr;
    ref_color.ptr = 0;
    wasm.selective_desaturate(img.ptr, ptr0, amt);
  };
  module.exports.selective_saturate = function(img, ref_color, amt) {
    _assertClass(img, PhotonImage);
    _assertClass(ref_color, Rgb);
    var ptr0 = ref_color.ptr;
    ref_color.ptr = 0;
    wasm.selective_saturate(img.ptr, ptr0, amt);
  };
  module.exports.selective_greyscale = function(photon_image, ref_color) {
    _assertClass(photon_image, PhotonImage);
    var ptr0 = photon_image.ptr;
    photon_image.ptr = 0;
    _assertClass(ref_color, Rgb);
    var ptr1 = ref_color.ptr;
    ref_color.ptr = 0;
    wasm.selective_greyscale(ptr0, ptr1);
  };
  module.exports.monochrome = function(img, r_offset, g_offset, b_offset) {
    _assertClass(img, PhotonImage);
    wasm.monochrome(img.ptr, r_offset, g_offset, b_offset);
  };
  module.exports.sepia = function(img) {
    _assertClass(img, PhotonImage);
    wasm.sepia(img.ptr);
  };
  module.exports.grayscale = function(img) {
    _assertClass(img, PhotonImage);
    wasm.grayscale(img.ptr);
  };
  module.exports.grayscale_human_corrected = function(img) {
    _assertClass(img, PhotonImage);
    wasm.grayscale_human_corrected(img.ptr);
  };
  module.exports.desaturate = function(img) {
    _assertClass(img, PhotonImage);
    wasm.desaturate(img.ptr);
  };
  module.exports.decompose_min = function(img) {
    _assertClass(img, PhotonImage);
    wasm.decompose_min(img.ptr);
  };
  module.exports.decompose_max = function(img) {
    _assertClass(img, PhotonImage);
    wasm.decompose_max(img.ptr);
  };
  module.exports.grayscale_shades = function(photon_image, num_shades) {
    _assertClass(photon_image, PhotonImage);
    wasm.grayscale_shades(photon_image.ptr, num_shades);
  };
  module.exports.r_grayscale = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.r_grayscale(photon_image.ptr);
  };
  module.exports.g_grayscale = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.g_grayscale(photon_image.ptr);
  };
  module.exports.b_grayscale = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.b_grayscale(photon_image.ptr);
  };
  module.exports.single_channel_grayscale = function(photon_image, channel) {
    _assertClass(photon_image, PhotonImage);
    wasm.single_channel_grayscale(photon_image.ptr, channel);
  };
  module.exports.threshold = function(img, threshold) {
    _assertClass(img, PhotonImage);
    wasm.threshold(img.ptr, threshold);
  };
  module.exports.offset = function(photon_image, channel_index, offset) {
    _assertClass(photon_image, PhotonImage);
    wasm.offset(photon_image.ptr, channel_index, offset);
  };
  module.exports.offset_red = function(img, offset_amt) {
    _assertClass(img, PhotonImage);
    wasm.offset_red(img.ptr, offset_amt);
  };
  module.exports.offset_green = function(img, offset_amt) {
    _assertClass(img, PhotonImage);
    wasm.offset_green(img.ptr, offset_amt);
  };
  module.exports.offset_blue = function(img, offset_amt) {
    _assertClass(img, PhotonImage);
    wasm.offset_blue(img.ptr, offset_amt);
  };
  module.exports.multiple_offsets = function(photon_image, offset, channel_index, channel_index2) {
    _assertClass(photon_image, PhotonImage);
    wasm.multiple_offsets(photon_image.ptr, offset, channel_index, channel_index2);
  };
  module.exports.primary = function(img) {
    _assertClass(img, PhotonImage);
    wasm.primary(img.ptr);
  };
  module.exports.colorize = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.colorize(photon_image.ptr);
  };
  module.exports.solarize = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.solarize(photon_image.ptr);
  };
  module.exports.solarize_retimg = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    var ret = wasm.solarize_retimg(photon_image.ptr);
    return PhotonImage.__wrap(ret);
  };
  module.exports.inc_brightness = function(photon_image, brightness) {
    _assertClass(photon_image, PhotonImage);
    wasm.inc_brightness(photon_image.ptr, brightness);
  };
  module.exports.adjust_contrast = function(photon_image, contrast) {
    _assertClass(photon_image, PhotonImage);
    wasm.adjust_contrast(photon_image.ptr, contrast);
  };
  module.exports.tint = function(photon_image, r_offset, g_offset, b_offset) {
    _assertClass(photon_image, PhotonImage);
    wasm.tint(photon_image.ptr, r_offset, g_offset, b_offset);
  };
  module.exports.horizontal_strips = function(photon_image, num_strips) {
    _assertClass(photon_image, PhotonImage);
    wasm.horizontal_strips(photon_image.ptr, num_strips);
  };
  module.exports.color_horizontal_strips = function(photon_image, num_strips, color) {
    _assertClass(photon_image, PhotonImage);
    _assertClass(color, Rgb);
    var ptr0 = color.ptr;
    color.ptr = 0;
    wasm.color_horizontal_strips(photon_image.ptr, num_strips, ptr0);
  };
  module.exports.vertical_strips = function(photon_image, num_strips) {
    _assertClass(photon_image, PhotonImage);
    wasm.vertical_strips(photon_image.ptr, num_strips);
  };
  module.exports.color_vertical_strips = function(photon_image, num_strips, color) {
    _assertClass(photon_image, PhotonImage);
    _assertClass(color, Rgb);
    var ptr0 = color.ptr;
    color.ptr = 0;
    wasm.color_vertical_strips(photon_image.ptr, num_strips, ptr0);
  };
  module.exports.oil = function(photon_image, radius, intensity) {
    _assertClass(photon_image, PhotonImage);
    wasm.oil(photon_image.ptr, radius, intensity);
  };
  module.exports.frosted_glass = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.frosted_glass(photon_image.ptr);
  };
  module.exports.pixelize = function(photon_image, pixel_size) {
    _assertClass(photon_image, PhotonImage);
    wasm.pixelize(photon_image.ptr, pixel_size);
  };
  module.exports.normalize = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.normalize(photon_image.ptr);
  };
  module.exports.dither = function(photon_image, depth) {
    _assertClass(photon_image, PhotonImage);
    wasm.dither(photon_image.ptr, depth);
  };
  module.exports.duotone = function(photon_image, color_a, color_b) {
    _assertClass(photon_image, PhotonImage);
    _assertClass(color_a, Rgb);
    var ptr0 = color_a.ptr;
    color_a.ptr = 0;
    _assertClass(color_b, Rgb);
    var ptr1 = color_b.ptr;
    color_b.ptr = 0;
    wasm.duotone(photon_image.ptr, ptr0, ptr1);
  };
  module.exports.neue = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.neue(photon_image.ptr);
  };
  module.exports.lix = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.lix(photon_image.ptr);
  };
  module.exports.ryo = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.ryo(photon_image.ptr);
  };
  module.exports.filter = function(img, filter_name) {
    _assertClass(img, PhotonImage);
    var ptr0 = passStringToWasm0(filter_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.filter(img.ptr, ptr0, len0);
  };
  module.exports.lofi = function(img) {
    _assertClass(img, PhotonImage);
    wasm.lofi(img.ptr);
  };
  module.exports.pastel_pink = function(img) {
    _assertClass(img, PhotonImage);
    wasm.pastel_pink(img.ptr);
  };
  module.exports.golden = function(img) {
    _assertClass(img, PhotonImage);
    wasm.golden(img.ptr);
  };
  module.exports.cali = function(img) {
    _assertClass(img, PhotonImage);
    wasm.cali(img.ptr);
  };
  module.exports.dramatic = function(img) {
    _assertClass(img, PhotonImage);
    wasm.dramatic(img.ptr);
  };
  module.exports.monochrome_tint = function(img, rgb_color) {
    _assertClass(img, PhotonImage);
    _assertClass(rgb_color, Rgb);
    var ptr0 = rgb_color.ptr;
    rgb_color.ptr = 0;
    wasm.monochrome_tint(img.ptr, ptr0);
  };
  module.exports.duotone_violette = function(img) {
    _assertClass(img, PhotonImage);
    wasm.duotone_violette(img.ptr);
  };
  module.exports.duotone_horizon = function(img) {
    _assertClass(img, PhotonImage);
    wasm.duotone_horizon(img.ptr);
  };
  module.exports.duotone_tint = function(img, rgb_color) {
    _assertClass(img, PhotonImage);
    _assertClass(rgb_color, Rgb);
    var ptr0 = rgb_color.ptr;
    rgb_color.ptr = 0;
    wasm.duotone_tint(img.ptr, ptr0);
  };
  module.exports.duotone_lilac = function(img) {
    _assertClass(img, PhotonImage);
    wasm.duotone_lilac(img.ptr);
  };
  module.exports.duotone_ochre = function(img) {
    _assertClass(img, PhotonImage);
    wasm.duotone_ochre(img.ptr);
  };
  module.exports.firenze = function(img) {
    _assertClass(img, PhotonImage);
    wasm.firenze(img.ptr);
  };
  module.exports.obsidian = function(img) {
    _assertClass(img, PhotonImage);
    wasm.obsidian(img.ptr);
  };
  module.exports.gamma_correction = function(photon_image, red, green, blue) {
    _assertClass(photon_image, PhotonImage);
    wasm.gamma_correction(photon_image.ptr, red, green, blue);
  };
  module.exports.hsluv = function(photon_image, mode, amt) {
    _assertClass(photon_image, PhotonImage);
    var ptr0 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.hsluv(photon_image.ptr, ptr0, len0, amt);
  };
  module.exports.lch = function(photon_image, mode, amt) {
    _assertClass(photon_image, PhotonImage);
    var ptr0 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.lch(photon_image.ptr, ptr0, len0, amt);
  };
  module.exports.hsl = function(photon_image, mode, amt) {
    _assertClass(photon_image, PhotonImage);
    var ptr0 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.hsl(photon_image.ptr, ptr0, len0, amt);
  };
  module.exports.hsv = function(photon_image, mode, amt) {
    _assertClass(photon_image, PhotonImage);
    var ptr0 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.hsv(photon_image.ptr, ptr0, len0, amt);
  };
  module.exports.hue_rotate_hsl = function(img, degrees) {
    _assertClass(img, PhotonImage);
    wasm.hue_rotate_hsl(img.ptr, degrees);
  };
  module.exports.hue_rotate_hsv = function(img, degrees) {
    _assertClass(img, PhotonImage);
    wasm.hue_rotate_hsv(img.ptr, degrees);
  };
  module.exports.hue_rotate_lch = function(img, degrees) {
    _assertClass(img, PhotonImage);
    wasm.hue_rotate_lch(img.ptr, degrees);
  };
  module.exports.hue_rotate_hsluv = function(img, degrees) {
    _assertClass(img, PhotonImage);
    wasm.hue_rotate_hsluv(img.ptr, degrees);
  };
  module.exports.saturate_hsl = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.saturate_hsl(img.ptr, level);
  };
  module.exports.saturate_lch = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.saturate_lch(img.ptr, level);
  };
  module.exports.saturate_hsluv = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.saturate_hsluv(img.ptr, level);
  };
  module.exports.saturate_hsv = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.saturate_hsv(img.ptr, level);
  };
  module.exports.lighten_lch = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.lighten_lch(img.ptr, level);
  };
  module.exports.lighten_hsluv = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.lighten_hsluv(img.ptr, level);
  };
  module.exports.lighten_hsl = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.lighten_hsl(img.ptr, level);
  };
  module.exports.lighten_hsv = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.lighten_hsv(img.ptr, level);
  };
  module.exports.darken_lch = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.darken_lch(img.ptr, level);
  };
  module.exports.darken_hsluv = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.darken_hsluv(img.ptr, level);
  };
  module.exports.darken_hsl = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.darken_hsl(img.ptr, level);
  };
  module.exports.darken_hsv = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.darken_hsv(img.ptr, level);
  };
  module.exports.desaturate_hsv = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.desaturate_hsv(img.ptr, level);
  };
  module.exports.desaturate_hsl = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.desaturate_hsl(img.ptr, level);
  };
  module.exports.desaturate_lch = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.desaturate_lch(img.ptr, level);
  };
  module.exports.desaturate_hsluv = function(img, level) {
    _assertClass(img, PhotonImage);
    wasm.desaturate_hsluv(img.ptr, level);
  };
  module.exports.mix_with_colour = function(photon_image, mix_colour, opacity) {
    _assertClass(photon_image, PhotonImage);
    _assertClass(mix_colour, Rgb);
    var ptr0 = mix_colour.ptr;
    mix_colour.ptr = 0;
    wasm.mix_with_colour(photon_image.ptr, ptr0, opacity);
  };
  module.exports.watermark = function(img, watermark, x, y) {
    _assertClass(img, PhotonImage);
    _assertClass(watermark, PhotonImage);
    wasm.watermark(img.ptr, watermark.ptr, x, y);
  };
  module.exports.blend = function(photon_image, photon_image2, blend_mode) {
    _assertClass(photon_image, PhotonImage);
    _assertClass(photon_image2, PhotonImage);
    var ptr0 = passStringToWasm0(blend_mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.blend(photon_image.ptr, photon_image2.ptr, ptr0, len0);
  };
  module.exports.create_gradient = function(width, height) {
    var ret = wasm.create_gradient(width, height);
    return PhotonImage.__wrap(ret);
  };
  module.exports.apply_gradient = function(image) {
    _assertClass(image, PhotonImage);
    wasm.apply_gradient(image.ptr);
  };
  module.exports.noise_reduction = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.noise_reduction(photon_image.ptr);
  };
  module.exports.sharpen = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.sharpen(photon_image.ptr);
  };
  module.exports.edge_detection = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.edge_detection(photon_image.ptr);
  };
  module.exports.identity = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.identity(photon_image.ptr);
  };
  module.exports.box_blur = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.box_blur(photon_image.ptr);
  };
  module.exports.gaussian_blur = function(photon_image, radius) {
    _assertClass(photon_image, PhotonImage);
    wasm.gaussian_blur(photon_image.ptr, radius);
  };
  module.exports.detect_horizontal_lines = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.detect_horizontal_lines(photon_image.ptr);
  };
  module.exports.detect_vertical_lines = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.detect_vertical_lines(photon_image.ptr);
  };
  module.exports.detect_45_deg_lines = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.detect_45_deg_lines(photon_image.ptr);
  };
  module.exports.detect_135_deg_lines = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.detect_135_deg_lines(photon_image.ptr);
  };
  module.exports.laplace = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.laplace(photon_image.ptr);
  };
  module.exports.edge_one = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.edge_one(photon_image.ptr);
  };
  module.exports.emboss = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.emboss(photon_image.ptr);
  };
  module.exports.sobel_horizontal = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.sobel_horizontal(photon_image.ptr);
  };
  module.exports.prewitt_horizontal = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.prewitt_horizontal(photon_image.ptr);
  };
  module.exports.sobel_vertical = function(photon_image) {
    _assertClass(photon_image, PhotonImage);
    wasm.sobel_vertical(photon_image.ptr);
  };
  function isLikeNone(x) {
    return x === void 0 || x === null;
  }
  function handleError(f, args) {
    try {
      return f.apply(this, args);
    } catch (e) {
      wasm.__wbindgen_exn_store(addHeapObject(e));
    }
  }
  let cachegetUint8ClampedMemory0 = null;
  function getUint8ClampedMemory0() {
    if (cachegetUint8ClampedMemory0 === null || cachegetUint8ClampedMemory0.buffer !== wasm.memory.buffer) {
      cachegetUint8ClampedMemory0 = new Uint8ClampedArray(wasm.memory.buffer);
    }
    return cachegetUint8ClampedMemory0;
  }
  function getClampedArrayU8FromWasm0(ptr, len) {
    return getUint8ClampedMemory0().subarray(ptr / 1, ptr / 1 + len);
  }
  module.exports.SamplingFilter = Object.freeze({ Nearest: 1, "1": "Nearest", Triangle: 2, "2": "Triangle", CatmullRom: 3, "3": "CatmullRom", Gaussian: 4, "4": "Gaussian", Lanczos3: 5, "5": "Lanczos3" });
  class PhotonImage {
    static __wrap(ptr) {
      const obj = Object.create(PhotonImage.prototype);
      obj.ptr = ptr;
      return obj;
    }
    __destroy_into_raw() {
      const ptr = this.ptr;
      this.ptr = 0;
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_photonimage_free(ptr);
    }
    /**
    * Create a new PhotonImage from a Vec of u8s, which represent raw pixels.
    * @param {Uint8Array} raw_pixels
    * @param {number} width
    * @param {number} height
    */
    constructor(raw_pixels, width, height) {
      var ptr0 = passArray8ToWasm0(raw_pixels, wasm.__wbindgen_malloc);
      var len0 = WASM_VECTOR_LEN;
      var ret = wasm.photonimage_new(ptr0, len0, width, height);
      return PhotonImage.__wrap(ret);
    }
    /**
    * Create a new PhotonImage from a base64 string.
    * @param {string} base64
    * @returns {PhotonImage}
    */
    static new_from_base64(base64) {
      var ptr0 = passStringToWasm0(base64, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      var ret = wasm.base64_to_image(ptr0, len0);
      return PhotonImage.__wrap(ret);
    }
    /**
    * Create a new PhotonImage from a byteslice.
    * @param {Uint8Array} vec
    * @returns {PhotonImage}
    */
    static new_from_byteslice(vec) {
      var ptr0 = passArray8ToWasm0(vec, wasm.__wbindgen_malloc);
      var len0 = WASM_VECTOR_LEN;
      var ret = wasm.photonimage_new_from_byteslice(ptr0, len0);
      return PhotonImage.__wrap(ret);
    }
    /**
    * Get the width of the PhotonImage.
    * @returns {number}
    */
    get_width() {
      var ret = wasm.photonimage_get_width(this.ptr);
      return ret >>> 0;
    }
    /**
    * Get the PhotonImage's pixels as a Vec of u8s.
    * @returns {Uint8Array}
    */
    get_raw_pixels() {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.photonimage_get_raw_pixels(retptr, this.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Get the height of the PhotonImage.
    * @returns {number}
    */
    get_height() {
      var ret = wasm.photonimage_get_height(this.ptr);
      return ret >>> 0;
    }
    /**
    * Convert the PhotonImage to base64.
    * @returns {string}
    */
    get_base64() {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.photonimage_get_base64(retptr, this.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
      }
    }
    /**
    * Convert the PhotonImage to raw bytes. Returns JPEG.
    * @returns {Uint8Array}
    */
    get_bytes() {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.photonimage_get_bytes(retptr, this.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Convert the PhotonImage to raw bytes. Returns a JPEG.
    * @param {number} quality
    * @returns {Uint8Array}
    */
    get_bytes_jpeg(quality) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.photonimage_get_bytes_jpeg(retptr, this.ptr, quality);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
      }
    }
    /**
    * Convert the PhotonImage's raw pixels to JS-compatible ImageData.
    * @returns {ImageData}
    */
    get_image_data() {
      var ret = wasm.photonimage_get_image_data(this.ptr);
      return takeObject(ret);
    }
    /**
    * Convert ImageData to raw pixels, and update the PhotonImage's raw pixels to this.
    * @param {ImageData} img_data
    */
    set_imgdata(img_data) {
      wasm.photonimage_set_imgdata(this.ptr, addHeapObject(img_data));
    }
  }
  module.exports.PhotonImage = PhotonImage;
  class Rgb {
    static __wrap(ptr) {
      const obj = Object.create(Rgb.prototype);
      obj.ptr = ptr;
      return obj;
    }
    __destroy_into_raw() {
      const ptr = this.ptr;
      this.ptr = 0;
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_rgb_free(ptr);
    }
    /**
    * Create a new RGB struct.
    * @param {number} r
    * @param {number} g
    * @param {number} b
    */
    constructor(r, g, b) {
      var ret = wasm.rgb_new(r, g, b);
      return Rgb.__wrap(ret);
    }
    /**
    * Set the Red value.
    * @param {number} r
    */
    set_red(r) {
      wasm.rgb_set_red(this.ptr, r);
    }
    /**
    * Get the Green value.
    * @param {number} g
    */
    set_green(g) {
      wasm.rgb_set_green(this.ptr, g);
    }
    /**
    * Set the Blue value.
    * @param {number} b
    */
    set_blue(b) {
      wasm.rgb_set_blue(this.ptr, b);
    }
    /**
    * Get the Red value.
    * @returns {number}
    */
    get_red() {
      var ret = wasm.rgb_get_red(this.ptr);
      return ret;
    }
    /**
    * Get the Green value.
    * @returns {number}
    */
    get_green() {
      var ret = wasm.rgb_get_green(this.ptr);
      return ret;
    }
    /**
    * Get the Blue value.
    * @returns {number}
    */
    get_blue() {
      var ret = wasm.rgb_get_blue(this.ptr);
      return ret;
    }
  }
  module.exports.Rgb = Rgb;
  class Rgba {
    static __wrap(ptr) {
      const obj = Object.create(Rgba.prototype);
      obj.ptr = ptr;
      return obj;
    }
    __destroy_into_raw() {
      const ptr = this.ptr;
      this.ptr = 0;
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_rgba_free(ptr);
    }
    /**
    * Create a new RGBA struct.
    * @param {number} r
    * @param {number} g
    * @param {number} b
    * @param {number} a
    */
    constructor(r, g, b, a) {
      var ret = wasm.rgba_new(r, g, b, a);
      return Rgba.__wrap(ret);
    }
    /**
    * Set the Red value.
    * @param {number} r
    */
    set_red(r) {
      wasm.rgb_set_red(this.ptr, r);
    }
    /**
    * Get the Green value.
    * @param {number} g
    */
    set_green(g) {
      wasm.rgb_set_green(this.ptr, g);
    }
    /**
    * Set the Blue value.
    * @param {number} b
    */
    set_blue(b) {
      wasm.rgb_set_blue(this.ptr, b);
    }
    /**
    * Set the alpha value.
    * @param {number} a
    */
    set_alpha(a) {
      wasm.rgba_set_alpha(this.ptr, a);
    }
    /**
    * Get the Red value.
    * @returns {number}
    */
    get_red() {
      var ret = wasm.rgb_get_red(this.ptr);
      return ret;
    }
    /**
    * Get the Green value.
    * @returns {number}
    */
    get_green() {
      var ret = wasm.rgb_get_green(this.ptr);
      return ret;
    }
    /**
    * Get the Blue value.
    * @returns {number}
    */
    get_blue() {
      var ret = wasm.rgb_get_blue(this.ptr);
      return ret;
    }
    /**
    * Get the alpha value for this color.
    * @returns {number}
    */
    get_alpha() {
      var ret = wasm.rgba_get_alpha(this.ptr);
      return ret;
    }
  }
  module.exports.Rgba = Rgba;
  module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
  };
  module.exports.__wbg_new_693216e109162396 = function() {
    var ret = new Error();
    return addHeapObject(ret);
  };
  module.exports.__wbg_stack_0ddaca5d1abfb52f = function(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  };
  module.exports.__wbg_error_09919627ac0992f5 = function(arg0, arg1) {
    try {
      console.error(getStringFromWasm0(arg0, arg1));
    } finally {
      wasm.__wbindgen_free(arg0, arg1);
    }
  };
  module.exports.__wbg_instanceof_Window_c4b70662a0d2c5ec = function(arg0) {
    var ret = getObject(arg0) instanceof Window;
    return ret;
  };
  module.exports.__wbg_document_1c64944725c0d81d = function(arg0) {
    var ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  module.exports.__wbg_body_78ae4fd43b446013 = function(arg0) {
    var ret = getObject(arg0).body;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  module.exports.__wbg_createElement_86c152812a141a62 = function() {
    return handleError(function(arg0, arg1, arg2) {
      var ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbg_width_16bd64d09cbf5661 = function(arg0) {
    var ret = getObject(arg0).width;
    return ret;
  };
  module.exports.__wbg_height_368bb86c37d51bc9 = function(arg0) {
    var ret = getObject(arg0).height;
    return ret;
  };
  module.exports.__wbg_data_1ae7496c58caf755 = function(arg0, arg1) {
    var ret = getObject(arg1).data;
    var ptr0 = passArray8ToWasm0(ret, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  };
  module.exports.__wbg_newwithu8clampedarrayandsh_1b8c6e1bede43657 = function() {
    return handleError(function(arg0, arg1, arg2, arg3) {
      var ret = new ImageData(getClampedArrayU8FromWasm0(arg0, arg1), arg2 >>> 0, arg3 >>> 0);
      return addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbg_instanceof_CanvasRenderingContext2d_3abbe7ec7af32cae = function(arg0) {
    var ret = getObject(arg0) instanceof CanvasRenderingContext2D;
    return ret;
  };
  module.exports.__wbg_drawImage_9e2d13329d92a0a3 = function() {
    return handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
      getObject(arg0).drawImage(getObject(arg1), arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
    }, arguments);
  };
  module.exports.__wbg_getImageData_9ffc3df78ca3dbc9 = function() {
    return handleError(function(arg0, arg1, arg2, arg3, arg4) {
      var ret = getObject(arg0).getImageData(arg1, arg2, arg3, arg4);
      return addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbg_putImageData_b9544b271e569392 = function() {
    return handleError(function(arg0, arg1, arg2, arg3) {
      getObject(arg0).putImageData(getObject(arg1), arg2, arg3);
    }, arguments);
  };
  module.exports.__wbg_settextContent_799ebbf96e16265d = function(arg0, arg1, arg2) {
    getObject(arg0).textContent = arg1 === 0 ? void 0 : getStringFromWasm0(arg1, arg2);
  };
  module.exports.__wbg_appendChild_d318db34c4559916 = function() {
    return handleError(function(arg0, arg1) {
      var ret = getObject(arg0).appendChild(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbg_instanceof_HtmlCanvasElement_25d964a0dde6717e = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLCanvasElement;
    return ret;
  };
  module.exports.__wbg_width_555f63ab09ba7d3f = function(arg0) {
    var ret = getObject(arg0).width;
    return ret;
  };
  module.exports.__wbg_setwidth_c1a7061891b71f25 = function(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
  };
  module.exports.__wbg_height_7153faec70fbaf7b = function(arg0) {
    var ret = getObject(arg0).height;
    return ret;
  };
  module.exports.__wbg_setheight_88894b05710ff752 = function(arg0, arg1) {
    getObject(arg0).height = arg1 >>> 0;
  };
  module.exports.__wbg_getContext_f701d0231ae22393 = function() {
    return handleError(function(arg0, arg1, arg2) {
      var ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbg_newnoargs_be86524d73f67598 = function(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  module.exports.__wbg_call_888d259a5fefc347 = function() {
    return handleError(function(arg0, arg1) {
      var ret = getObject(arg0).call(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbindgen_object_clone_ref = function(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
  };
  module.exports.__wbg_self_c6fbdfc2918d5e58 = function() {
    return handleError(function() {
      var ret = self.self;
      return addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbg_window_baec038b5ab35c54 = function() {
    return handleError(function() {
      var ret = window.window;
      return addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbg_globalThis_3f735a5746d41fbd = function() {
    return handleError(function() {
      var ret = globalThis.globalThis;
      return addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbg_global_1bc0b39582740e95 = function() {
    return handleError(function() {
      var ret = commonjsGlobal.global;
      return addHeapObject(ret);
    }, arguments);
  };
  module.exports.__wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === void 0;
    return ret;
  };
  module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  };
  module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  module.exports.__wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
  };
  const path = require$$1$1.join(__dirname, "photon_rs_bg.wasm");
  const bytes = require$$0.readFileSync(path);
  const wasmModule = new WebAssembly.Module(bytes);
  const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
  wasm = wasmInstance.exports;
  module.exports.__wasm = wasm;
})(photon_rs$1);
var photon_rsExports = photon_rs$1.exports;
const photon_rs_default = /* @__PURE__ */ getDefaultExportFromCjs(photon_rsExports);
const photon_rs = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: photon_rs_default
}, [photon_rsExports]);
export {
  photon_rs as p
};
