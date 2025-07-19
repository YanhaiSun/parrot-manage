import { Form, Input, Button } from 'antd-mobile';
import { useEffect } from 'react';

export default function SpeciesForm({ onSubmit }) {
    const [form] = Form.useForm();

    useEffect(() => {
    }, []);

    const handleFinish = async (values) => {
        await onSubmit(values);
        form.resetFields();
    };

    return (
        <Form form={form} onFinish={handleFinish} layout="horizontal" footer={<Button color="primary" block type="submit">提交</Button>}>
            <Form.Item name="name" label="品种" rules={[{ required: true }]}>
                <Input placeholder="请输入品种名称" />
            </Form.Item>
        </Form>
    );
}
