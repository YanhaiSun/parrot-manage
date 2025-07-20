import { Form, Input, Button, Picker, Toast } from 'antd-mobile';
import { useEffect, useState } from 'react';
import { getSpeciesList, getCagesByLocation } from '../api';

export default function ParrotForm({ onSubmit, initialValues, disableCageSelection = false, forceSpecies }) {
    const [form] = Form.useForm();
    const [speciesList, setSpeciesList] = useState([]);
    const [speciesVisible, setSpeciesVisible] = useState(false);
    const [speciesValue, setSpeciesValue] = useState([]);
    const [genderVisible, setGenderVisible] = useState(false);
    const [genderValue, setGenderValue] = useState([]);
    const [filteredCages, setFilteredCages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cageValue, setCageValue] = useState([]);
    const [cageVisible, setCageVisible] = useState(false);

    const genderOptions = [
        { label: '公', value: '公' },
        { label: '母', value: '母' },
    ];

    useEffect(() => {
        console.log('ParrotForm mounted with initialValues:', initialValues);
        fetchSpecies();

        if (forceSpecies) {
            setSpeciesValue([parseInt(forceSpecies)]);
            form.setFieldsValue({ species: parseInt(forceSpecies) });
        }
    }, [forceSpecies]);

    useEffect(() => {
        // 只有当选择了品种时才获取笼子列表
        if (speciesValue.length > 0 && speciesValue[0]) {
            fetchFilteredCages();
        } else {
            // 如果没有选择品种，清空笼子列表
            setFilteredCages([]);
        }
    }, [speciesValue]);

    const fetchSpecies = async () => {
        setLoading(true);
        try {
            const speciesRes = await getSpeciesList();
            setSpeciesList(speciesRes.data || []);

            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    species: initialValues.species,
                    gender: initialValues.gender,
                    cageId: initialValues.cageId,
                });
                setSpeciesValue([initialValues.species]);
                setGenderValue([initialValues.gender]);
                setCageValue([initialValues.cageId]);
            }
        } catch (error) {
            Toast.show({ content: '获取品种列表失败', icon: 'fail' });
        } finally {
            setLoading(false);
        }
    };

    const fetchFilteredCages = async () => {
        try {
            setLoading(true);
            const speciesId = speciesValue[0];

            // 确保品种ID有效
            if (!speciesId) {
                setFilteredCages([]);
                return;
            }

            const res = await getCagesByLocation(speciesId);
            setFilteredCages(res.data || []);

            if (initialValues?.cageId) {
                const currentCage = res.data.find(c => c.id === initialValues.cageId);
                if (!currentCage) {
                    setCageValue([]);
                    form.setFieldsValue({ cageId: undefined });
                }
            }
        } catch (error) {
            Toast.show({ content: '获取笼子列表失败', icon: 'fail' });
            setFilteredCages([]);
        } finally {
            setLoading(false);
        }
    };

    function renderCageDisplay() {
        if (!cageValue[0]) return '请选择笼子';

        const cage = filteredCages.find(c => c.id === cageValue[0]);
        if (!cage) return '无效笼子';

        const speciesName = speciesList.find(s => s.id === parseInt(cage.location))?.name || '未知';
        return `${speciesName}-${cage.cageCode}`;
    }

    const handleFinish = async (values) => {
        try {
            await onSubmit({
                ...values,
                id: initialValues?.id,
                species: values.species,
                gender: values.gender,
                cageId: values.cageId,
            });
            form.resetFields();
            setSpeciesValue([]);
            setGenderValue([]);
            setCageValue([]);
            Toast.show({ content: '操作成功', icon: 'success' });
        } catch (error) {
            Toast.show({ content: '操作失败', icon: 'fail' });
        }
    };

    return (
        <Form
            form={form}
            onFinish={handleFinish}
            layout="horizontal"
            footer={
                <Button
                    color="primary"
                    block
                    type="submit"
                    loading={loading}
                >
                    提交
                </Button>
            }
        >
            <Form.Item
                name="ringNumber"
                label="脚环号"
                rules={[{ required: true, message: '请输入脚环号' }]}
            >
                <Input placeholder="请输入脚环号" />
            </Form.Item>

            <Form.Item
                name="species"
                label="品种"
                rules={[{ required: true, message: '请选择品种' }]}
                onClick={() => {
                    if (loading || disableCageSelection || forceSpecies) return;
                    setSpeciesVisible(true);
                }}
            >
                <div style={disableCageSelection || forceSpecies ? { color: '#999' } : {}}>
                    {speciesList.find(s => s.id === speciesValue[0])?.name || '请选择品种'}
                </div>
                {!forceSpecies && (
                    <Picker
                        columns={[speciesList.map(species => ({
                            label: species.name,
                            value: species.id,
                        }))]}
                        visible={speciesVisible}
                        onClose={() => setSpeciesVisible(false)}
                        value={speciesValue}
                        onConfirm={(v) => {
                            setSpeciesVisible(false);
                            setSpeciesValue(v);
                            form.setFieldsValue({ species: v[0] });
                        }}
                    />
                )}
            </Form.Item>

            <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
                onClick={() => !loading && setGenderVisible(true)}
            >
                <div>
                    {genderOptions.find(option => option.value === genderValue[0])?.label || '请选择性别'}
                </div>
                <Picker
                    columns={[genderOptions]}
                    visible={genderVisible}
                    onClose={() => setGenderVisible(false)}
                    value={genderValue}
                    onConfirm={(v) => {
                        setGenderVisible(false);
                        setGenderValue(v);
                        form.setFieldsValue({ gender: v[0] });
                    }}
                />
            </Form.Item>

            <Form.Item
                name="cageId"
                label="所属笼子"
                rules={[{ required: !disableCageSelection, message: '请选择笼子' }]}
                onClick={() => {
                    if (loading || disableCageSelection) return;
                    if (!speciesValue[0]) {
                        Toast.show('请先选择品种');
                        return;
                    }
                    if (filteredCages.length === 0) {
                        Toast.show('该品种下没有可用的笼子');
                        return;
                    }
                    setCageVisible(true);
                }}
            >
                <div style={disableCageSelection ? { color: '#999' } : {}}>
                    {renderCageDisplay()}
                    {speciesValue[0] && filteredCages.length === 0 && ' (无可用笼子)'}
                </div>

                {!disableCageSelection && (
                    <Picker
                        columns={[
                            filteredCages.map(cage => ({
                                label: `${speciesList.find(s => s.id === parseInt(cage.location))?.name || '未知'} - ${cage.cageCode}`,
                                value: cage.id,
                            }))
                        ]}
                        visible={cageVisible}
                        value={cageValue}
                        onClose={() => setCageVisible(false)}
                        onConfirm={(v) => {
                            setCageVisible(false);
                            setCageValue(v);
                            form.setFieldsValue({ cageId: v[0] });
                        }}
                    />
                )}
            </Form.Item>
        </Form>
    );
}