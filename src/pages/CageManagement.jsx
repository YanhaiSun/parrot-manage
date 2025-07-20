import React, {useEffect, useState} from 'react';
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
} from 'antd-mobile';
import {AddOutline, FilterOutline} from 'antd-mobile-icons';
import {getCages, addCage, deleteCage, getSpeciesList} from '../api';

export default function CageManagement() {
    const [cages, setCages] = useState([]);
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

    useEffect(() => {
        fetchCages();
        fetchSpecies();
    }, []);

    useEffect(() => {
        filterCages();
    }, [cages, searchText, selectedSpecies]);

    const fetchCages = async () => {
        setLoading(true);
        try {
            const res = await getCages();
            setCages(res.data);
        } catch (error) {
            Toast.show({content: '获取笼子列表失败'});
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecies = async () => {
        try {
            const res = await getSpeciesList();
            setSpeciesList(res.data || []);
        } catch {
            Toast.show({content: '获取品种列表失败'});
        }
    };

    const filterCages = () => {
        let result = [...cages];

        // 按搜索文本过滤
        if (searchText) {
            result = result.filter(cage =>
                cage.cageCode.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // 按品种过滤
        if (selectedSpecies.length > 0) {
            result = result.filter(cage =>
                selectedSpecies.includes(parseInt(cage.location))
            );
        }

        setFilteredCages(result);
    };

    const onFinish = async (values) => {
        try {
            await addCage(values);
            Toast.show({content: '添加成功'});
            form.resetFields();
            setSpeciesValue([]);
            setShowForm(false);
            fetchCages();
        } catch {
            Toast.show({content: '添加失败'});
        }
    };

    const handleDeleteCage = async (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个笼子吗？所有相关鹦鹉所属笼子将会被清空。',
            onConfirm: async () => {
                try {
                    await deleteCage(id);
                    Toast.show({content: '删除成功'});
                    fetchCages();
                } catch {
                    Toast.show({content: '删除失败'});
                }
            },
        });
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleFilterChange = (value) => {
        setSelectedSpecies(value);
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
                    <SpinLoading style={{'--size': '48px'}} color="primary"/>
                </div>
            ) : (
                <>
                    <div style={{
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#fff',
                    }}>
                        <SearchBar
                            placeholder="搜索笼子编号"
                            onSearch={handleSearch}
                            onChange={handleSearch}
                            value={searchText}
                            style={{
                                width: '70%',
                            }}
                        />

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            margin: '8px 0'
                        }}>
                            <Button
                                size='small'
                                onClick={() => setFilterVisible(true)}
                                style={{'--border-radius': '20px'}}
                            >
                                <FilterOutline /> 筛选
                            </Button>
                        </div>
                    </div>

                    {filteredCages.length === 0 ? (
                        <ErrorBlock
                            status="empty"
                            title="没有找到笼子"
                            description={cages.length === 0 ? "快添加一个吧" : "请调整搜索条件"}
                        />
                    ) : (
                        <List header="笼子列表">
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
                    <div style={{padding: '12px 0'}}>
                        <div style={{marginBottom: '16px'}}>
                            <div style={{marginBottom: '8px', color: 'var(--adm-color-text)'}}>品种</div>
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
                            onClick={() => setFilterVisible(false)}
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
                        <Form.Item name="cageCode" label="笼子编号" rules={[{required: true}]}>
                            <Input placeholder="请输入笼子编号"/>
                        </Form.Item>
                        <Form.Item
                            name="location"
                            label="品种"
                            rules={[{required: true, message: '请选择品种'}]}
                            onClick={() => setSpeciesVisible(true)}
                        >
                            {speciesValue.length > 0
                                ? speciesList.find(s => s.id === speciesValue[0])?.name || '请选择品种'
                                : '请选择品种'}
                            <Picker
                                columns={[speciesList.map(species => ({label: species.name, value: species.id}))]}
                                visible={speciesVisible}
                                value={speciesValue}
                                onClose={() => setSpeciesVisible(false)}
                                onConfirm={(v) => {
                                    setSpeciesValue(v);
                                    form.setFieldsValue({location: v[0]});
                                    setSpeciesVisible(false);
                                }}
                            />
                        </Form.Item>
                    </Form>
                }
            />

            <FloatingBubble
                style={{'--initial-position-bottom': '80px', '--initial-position-right': '24px'}}
                onClick={() => setShowForm(true)}
            >
                <AddOutline fontSize={32}/>
            </FloatingBubble>
        </>
    );
}
