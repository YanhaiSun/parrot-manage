import React, { useEffect, useState } from 'react';
import {
    List,
    Toast,
    Dialog,
    Form,
    Input,
    Button,
    FloatingBubble,
    SwipeAction,
    Modal,
    SpinLoading,
    ErrorBlock,
    Picker,
    SearchBar,
    Selector,
    InfiniteScroll,
    Badge
} from 'antd-mobile';
import { AddOutline, FilterOutline } from 'antd-mobile-icons';
import { getCages, addCage, deleteCage, getSpeciesList, getCagesByLocation, searchCages } from '../api';

export default function CageManagement() {
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

    useEffect(() => {
        fetchInitialData();
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
        // 移除这里的自动搜索逻辑
    };

    const handleSearchSubmit = async () => {
        if (searchText) {
            try {
                setLoading(true);
                // 搜索时清除筛选数据
                setSelectedSpecies([]);
                const res = await searchCages(searchText);
                setFilteredCages(res.data || []);
            } catch (error) {
                Toast.show({ content: '搜索失败' });
            } finally {
                setLoading(false);
            }
        } else {
            // 搜索框为空时恢复显示所有笼子
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

                // 如果有搜索文本，再进行本地过滤
                if (searchText) {
                    result = result.filter(cage =>
                        cage.cageCode.toLowerCase().includes(searchText.toLowerCase())
                    );
                }

                setFilteredCages(result);
            } else {
                // 没有选择品种时，显示所有笼子
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

            // 更新过滤结果
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
            // 添加后重新加载第一页
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
                    // 删除后重新加载当前页
                    const res = await getCages(page, pageSize);
                    setData({
                        records: res.data.records,
                        total: res.data.total,
                        hasMore: res.data.records.length >= pageSize
                    });

                    // 更新过滤结果
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
            // 如果没有选择品种，则显示所有笼子
            setFilteredCages(data.records);
        }
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
                            onSearch={handleSearchSubmit}  // 仅在回车时触发
                            onChange={handleSearch}       // 仅更新搜索文本状态
                            value={searchText}
                            style={{ width: '100%' }}
                        />


                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1px'
                        }}>
                            {/*<Badge content={`总计: ${data.total}`} color='primary' />*/}
                            <Button
                                size='small'
                                onClick={() => setFilterVisible(true)}
                                // style={{ '--border-radius': '20px' }}
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
                            <List header={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>笼子列表</span>
                                    <span style={{ color: '#888', fontSize: '14px'}}>
                                        总计: {data.total}个笼子
                                    </span>
                                </div>
                            }>
                                {filteredCages.map((c) => (
                                    <SwipeAction
                                        key={c.id}
                                        rightActions={[{
                                            key: 'delete',
                                            text: '删除',
                                            color: 'danger',
                                            onClick: () => handleDeleteCage(c.id),
                                        }]}
                                    >
                                        <List.Item
                                            onClick={() => {
                                                window.location.href = `/parrot-web/cage/${c.id}/parrots`;
                                            }}
                                            description={`品种: ${c.location ? speciesList.find(s => s.id === parseInt(c.location))?.name || '未知' : '未知'}`}
                                        >
                                            {c.cageCode}
                                        </List.Item>
                                    </SwipeAction>
                                ))}
                            </List>
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
