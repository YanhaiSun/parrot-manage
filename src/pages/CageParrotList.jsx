import React, { useEffect, useState } from 'react';
import {
    NavBar,
    List,
    Toast,
    FloatingBubble,
    Dialog,
    SwipeAction,
    Modal,
    SpinLoading,
    ErrorBlock,
} from 'antd-mobile';
import { useParams } from 'react-router-dom';
import { AddOutline } from 'antd-mobile-icons';
import {
    getParrotsByCageId,
    getSpeciesList,
    addParrot,
    updateParrot,
    deleteParrot,
    getCageById,
} from '../api';
import ParrotForm from '../components/ParrotForm.jsx';

export default function CageParrotList() {
    const { cageId } = useParams();
    const [parrots, setParrots] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editParrot, setEditParrot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentCage, setCurrentCage] = useState(null);

    const closeForm = () => {
        setShowForm(false);
        setEditParrot(null);
    };

    useEffect(() => {
        fetchAllData();
    }, [cageId]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // 并行获取所有数据
            const [parrotsRes, speciesRes, cageRes] = await Promise.all([
                getParrotsByCageId(cageId),
                getSpeciesList(),
                getCageById(cageId)
            ]);

            // 设置状态
            setParrots(parrotsRes.data || []);
            setSpeciesList(speciesRes.data || []);

            // 直接从 cageRes 获取笼子数据（不是 cages）
            setCurrentCage(cageRes.data);
        } catch (error) {
            Toast.show({ content: '获取数据失败' });
            console.error('获取数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddParrot = async (values) => {
        try {
            await addParrot({
                ...values,
                cageId: parseInt(cageId),
                // 确保使用当前笼子的品种
                species: currentCage?.location ? parseInt(currentCage.location) : values.species
            });
            Toast.show({ content: '添加成功' });
            closeForm();
            fetchAllData();
        } catch (error) {
            Toast.show({ content: '添加失败' });
            console.error('添加鹦鹉失败:', error);
        }
    };

    const handleUpdateParrot = async (values) => {
        try {
            await updateParrot(values.id, values);
            Toast.show({ content: '更新成功' });
            closeForm();
            fetchAllData();
        } catch (error) {
            Toast.show({ content: '更新失败' });
            console.error('更新鹦鹉失败:', error);
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
                } catch (error) {
                    Toast.show({ content: '删除失败' });
                    console.error('删除鹦鹉失败:', error);
                }
            },
        });
    };

    const renderDescription = (p) => {
        const speciesName = speciesList.find((s) => s.id === p.species)?.name || '未知';
        return `品种: ${speciesName}, 性别: ${p.gender}`;
    };

    return (
        <>
            <NavBar back="返回" onBack={() => window.history.back()}>
                {currentCage ?
                    `${speciesList.find(s => s.id === parseInt(currentCage.location))?.name || '未知'} - ${currentCage.cageCode}`
                    : '笼子详情'}
            </NavBar>

            {loading ? (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <SpinLoading style={{ '--size': '48px' }} color="primary" />
                </div>
            ) : parrots.length === 0 ? (
                <ErrorBlock
                    status="empty"
                    title={`${currentCage?.cageCode || '当前'}笼子中没有鹦鹉`}
                    description="添加一个试试看吧"
                />
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
                                    onClick: () => {
                                        setEditParrot(p);
                                        setShowForm(true);
                                    },
                                },
                                {
                                    key: 'delete',
                                    text: '删除',
                                    color: 'danger',
                                    onClick: () => handleDeleteParrot(p.id),
                                },
                            ]}
                        >
                            <List.Item description={renderDescription(p)}>
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
                onClick={() => {
                    setEditParrot(null);
                    setShowForm(true);
                }}
            >
                <AddOutline fontSize={32} />
            </FloatingBubble>

            <Dialog
                visible={showForm}
                content={
                    <ParrotForm
                        onSubmit={editParrot ? handleUpdateParrot : handleAddParrot}
                        initialValues={editParrot || {
                            cageId: parseInt(cageId),
                            species: currentCage?.location ? parseInt(currentCage.location) : undefined
                        }}
                        disableCageSelection={!editParrot}
                        forceSpecies={!editParrot ? currentCage?.location : undefined}
                    />
                }
                closeOnMaskClick={true}
                onClose={closeForm}
            />
        </>
    );
}