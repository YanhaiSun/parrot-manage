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
    Button,
    Space,
} from 'antd-mobile';
import { useParams, useNavigate } from 'react-router-dom';
import { AddOutline, LeftOutline, RightOutline } from 'antd-mobile-icons';
import {
    getParrotsByCageId,
    getSpeciesList,
    addParrot,
    updateParrot,
    deleteParrot,
    getCageById,
    getCagesWithParrotCountAll,
} from '../api';
import ParrotForm from '../components/ParrotForm.jsx';

export default function CageParrotList() {
    const { cageId } = useParams();
    const navigate = useNavigate();
    const [parrots, setParrots] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editParrot, setEditParrot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentCage, setCurrentCage] = useState(null);
    const [allCages, setAllCages] = useState([]);
    const [currentCageIndex, setCurrentCageIndex] = useState(-1);

    const closeForm = () => {
        setShowForm(false);
        setEditParrot(null);
    };

    useEffect(() => {
        fetchAllData();
        // 清理掉已使用的状态，避免下次误用
        const clearStateTimer = setTimeout(() => {
            sessionStorage.removeItem('cageList_state');
        }, 1000);

        return () => clearTimeout(clearStateTimer);
    }, [cageId]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // 并行获取所有数据
            const [parrotsRes, speciesRes, cageRes, allCagesRes] = await Promise.all([
                getParrotsByCageId(cageId),
                getSpeciesList(),
                getCageById(cageId),
                getCagesWithParrotCountAll()
            ]);

            // 设置状态
            setParrots(parrotsRes.data || []);
            setSpeciesList(speciesRes.data || []);
            setCurrentCage(cageRes.data);

            // 设置所有笼子列表并找到当前笼子的索引
            const cages = allCagesRes.data || [];
            // 先按品种(location)排序，再按笼子编号(cageCode)排序
            cages.sort((a, b) => {
                // 首先按品种ID排序
                const locationCompare = a.location - b.location;
                if (locationCompare !== 0) {
                    return locationCompare;
                }
                // 品种相同时，按笼子编号排序
                return a.cageCode.localeCompare(b.cageCode, undefined, { numeric: true });
            });
            setAllCages(cages);

            // 找到当前笼子在列表中的索引
            const currentIndex = cages.findIndex(cage => cage.id === parseInt(cageId));
            setCurrentCageIndex(currentIndex);
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

    // 导航到上一个笼子
    const goToPreviousCage = () => {
        if (currentCageIndex > 0) {
            const previousCage = allCages[currentCageIndex - 1];
            navigate(`/parrot-web/cage/${previousCage.id}/parrots`);
        }
    };

    // 导航到下一个笼子
    const goToNextCage = () => {
        if (currentCageIndex < allCages.length - 1) {
            const nextCage = allCages[currentCageIndex + 1];
            navigate(`/parrot-web/cage/${nextCage.id}/parrots`);
        }
    };

    const renderDescription = (p) => {
        const speciesName = speciesList.find((s) => s.id === p.species)?.name || '未知';
        return `品种: ${speciesName}, 性别: ${p.gender}`;
    };

    return (
        <>
            <NavBar
                back="返回"
                onBack={() => navigate('/parrot-web/cages')}
                right={
                    <Space>
                        <Button
                            size='small'
                            fill='none'
                            onClick={goToPreviousCage}
                            disabled={currentCageIndex <= 0}
                            style={{ padding: '0 8px' }}
                        >
                            <LeftOutline />
                        </Button>
                        <span style={{ fontSize: '12px', color: '#999' }}>
                            {currentCageIndex + 1}/{allCages.length}
                        </span>
                        <Button
                            size='small'
                            fill='none'
                            onClick={goToNextCage}
                            disabled={currentCageIndex >= allCages.length - 1}
                            style={{ padding: '0 8px' }}
                        >
                            <RightOutline />
                        </Button>
                    </Space>
                }
            >
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
                title={editParrot ? '编辑鹦鹉' : '添加鹦鹉'}
                content={
                    showForm && ( // 添加条件渲染
                        <ParrotForm
                            key={editParrot ? `edit-${editParrot.id}` : 'create'} // 添加 key 强制重新渲染
                            onSubmit={editParrot ? handleUpdateParrot : handleAddParrot}
                            initialValues={editParrot ? {
                                ...editParrot,
                                species: editParrot.species,
                                gender: editParrot.gender,
                                cageId: editParrot.cageId
                            } : {
                                ringNumber: '', // 明确设置空值
                                species: currentCage?.location ? parseInt(currentCage.location) : undefined,
                                gender: undefined,
                                cageId: parseInt(cageId)
                            }}
                            disableCageSelection={!editParrot}
                            forceSpecies={!editParrot ? currentCage?.location : undefined}
                            speciesList={speciesList}
                            cages={allCages}
                            currentCage={currentCage}
                        />
                    )
                }
                closeOnMaskClick={true}
                onClose={closeForm}
            />
        </>
    );
}