import { List, Card, Space, Tag, Typography, Button, Empty, Popconfirm } from 'antd'
import { 
  FileTextOutlined, 
  CalendarOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilePdfOutlined
} from '@ant-design/icons'
import { Report } from '../types'
import './ReportView.css'

const { Text, Title, Paragraph } = Typography

interface ReportViewProps {
  reports: Report[]
}

const getReportIcon = (path: string) => {
  if (path.endsWith('.pdf')) {
    return <FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
  }
  return <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />
}

function ReportView({ reports }: ReportViewProps): JSX.Element {
  const handleViewReport = (report: Report) => {
    console.log('View report:', report)
  }

  const handleDeleteReport = (reportId: string) => {
    console.log('Delete report:', reportId)
  }

  return (
    <div className="report-view">
      <div className="report-header">
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Execution Reports
        </Title>
        <Text type="secondary">{reports.length} reports available</Text>
      </div>

      {reports.length === 0 ? (
        <Empty
          description="No reports yet. Run a task to generate reports."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ color: '#fff', marginTop: 60 }}
        />
      ) : (
        <List
          grid={{ 
            gutter: 16, 
            xs: 1, 
            sm: 2, 
            md: 2, 
            lg: 3, 
            xl: 3, 
            xxl: 4 
          }}
          dataSource={reports}
          renderItem={(report) => (
            <List.Item>
              <Card 
                className="report-card"
                hoverable
                actions={[
                  <Button 
                    key="view" 
                    type="text" 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewReport(report)}
                  >
                    View
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Delete this report?"
                    onConfirm={() => handleDeleteReport(report.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  avatar={<div className="report-icon">{getReportIcon(report.path)}</div>}
                  title={
                    <Text style={{ color: '#fff' }} ellipsis={{ tooltip: report.title }}>
                      {report.title}
                    </Text>
                  }
                  description={
                    <Space direction="vertical"  style={{ width: '100%' }}>
                      <div>
                        <CalendarOutlined style={{ marginRight: 4, color: 'rgba(255,255,255,0.5)' }} />
                        <Text type="secondary">
                          {new Date(report.createdAt).toLocaleString()}
                        </Text>
                      </div>
                      
                      {report.summary && (
                        <Paragraph 
                          type="secondary" 
                          ellipsis={{ rows: 2 }}
                          style={{ fontSize: 12, margin: 0 }}
                        >
                          {report.summary}
                        </Paragraph>
                      )}

                      <Tag color="blue" >
                        {report.path.split('.').pop()?.toUpperCase()}
                      </Tag>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  )
}

export default ReportView
