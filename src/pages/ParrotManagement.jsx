import React, { useEffect, useState } from 'react';
import {
    List,
    NavBar,
    Toast,
    Dialog,
    FloatingBubble,
    SwipeAction,
    Button, Modal,
} from 'antd-mobile';
import { AddOutline, EditSOutline } from 'antd-mobile-icons';
import ParrotForm from '../components/ParrotForm';
import { getParrots, addParrot, getCages, deleteParrot, getSpeciesList, updateParrot } from '../api';

export default function ParrotManagement() {
    const [parrots, setParrots] = useState([]);
    const [cages, setCages] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editParrot, setEditParrot] = useState(null); // 编辑时的鹦鹉数据

    useEffect(() => {
        fetchParrots();
        fetchCage();
        fetchSpecies();
    }, []);

    const fetchParrots = async () => {
        try {
            const res = await getParrots();
            setParrots(res.data);
        } catch {
            Toast.show({ content: '获取鹦鹉列表失败' });
        }
    };

    const fetchCage = async () => {
        try {
            const res = await getCages();
            setCages(res.data);
        } catch {
            Toast.show({ content: '获取笼子列表失败' });
        }
    };

    const fetchSpecies = async () => {
        try {
            const res = await getSpeciesList();
            setSpeciesList(res.data);
        } catch {
            Toast.show({ content: '获取品种列表失败' });
        }
    };

    const handleAddParrot = async (data) => {
        try {
            await addParrot(data);
            Toast.show({ content: '添加成功' });
            setShowForm(false);
            fetchParrots();
        } catch {
            Toast.show({ content: '添加失败' });
        }
    };

    const handleUpdateParrot = async (data) => {
        try {
            await updateParrot(editParrot.id, data);
            Toast.show({ content: '更新成功' });
            setShowForm(false);
            setEditParrot(null);
            fetchParrots();
        } catch {
            Toast.show({ content: '更新失败' });
        }
    };

    const handleDeleteParrot = async (id) => {
        Modal.confirm({
            content: '确定要删除这只鹦鹉吗？',
            onConfirm: async () => {
                try {
                    await deleteParrot(id);
                    Toast.show({ content: '删除成功' });
                    fetchParrots();
                } catch {
                    Toast.show({ content: '删除失败' });
                }
            }
        });
    };

    // 打开编辑弹窗
    const openEditForm = (parrot) => {
        setEditParrot(parrot);
        setShowForm(true);
    };

    // 关闭弹窗时清空编辑状态
    const closeForm = () => {
        setShowForm(false);
        setEditParrot(null);
    };

    return (
        <>
            <NavBar backIcon={false}>鹦鹉管理</NavBar>

            <List header="鹦鹉列表">
                {parrots.map((p) => (
                    <SwipeAction
                        key={p.id}
                        rightActions={[
                            {
                                key: 'edit',
                                text: '编辑',
                                color: 'primary',
                                onClick: () => openEditForm(p),
                            },
                            {
                                key: 'delete',
                                text: '删除',
                                color: 'danger',
                                onClick: () => handleDeleteParrot(p.id),
                            },
                        ]}
                    >
                        <List.Item
                            description={`品种: ${speciesList.find(s => s.id === p.species)?.name || '未知品种'}, 性别: ${p.gender}, 笼子: ${cages.find(c => c.id === p.cageId)?.cageCode || '未分配'}`}
                        >
                            {p.ringNumber}
                        </List.Item>
                    </SwipeAction>
                ))}
            </List>


            <FloatingBubble
                style={{ '--initial-position-bottom': '80px', '--initial-position-right': '24px' }}
                onClick={() => setShowForm(true)}
            >
                <AddOutline fontSize={32} />
            </FloatingBubble>

            <Dialog
                visible={showForm}
                onClose={closeForm}
                content={
                    <ParrotForm
                        onSubmit={editParrot ? handleUpdateParrot : handleAddParrot}
                        initialValues={editParrot || {}}
                    />
                }
                closeOnMaskClick={true}
            />
        </>
    );
}
