import React, { useEffect, useState } from 'react';
import {NavBar, SearchBar, List, Toast, SpinLoading, ErrorBlock, SwipeAction, Dialog, Modal} from 'antd-mobile';
import {
    addParrot,
    deleteParrot,
    getAllCages,
    getCages,
    getParrots,
    getSpeciesList,
    searchParrotsByRing, updateParrot
} from '../api/index.js';
import ParrotForm from "../components/ParrotForm.jsx";

export default function SearchParrot() {
    const [searchKey, setSearchKey] = useState('');
    const [results, setResults] = useState([]);
    const [cages, setCages] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editParrot, setEditParrot] = useState(null);


    // 初始化笼子列表
    useEffect(() => {
        fetchCages();
        fetchSpeciesList();
    }, []);

    const fetchCages = async () => {
        setLoading(true);
        try {
            const res = await getAllCages();
            console.log('Fetched cages:', res.data)
            setCages(Array.isArray(res?.data) ? res.data : []);
        } catch {
            Toast.show({ content: '获取笼子列表失败' });
        }
        setLoading(false);
    };

    const fetchSpeciesList = async () => {
        setLoading(true);
        try {
            const res = await getSpeciesList();
            setSpeciesList(Array.isArray(res?.data) ? res.data : []);
        } catch {
            Toast.show({ content: '获取品种列表失败' });
        }
        setLoading(false);
    }

    function renderCageDisplay(cageId) {
        if (!Array.isArray(cages) || !cageId) return '未知';

        const cage = cages.find(c => c.id === cageId);
        if (!cage) return '未知';

        const species = Array.isArray(speciesList)
            ? speciesList.find(s => s.id === parseInt(cage.location))
            : null;
        const speciesName = species?.name || '未知';

        return `${speciesName}-${cage.cageCode || '未知'}`;
    }

    const onSearch = async () => {
        if (!searchKey.trim()) {
            Toast.show('请输入脚环号关键字');
            return;
        }
        setLoading(true);
        try {
            const res = await searchParrotsByRing(searchKey);
            setResults(Array.isArray(res?.data) ? res.data : []);
        } catch {
            Toast.show('查询失败');
        }
        setLoading(false);
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

    const openEditForm = (parrot) => {
        console.log('Open edit form for parrot:', parrot)
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

    const handleDeleteParrot = async (id) => {
        Modal.confirm({
            content: '确定要删除这只鹦鹉吗？',
            onConfirm: async () => {
                try {
                    await deleteParrot(id);
                    Toast.show({ content: '删除成功' });
                    // 删除后重新加载当前页
                    const res = await searchParrotsByRing(searchKey);
                    setResults(Array.isArray(res?.data) ? res.data : []);
                } catch {
                    Toast.show({ content: '删除失败' });
                }
            },
        });
    };

    const handleAddParrot = async (data) => {
        try {
            await addParrot(data);
            Toast.show({ content: '添加成功' });
            setShowForm(false);
            const res =  await searchParrotsByRing(searchKey);
            // 修改这里：list -> records
            setResults(Array.isArray(res?.data) ? res.data : []);
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
            const res = await searchParrotsByRing(searchKey);
            setResults(Array.isArray(res?.data) ? res.data : []);
        } catch {
            Toast.show({ content: '更新失败' });
        }
    };


    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div
                style={{
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                    flexShrink: 0
                }}
            >
                <SearchBar
                    placeholder="输入脚环号模糊搜索"
                    value={searchKey}
                    onChange={(val) => setSearchKey(val)}
                    onSearch={onSearch}
                    showCancelButton
                />
            </div>

            {loading ? (
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <SpinLoading style={{ '--size': '48px' }} color="primary" />
                </div>
            ) : results.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ErrorBlock status="empty" title={"没有搜索到需要的鹦鹉"} />
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 70 }}>
                    <List>
                        {results.map((p) => (
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
                                    key={p.id}
                                    // description={`品种: ${p.species ? (Array.isArray(speciesList) ? speciesList.find((s) => s.id === p.species)?.name : '未知') : '未知'}, 性别: ${p.gender || '未知'}, 笼子:
                                    //     ${p.cageId ? renderCageDisplay(p.cageId) : '未知'
                                    // }`}
                                    description={renderDescription(p)}
                                >
                                    {p.ringNumber}
                                </List.Item>
                            </SwipeAction>
                        ))}
                    </List>
                </div>
            )}

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
        </div>
    );
}