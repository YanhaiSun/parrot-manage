import React, { useEffect, useState } from 'react';
import {
    List,
    NavBar,
    Toast,
    Dialog,
    FloatingBubble,
    SwipeAction,
    Button,
    Modal,
    SpinLoading, ErrorBlock,
} from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import ParrotForm from '../components/ParrotForm';
import {
    getParrots,
    addParrot,
    getCages,
    deleteParrot,
    getSpeciesList,
    updateParrot
} from '../api';

export default function ParrotManagement() {
    const [parrots, setParrots] = useState([]);
    const [cages, setCages] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editParrot, setEditParrot] = useState(null);
    const [loading, setLoading] = useState(true); // 加载状态

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [parrotsRes, cagesRes, speciesRes] = await Promise.all([
                getParrots(),
                getCages(),
                getSpeciesList(),
            ]);
            setParrots(parrotsRes.data);
            setCages(cagesRes.data);
            setSpeciesList(speciesRes.data);
        } catch {
            Toast.show({ content: '获取数据失败' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddParrot = async (data) => {
        try {
            await addParrot(data);
            Toast.show({ content: '添加成功' });
            setShowForm(false);
            fetchAllData();
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
            fetchAllData();
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
                    fetchAllData();
                } catch {
                    Toast.show({ content: '删除失败' });
                }
            },
        });
    };

    function renderCageDisplay(cageId) {
        const cage = cages.find(c => c.id === cageId);
        if (!cage) return '无效笼子';
        const speciesName = speciesList.find(s => s.id === parseInt(cage.location))?.name || '未知';
        return `${speciesName}-${cage.cageCode}`;
    }

    const openEditForm = (parrot) => {
        setEditParrot(parrot);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditParrot(null);
    };

    return (
        <>
            {loading ? (
                <div
                    style={{
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <SpinLoading style={{ '--size': '48px' }} color='primary' />
                </div>
            ) : parrots.length === 0 ? (
                <ErrorBlock status='empty' title={"没有鹦鹉数据"} description={"快添加一个吧"}/>
            ) : (
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
                                description={`品种: ${speciesList.find(s => s.id === p.species)?.name || '未知'}, 性别: ${p.gender}, 笼子: ${p.cageId ? renderCageDisplay(p.cageId) : '未知'}`}
                            >
                                {p.ringNumber}
                            </List.Item>
                        </SwipeAction>
                    ))}
                </List>
            )}

            <FloatingBubble
                style={{
                    '--initial-position-bottom': '80px',
                    '--initial-position-right': '24px',
                }}
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
