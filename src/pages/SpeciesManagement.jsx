import React, { useEffect, useState } from 'react';
import {
    Dialog,
    FloatingBubble,
    List,
    NavBar,
    Toast,
    SwipeAction,
} from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { getSpeciesList, createSpecies, deleteSpecies } from '../api';
import ParrotForm from "../components/ParrotForm.jsx";
import SpeciesForm from "../components/SpeciesForm.jsx";

export default function SpeciesManagement() {
    const [speciesList, setSpeciesList] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);

    useEffect(() => {
        fetchSpecies();
    }, []);

    const fetchSpecies = async () => {
        try {
            const res = await getSpeciesList();
            setSpeciesList(res.data);
        } catch {
            Toast.show({ content: '获取品种失败' });
        }
    };

    const handleAddSpecies = async (values) => {
        try {
            await createSpecies(values);
            Toast.show({ content: '添加成功' });
            setDialogVisible(false);
            fetchSpecies();
        } catch (e) {
            Toast.show({ content: '添加失败' });
        }
    };


    const handleDeleteSpecies = async (id) => {
        try {
            await deleteSpecies(id);
            Toast.show({ content: '删除成功' });
            fetchSpecies();
        } catch {
            Toast.show({ content: '删除失败' });
        }
    };

    return (
        <>
            <NavBar backIcon={false}>品种管理</NavBar>
            <List header="已添加的品种">
                {speciesList.map((s) => (
                    <SwipeAction
                        key={s.id}
                        rightActions={[
                            {
                                key: 'delete',
                                text: '删除',
                                color: 'danger',
                                onClick: () => handleDeleteSpecies(s.id),
                            },
                        ]}
                    >
                        <List.Item>{s.name}</List.Item>
                    </SwipeAction>
                ))}
            </List>

            <FloatingBubble
                style={{
                    '--initial-position-bottom': '80px',
                    '--initial-position-right': '24px',
                }}
                onClick={() => setDialogVisible(true)}
            >
                <AddOutline fontSize={32} />
            </FloatingBubble>

            <Dialog
                visible={dialogVisible} // 这里可以根据需要控制 Dialog 的显示
                onClose={() => setDialogVisible(false)}
                closeOnMaskClick={true}
                content={<SpeciesForm onSubmit={handleAddSpecies} />}
            />
        </>
    );
}
