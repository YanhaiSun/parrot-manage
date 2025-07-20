import {Form, Input, Button, Picker} from 'antd-mobile';
import {useEffect, useState} from 'react';
import {getSpeciesList, getCages} from '../api';

export default function ParrotForm({onSubmit, initialValues}) {
    const [form] = Form.useForm();
    const [speciesList, setSpeciesList] = useState([]);
    const [speciesVisible, setSpeciesVisible] = useState(false);
    const [speciesValue, setSpeciesValue] = useState([]);
    const [genderVisible, setGenderVisible] = useState(false);
    const [genderValue, setGenderValue] = useState([]);
    const [cages, setCages] = useState([]);
    const [cageVisible, setCageVisible] = useState(false);
    const [cageValue, setCageValue] = useState([]);


    const genderOptions = [
        {label: '雄性', value: '雄性'},
        {label: '雌性', value: '雌性'},
    ];

    useEffect(() => {
        getSpeciesList().then((res) => setSpeciesList(res.data));
        fetchCages();
    }, []);

    useEffect(() => {
        const ready = speciesList.length > 0 && cages.length > 0 && initialValues;

        if (ready) {
            form.setFieldsValue({
                ...initialValues,
                species: initialValues.species,
                gender: initialValues.gender,
                cageId: initialValues.cageId,
            });
            setSpeciesValue([initialValues.species]);
            setGenderValue([initialValues.gender]);
            setCageValue([initialValues.cageId]);
            console.log('设置表单初始值:', {
                ...initialValues,
            }
            );
        }
    }, [initialValues, speciesList, cages]);


    const handleFinish = async (values) => {
        await onSubmit({
            ...values,
            species: values.species,
            gender: values.gender,
        });
        form.resetFields();
        setSpeciesValue([]);
        setGenderValue([]);
        setCageValue([]);
    };


    const fetchCages = async () => {
        try {
            const res = await getCages();
            setCages(res.data);
        } catch (error) {
            console.error('获取笼子列表失败', error);
        }
    }

    return (
        <Form
            form={form}
            onFinish={handleFinish}
            layout="horizontal"
            footer={<Button color="primary" block type="submit">提交</Button>}
        >
            <Form.Item
                name="ringNumber"
                label="脚环号"
                rules={[{required: true}]}
            >
                <Input placeholder="请输入脚环号"/>
            </Form.Item>

            <Form.Item
                name="species"
                label="品种"
                rules={[{required: true}]}
                onClick={() => setSpeciesVisible(true)}
            >
                <div>
                    {speciesList.find(species => species.id === speciesValue[0])?.name || '请选择品种'}
                </div>
                <Picker
                    columns={[speciesList.map(species => ({
                        label: species.name,
                        value: species.id,
                    }))]}
                    visible={speciesVisible}
                    onClose={() => setSpeciesVisible(false)}
                    value={speciesValue}
                    onConfirm={(v) => {
                        const selectedId = v[0];
                        setSpeciesVisible(false);
                        setSpeciesValue([selectedId]);       // Picker 用数组控制显示
                        form.setFieldsValue({species: selectedId}); // ✅ 表单字段用 int
                    }}

                />
            </Form.Item>

            <Form.Item
                name="gender"
                label="性别"
                rules={[{required: true}]}
                onClick={() => setGenderVisible(true)}
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
                        const selected = v[0];
                        setGenderVisible(false);
                        setGenderValue([selected]);
                        form.setFieldsValue({gender: selected}); // ✅ 字段是字符串，不是数组
                    }}

                />
            </Form.Item>

            <Form.Item
                name="age"
                label="年龄"
                rules={[{required: true}]}
            >
                <Input type="number" placeholder="请输入年龄"/>
            </Form.Item>

            <Form.Item
                name="cageId"
                label="所属笼子"
                rules={[{required: true}]}
                onClick={() => setCageVisible(true)}
            >
                <div>
                    {cages.find(cage => cage.id === cageValue[0])?.cageCode || '请选择笼子'}
                </div>
                <Picker
                    columns={[cages.map(cage => ({
                        label: cage.cageCode,
                        value: cage.id,
                    }))]}
                    visible={cageVisible}
                    onClose={() => setCageVisible(false)}
                    value={cageValue}
                    onConfirm={(v) => {
                        const selectedId = v[0];
                        setCageVisible(false);
                        setCageValue([selectedId]);
                        form.setFieldsValue({cageId: selectedId});
                    }}

                />
            </Form.Item>

        </Form>
    );
}
