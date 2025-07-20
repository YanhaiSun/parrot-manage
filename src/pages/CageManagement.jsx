import React, {useEffect, useState} from 'react';
import {
    List,
    NavBar,
    Toast,
    Dialog,
    Form,
    Input,
    Button,
    FloatingBubble,
    SwipeAction, Modal,
} from 'antd-mobile';
import {AddOutline} from 'antd-mobile-icons';
import {getCages, addCage, deleteCage} from '../api';

export default function CageManagement() {
    const [cages, setCages] = useState([]);
    const [form] = Form.useForm();
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchCages();
    }, []);

    const fetchCages = async () => {
        try {
            const res = await getCages();
            setCages(res.data);
        } catch (error) {
            Toast.show({content: '获取笼子列表失败'});
        }
    };

    const onFinish = async (values) => {
        try {
            await addCage(values);
            Toast.show({content: '添加成功'});
            form.resetFields();
            setShowForm(false); // 关闭弹窗
            fetchCages(); // 刷新数据
        } catch {
            Toast.show({content: '添加失败'});
        }
    };

    const handleDeleteCage = async (id) => {
        try {
            Modal.confirm({
                    title: '确认删除',
                    content: '确定要删除这个笼子吗？所有相关鹦鹉所属笼子将会被清空。',
                    onConfirm: async () => {
                        await deleteCage(id);
                        Toast.show({content: '删除成功'});
                        fetchCages();
                    }
                }
            );
        } catch (error) {
            Toast.show({content: '删除失败'});
        }
    };

    return (
        <>
            <NavBar backIcon={false}>笼子管理</NavBar>

            <List header="笼子列表">
                {cages.map((c) => (
                    <SwipeAction
                        key={c.id}
                        rightActions={[
                            {
                                key: 'delete',
                                text: '删除',
                                color: 'danger',
                                onClick: () => handleDeleteCage(c.id),
                            },
                        ]}
                    >
                        <List.Item
                            description={`位置: ${c.location}`}
                            onClick={() => {
                                window.location.href = `/cage/${c.id}/parrots`; // 例如跳转到 /cage/123/parrots
                            }}
                        >
                            {c.cageCode}
                        </List.Item>

                    </SwipeAction>
                ))}
            </List>

            {/* 右下角浮动按钮 */}
            <FloatingBubble
                style={{'--initial-position-bottom': '80px', '--initial-position-right': '24px'}}
                onClick={() => setShowForm(true)}
            >
                <AddOutline fontSize={32}/>
            </FloatingBubble>

            {/* Dialog 弹出表单 */}
            <Dialog
                visible={showForm}
                onClose={() => setShowForm(false)}
                closeOnMaskClick
                content={
                    <Form
                        form={form}
                        onFinish={onFinish}
                        footer={<Button block type="submit" color="primary">添加笼子</Button>}
                    >
                        <Form.Item name="cageCode" label="笼子编号" rules={[{required: true}]}>
                            <Input placeholder="请输入笼子编号"/>
                        </Form.Item>
                        <Form.Item name="location" label="位置" rules={[{required: true}]}>
                            <Input placeholder="请输入位置"/>
                        </Form.Item>
                        {/*<Form.Item name="capacity" label="容量" rules={[{ required: true }]}>*/}
                        {/*    <Input type="number" placeholder="请输入容量" />*/}
                        {/*</Form.Item>*/}
                    </Form>
                }
            />
        </>
    );
}
