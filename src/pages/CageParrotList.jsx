import React, { useEffect, useState } from 'react';
import {NavBar, List, Toast, FloatingBubble, Dialog} from 'antd-mobile';
import { useParams } from 'react-router-dom';
import {getParrotsByCageId, getSpeciesList, addParrot, updateParrot} from '../api';
import {AddOutline} from "antd-mobile-icons";
import ParrotForm from "../components/ParrotForm.jsx"; // 你需要创建这个 API

export default function CageParrotList() {
    const { cageId } = useParams();
    const [parrots, setParrots] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const closeForm = () => {
        setShowForm(false);
        setEditParrot(null); // 清除编辑状态
    }
    const [editParrot, setEditParrot] = useState(null);


    useEffect(() => {
        console.log(`Fetching parrots for cage ID: ${cageId}`)
        fetchParrots();
        fetchSpecies();
    }, []);

    const fetchParrots = async () => {
        try {
            const res = await getParrotsByCageId(cageId);
            console.log('parrots 接口返回数据:', res);
            setParrots(res.data); // 可能需要修改
        } catch {
            Toast.show({ content: '获取鹦鹉失败' });
        }
    };

    const fetchSpecies = async () => {
        try {
            const res = await getSpeciesList();
            console.log('species 接口返回数据:', res);
            setSpeciesList(res.data);
        } catch {
            Toast.show({ content: '获取鹦鹉失败' });
        }
    }

    const handleAddParrot = (values) => {
        console.log('添加鹦鹉数据:', values);
        // 添加鹦鹉的 API
        addParrot({ ...values, cageId }) // 假设 API 接口需要 cageId
        // 假设添加成功后，重新获取鹦鹉列表
        fetchParrots();
        setShowForm(false); // 关闭表单
    }

    const handleUpdateParrot = (values) => {
        console.log('更新鹦鹉数据:', values);
        // 更新鹦鹉的 API
        updateParrot(values.id, values) // 假设 API 接口需要传入 ID
        // 假设更新成功后，重新获取鹦鹉列表
        fetchParrots();
        setShowForm(false); // 关闭表单
    }


    return (
        <>
            <NavBar back="返回" onBack={() => window.history.back()}>
                笼子内鹦鹉
            </NavBar>
            <List header="鹦鹉列表">
                {parrots.map(p => (
                    <List.Item key={p.id} description={`性别: ${p.gender}, 品种: ${
                        p.species = speciesList.find(s => s.id === p.species)?.name || '未知'
                    }`}>
                        {p.ringNumber}
                    </List.Item>
                ))}
            </List>

            <FloatingBubble
                style={{ '--initial-position-bottom': '80px', '--initial-position-right': '24px' }}
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
