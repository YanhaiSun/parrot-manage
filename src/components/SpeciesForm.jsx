import { Form, Input, Button } from 'antd-mobile';
import { useEffect } from 'react';

export default function SpeciesForm({ onSubmit, initialValues }) {
    const [form] = Form.useForm();

    useEffect(() => {
        // 当initialValues变化时，重置表单值
        if (initialValues) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    const handleFinish = async (values) => {
        await onSubmit(values);
        // 只有在添加新记录时才重置表单
        if (!initialValues) {
            form.resetFields();
        }
    };

    return (
        <Form
            form={form}
            onFinish={handleFinish}
            layout="horizontal"
            footer={
                <Button color="primary" block type="submit">
                    {initialValues ? '更新' : '提交'}
                </Button>
            }
        >
            <Form.Item
                name="name"
                label="品种名称"
                rules={[
                    { required: true, message: '请输入品种名称' },
                    { max: 20, message: '名称不能超过20个字符' }
                ]}
            >
                <Input placeholder="请输入品种名称" clearable />
            </Form.Item>
        </Form>
    );
}
