import React, { useEffect, useState } from 'react';
import {
    Toast,
    Dialog,
    Form,
    Input,
    Button,
    FloatingBubble,
    Modal,
    SpinLoading,
    ErrorBlock,
    Picker,
    SearchBar,
    Selector,
    InfiniteScroll,
    Card,
    Grid,
    Tag
} from 'antd-mobile';
import { AddOutline, FilterOutline } from 'antd-mobile-icons';
import {
    getCages,
    addCage,
    deleteCage,
    getSpeciesList,
    getCagesByLocation,
    searchCagesWithParrots
} from '../api';
import { useNavigate } from 'react-router-dom';

export default function CageManagement() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        records: [],
        total: 0,
        hasMore: true
    });
    const [filteredCages, setFilteredCages] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [speciesVisible, setSpeciesVisible] = useState(false);
    const [speciesValue, setSpeciesValue] = useState([]);
    const [form] = Form.useForm();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState([]);
    const [filterVisible, setFilterVisible] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 50;

    // 保存完整状态
    const savePageState = () => {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const state = {
            scrollPosition,
            data,
            filteredCages,
            page,
            searchText,
            selectedSpecies,
            timestamp: Date.now()
        };
        sessionStorage.setItem('cageList_state', JSON.stringify(state));
    };

    const restorePageState = () => {
        try {
            const savedState = sessionStorage.getItem('cageList_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                // 检查状态是否过期（5分钟内有效）
                if (Date.now() - state.timestamp < 5 * 60 * 1000) {
                    setData(state.data);
                    setFilteredCages(state.filteredCages);
                    setPage(state.page);
                    setSearchText(state.searchText || '');
                    setSelectedSpecies(state.selectedSpecies || []);

                    // 延迟恢复滚动位置
                    setTimeout(() => {
                        window.scrollTo(0, state.scrollPosition);
                    }, 100);

                    return true; // 表示成功恢复了状态
                }
                sessionStorage.removeItem('cageList_state');
            }
        } catch (error) {
            console.error('恢复页面状态失败:', error);
            sessionStorage.removeItem('cageList_state');
        }
        return false; // 表示没有恢复状态
    };

    useEffect(() => {
        // 尝试恢复状态，如果没有保存的状态则加载数据
        const restored = restorePageState();
        if (!restored) {
            fetchInitialData();
        } else {
            setLoading(false);
        }
        fetchSpecies();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await getCages(1, pageSize);
            setData({
                records: res.data.records,
                total: res.data.total,
                hasMore: res.data.records.length >= pageSize
            });
            setFilteredCages(res.data.records);
        } catch (error) {
            Toast.show({ content: '获取笼子列表失败' });
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecies = async () => {
        try {
            const res = await getSpeciesList();
            setSpeciesList(res.data || []);
        } catch {
            Toast.show({ content: '获取品种列表失败' });
        }
    };

    const handleSearch = async (value) => {
        setSearchText(value);
    };

    const handleSearchSubmit = async () => {
        if (searchText) {
            try {
                setLoading(true);
                setSelectedSpecies([]);
                const res = await searchCagesWithParrots(searchText);
                setFilteredCages(res.data || []);
            } catch (error) {
                Toast.show({ content: '搜索失败' });
            } finally {
                setLoading(false);
            }
        } else {
            setFilteredCages(data.records);
        }
    };

    const fetchFilteredCagesBySpecies = async () => {
        try {
            setLoading(true);
            if (selectedSpecies.length > 0) {
                const promises = selectedSpecies.map(speciesId =>
                    getCagesByLocation(speciesId)
                );
                const responses = await Promise.all(promises);
                let result = responses.flatMap(res => res.data || []);

                if (searchText) {
                    result = result.filter(cage =>
                        cage.cageCode.toLowerCase().includes(searchText.toLowerCase())
                    );
                }

                setFilteredCages(result);
            } else {
                setFilteredCages(data.records);
            }
        } catch (error) {
            Toast.show({ content: '获取筛选数据失败' });
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        try {
            const nextPage = page + 1;
            const res = await getCages(nextPage, pageSize);

            setData(prev => ({
                records: [...prev.records, ...res.data.records],
                total: res.data.total,
                hasMore: res.data.records.length >= pageSize
            }));

            if (selectedSpecies.length > 0) {
                fetchFilteredCagesBySpecies();
            } else if (searchText) {
                handleSearch(searchText);
            } else {
                setFilteredCages(prev => [...prev, ...res.data.records]);
            }

            setPage(nextPage);
        } catch (error) {
            Toast.show({ content: '加载更多失败' });
        }
    };

    const onFinish = async (values) => {
        try {
            await addCage(values);
            Toast.show({ content: '添加成功' });
            form.resetFields();
            setSpeciesValue([]);
            setShowForm(false);
            // 清除保存的状态，因为数据已改变
            sessionStorage.removeItem('cageList_state');
            const res = await getCages(1, pageSize);
            setData({
                records: res.data.records,
                total: res.data.total,
                hasMore: res.data.records.length >= pageSize
            });
            setFilteredCages(res.data.records);
            setPage(1);
            setSelectedSpecies([]);
            setSearchText('');
        } catch {
            Toast.show({ content: '添加失败' });
        }
    };

    const handleDeleteCage = async (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个笼子吗？所有相关鹦鹉所属笼子将会被清空。',
            onConfirm: async () => {
                try {
                    await deleteCage(id);
                    Toast.show({ content: '删除成功' });
                    // 清除保存的状态，因为数据已改变
                    sessionStorage.removeItem('cageList_state');
                    const res = await getCages(page, pageSize);
                    setData({
                        records: res.data.records,
                        total: res.data.total,
                        hasMore: res.data.records.length >= pageSize
                    });

                    if (selectedSpecies.length > 0) {
                        fetchFilteredCagesBySpecies();
                    } else if (searchText) {
                        handleSearch(searchText);
                    } else {
                        setFilteredCages(res.data.records);
                    }
                } catch {
                    Toast.show({ content: '删除失败' });
                }
            },
        });
    };

    const handleFilterChange = (value) => {
        setSelectedSpecies(value);
    };

    const handleFilterConfirm = () => {
        setFilterVisible(false);
        if (selectedSpecies.length > 0) {
            fetchFilteredCagesBySpecies();
        } else {
            setFilteredCages(data.records);
        }
    };

    const hanleOnClear = () => {
        setSelectedSpecies([]);
        setFilteredCages(data.records);
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
                    <SpinLoading style={{ '--size': '48px' }} color="primary" />
                </div>
            ) : (
                <>
                    <div style={{
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        backgroundColor: '#fff',
                    }}>
                        <SearchBar
                            placeholder="搜索笼子编号"
                            onSearch={handleSearchSubmit}
                            onChange={handleSearch}
                            onClear={hanleOnClear}
                            value={searchText}
                            style={{ width: '100%' }}
                        />

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1px'
                        }}>
                            <Button
                                size='small'
                                onClick={() => setFilterVisible(true)}
                            >
                                <FilterOutline />
                            </Button>
                        </div>
                    </div>

                    {filteredCages.length === 0 ? (
                        <ErrorBlock
                            status="empty"
                            title="没有找到笼子"
                            description={data.records.length === 0 ? "快添加一个吧" : "请调整搜索条件"}
                        />
                    ) : (
                        <>
                            <div style={{ padding: '12px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <span style={{ fontWeight: 'bold' }}>笼子列表</span>
                                    <span style={{ color: '#888', fontSize: '14px'}}>
                                        总计: {data.total}个 | 查询出：{filteredCages.length}个
                                    </span>
                                </div>

                                {/* 修改为长方形卡片布局 */}
                                <Grid columns={5} gap={8} style={{ '--gap-vertical': '12px' }}>
                                    {filteredCages.map((cage) => (
                                        <Grid.Item key={cage.id}>
                                            <div
                                                onLongPress={() => handleDeleteCage(cage.id)}
                                                onClick={() => {
                                                    savePageState();
                                                    navigate(`/parrot-web/cage/${cage.id}/parrots`);
                                                }}
                                                style={{
                                                    touchAction: 'manipulation' // 改善移动端触摸体验
                                                }}
                                            >
                                                <Card
                                                    onClick={() => {
                                                        savePageState();
                                                        navigate(`/parrot-web/cage/${cage.id}/parrots`);
                                                    }}
                                                    style={{
                                                        '--background-color': cage.parrotCount > 0 ? '#e6f7e6' : '#f0f0f0',
                                                        '--border-radius': '8px',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                                                        padding: 0,
                                                        height: '100%',
                                                        minHeight: '80px' // 设置最小高度
                                                    }}
                                                    bodyStyle={{
                                                        padding: '8px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        textAlign: 'center'
                                                    }}>
                                                        {speciesList.find(s => s.id === parseInt(cage.location))?.name || '未知'}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
                                                        textAlign: 'center',
                                                        margin: '4px 0'
                                                    }}>
                                                        {cage.cageCode}
                                                    </div>
                                                    <Tag
                                                        color={cage.parrotCount > 0 ? '#dbfbca' : '#c3c3c3'}
                                                        style={{
                                                            alignSelf: 'center',
                                                            '--text-color': cage.parrotCount > 0 ? '#266705' : '#eceaea'
                                                        }}
                                                    >
                                                        {cage.parrotCount || 0}只
                                                    </Tag>
                                                </Card>
                                            </div>
                                        </Grid.Item>
                                    ))}
                                </Grid>
                            </div>

                            {selectedSpecies.length === 0 && !searchText && (
                                <InfiniteScroll
                                    loadMore={loadMore}
                                    hasMore={data.hasMore}
                                    threshold={100}
                                />
                            )}
                        </>
                    )}
                </>
            )}

            {/* 筛选弹窗 */}
            <Dialog
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                closeOnMaskClick={true}
                title="筛选条件"
                content={
                    <div style={{ padding: '12px 0' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ marginBottom: '8px', color: 'var(--adm-color-text)' }}>品种</div>
                            <Selector
                                options={speciesList.map(s => ({
                                    label: s.name,
                                    value: s.id
                                }))}
                                multiple
                                value={selectedSpecies}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <Button
                            block
                            color='primary'
                            onClick={handleFilterConfirm}
                        >
                            确定
                        </Button>
                    </div>
                }
            />

            {/* 添加笼子弹窗 */}
            <Dialog
                visible={showForm}
                onClose={() => setShowForm(false)}
                closeOnMaskClick
                content={
                    <Form
                        form={form}
                        onFinish={onFinish}
                        footer={
                            <Button block type="submit" color="primary">
                                添加笼子
                            </Button>
                        }
                    >
                        <Form.Item name="cageCode" label="笼子编号" rules={[{ required: true }]}>
                            <Input placeholder="请输入笼子编号" />
                        </Form.Item>
                        <Form.Item
                            name="location"
                            label="品种"
                            rules={[{ required: true, message: '请选择品种' }]}
                            onClick={() => setSpeciesVisible(true)}
                        >
                            {speciesValue.length > 0
                                ? speciesList.find(s => s.id === speciesValue[0])?.name || '请选择品种'
                                : '请选择品种'}
                            <Picker
                                columns={[speciesList.map(species => ({ label: species.name, value: species.id }))]}
                                visible={speciesVisible}
                                value={speciesValue}
                                onClose={() => setSpeciesVisible(false)}
                                onConfirm={(v) => {
                                    setSpeciesValue(v);
                                    form.setFieldsValue({ location: v[0] });
                                    setSpeciesVisible(false);
                                }}
                            />
                        </Form.Item>
                    </Form>
                }
            />

            <FloatingBubble
                style={{ '--initial-position-bottom': '80px', '--initial-position-right': '24px' }}
                onClick={() => setShowForm(true)}
            >
                <AddOutline fontSize={32} />
            </FloatingBubble>
        </>
    );
}