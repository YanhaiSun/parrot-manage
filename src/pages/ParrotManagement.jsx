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
    const pageSize = 50; // 每页数量

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [parrotsRes, cagesRes, speciesRes] = await Promise.all([
                getParrots(1, pageSize),
                getCages(),
                getSpeciesList(),
            ]);
            setParrots(parrotsRes.data.records); // 修改这里：list -> records
            setTotal(parrotsRes.data.total);
            setCages(cagesRes.data.records || cagesRes.data.list); // 兼容两种格式
            setSpeciesList(speciesRes.data);
            setHasMore(parrotsRes.data.current < parrotsRes.data.pages); // 修改这里：hasNextPage -> current < pages
        } catch {
            Toast.show({ content: '获取数据失败' });
        } finally {
            setLoading(false);
        }
    };

    // 加载更多数据
    const loadMore = async () => {
        try {
            const nextPage = page + 1;
            const res = await getParrots(nextPage, pageSize);
            setParrots([...parrots, ...res.data.records]); // 修改这里：list -> records
            setPage(nextPage);
            setHasMore(res.data.current < res.data.pages); // 修改这里：hasNextPage -> current < pages
        } catch (error) {
            Toast.show({ content: '加载更多失败' });
        }
    };

    const handleAddParrot = async (data) => {
        try {
            await addParrot(data);
            Toast.show({ content: '添加成功' });
            setShowForm(false);
            // 添加后重新加载第一页
            const res = await getParrots(1, pageSize);
            setParrots(res.data.records); // 修改这里：list -> records
            setTotal(res.data.total);
            setPage(1);
            setHasMore(res.data.current < res.data.pages); // 修改这里：hasNextPage -> current < pages
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
            // 更新后重新加载当前页
            const res = await getParrots(page, pageSize);
            setParrots(res.data.records); // 修改这里：list -> records
            setTotal(res.data.total);
            setHasMore(res.data.current < res.data.pages); // 修改这里：hasNextPage -> current < pages
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
                    // 删除后重新加载当前页
                    const res = await getParrots(page, pageSize);
                    setParrots(res.data.records); // 修改这里：list -> records
                    setTotal(res.data.total);
                    setHasMore(res.data.current < res.data.pages); // 修改这里：hasNextPage -> current < pages
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
                                    description={`品种: ${speciesList.find(s => s.id === p.species)?.name || '未知'}, 性别: ${p.gender}, 笼子: ${p.cageId ? renderCageDisplay(p.cageId) : '未知'}`}
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
