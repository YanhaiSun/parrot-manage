import React, { useEffect, useState } from 'react';
import {
    Dialog,
    FloatingBubble,
    List,
    Toast,
    SwipeAction,
    SpinLoading,
    ErrorBlock,
} from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import {getSpeciesList, createSpecies, deleteSpecies, updateSpecies} from '../api';
import SpeciesForm from "../components/SpeciesForm.jsx";

export default function SpeciesManagement() {
    const [speciesList, setSpeciesList] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [editingSpecies, setEditingSpecies] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSpecies();
    }, []);

    const fetchSpecies = async () => {
        setLoading(true);
        try {
            const res = await getSpeciesList();
            setSpeciesList(res.data);
        } catch {
            Toast.show({ content: '获取品种失败' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddSpecies = async (values) => {
        setLoading(true);
        try {
            await createSpecies(values);
            Toast.show({ content: '添加成功' });
            setDialogVisible(false);
            await fetchSpecies();
        } catch {
            Toast.show({ content: '添加失败' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSpecies = async (id) => {
        setLoading(true);
        try {
            await deleteSpecies(id);
            Toast.show({ content: '删除成功' });
            await fetchSpecies();
        } catch {
            Toast.show({ content: '删除失败' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSpecies = async (values) => {
        setLoading(true);
        try {
            await updateSpecies(editingSpecies.id, values);
            Toast.show({ content: '更新成功' });
            setDialogVisible(false);
            setEditingSpecies(null);
            await fetchSpecies();
        } catch {
            Toast.show({ content: '更新失败' });
        } finally {
            setLoading(false);
        }
    };

    const openEditDialog = (species) => {
        console.log('species', species)
        setEditingSpecies(species);
        setDialogVisible(true);
    };

    if (loading) {
        return (
            <div
                style={{
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <SpinLoading style={{ '--size': '48px' }} color='primary' />
            </div>
        );
    }

    return (
        <>
            <List header="品种列表">
                {speciesList.length === 0 ? (
                    <ErrorBlock status="empty" title={"还没有品种数据"} description={"快添加一个吧"} />
                ) : (
                    speciesList.map((s) => (
                        <SwipeAction
                            key={s.id}
                            rightActions={[
                                {
                                    key: 'edit',
                                    text: '编辑',
                                    color: 'primary',
                                    onClick: () => {
                                        openEditDialog(s)
                                    }
                                },
                                {
                                    key: 'delete',
                                    text: '删除',
                                    color: 'danger',
                                    onClick: () => handleDeleteSpecies(s.id),
                                }

                            ]}
                        >
                            <List.Item>{s.name}</List.Item>
                        </SwipeAction>
                    ))
                )}
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
                visible={dialogVisible}
                onClose={() => {
                    setDialogVisible(false);
                    setEditingSpecies(null);
                }}
                closeOnMaskClick={true}
                content={
                    <SpeciesForm
                        onSubmit={editingSpecies ? handleUpdateSpecies : handleAddSpecies}
                        initialValues={editingSpecies}
                    />
                }
            />
        </>
    );
}
