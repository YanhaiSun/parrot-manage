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
    SpinLoading,
    ErrorBlock,
    InfiniteScroll,
    Badge
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
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 50;

    // 预加载基础数据
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [cagesRes, speciesRes] = await Promise.all([
                    getCages(),
                    getSpeciesList(),
                ]);
                setCages(cagesRes.data.records || cagesRes.data.list);
                setSpeciesList(speciesRes.data);
            } catch {
                Toast.show({ content: '获取基础数据失败' });
            }
        };
        fetchInitialData();
    }, []);

    // 加载鹦鹉数据
    useEffect(() => {
        if (speciesList.length > 0) {
            fetchParrotData();
        }
    }, [speciesList]);

    const fetchParrotData = async () => {
        try {
            const parrotsRes = await getParrots(1, pageSize);
            setParrots(parrotsRes.data.records);
            setTotal(parrotsRes.data.total);
            setHasMore(parrotsRes.data.current < parrotsRes.data.pages);
        } catch {
            Toast.show({ content: '获取鹦鹉数据失败' });
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        try {
            const nextPage = page + 1;
            const res = await getParrots(nextPage, pageSize);
            setParrots([...parrots, ...res.data.records]);
            setPage(nextPage);
            setHasMore(res.data.current < res.data.pages);
        } catch (error) {
            Toast.show({ content: '加载更多失败' });
        }
    };

    const handleAddParrot = async (data) => {
        try {
            await addParrot(data);
            Toast.show({ content: '添加成功' });
            setShowForm(false);
            const res = await getParrots(1, pageSize);
            setParrots(res.data.records);
            setTotal(res.data.total);
            setPage(1);
            setHasMore(res.data.current < res.data.pages);
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
            const res = await getParrots(page, pageSize);
            setParrots(res.data.records);
            setTotal(res.data.total);
            setHasMore(res.data.current < res.data.pages);
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
                    const res = await getParrots(page, pageSize);
                    setParrots(res.data.records);
                    setTotal(res.data.total);
                    setHasMore(res.data.current < res.data.pages);
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
        setEditParrot({
            ...parrot,
            species: parrot.species,
            gender: parrot.gender,
            cageId: parrot.cageId
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        // 延迟100ms清空表单，确保弹窗完全关闭后再执行
        setTimeout(() => {
            setEditParrot(null);
        }, 500);
    };

    const renderDescription = (parrot) => {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <div>品种：{speciesList.find(s => s.id === parrot.species)?.name || '未知'}</div>
                <div>性别：{parrot.gender}</div>
                <div>笼子：{renderCageDisplay(parrot.cageId)}</div>
            </div>
        );
    }

    return (
        <>
            {loading ? (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <SpinLoading style={{ '--size': '48px' }} color='primary' />
                </div>
            ) : parrots.length === 0 ? (
                <ErrorBlock status='empty' title={"没有鹦鹉数据"} description={"快添加一个吧"}/>
            ) : (
                <>
                    <List header={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>鹦鹉列表</span>
                            <span style={{ color: '#888', fontSize: '14px' }}>
                                总计{total}只鹦鹉
                            </span>
                        </div>
                    }>
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
                                    description={renderDescription(p)}
                                >
                                    {p.ringNumber}
                                </List.Item>
                            </SwipeAction>
                        ))}
                    </List>
                    <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
                </>
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
                title={editParrot ? '编辑鹦鹉' : '添加鹦鹉'}
                content={
                    <ParrotForm
                        key={editParrot?.id || 'create'}
                        onSubmit={editParrot ? handleUpdateParrot : handleAddParrot}
                        initialValues={editParrot ? {
                            ...editParrot,
                            species: editParrot.species,
                            gender: editParrot.gender,
                            cageId: editParrot.cageId
                        } : {}}
                        speciesList={speciesList}
                        cages={cages}
                    />
                }
                closeOnMaskClick={true}
            />
        </>
    );
}