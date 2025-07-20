import React, { useEffect, useState } from 'react';
import {
    NavBar,
    List,
    Toast,
    FloatingBubble,
    Dialog,
    SwipeAction,
    ActionSheet,
    Modal
} from 'antd-mobile';
import { useParams } from 'react-router-dom';
import { AddOutline } from 'antd-mobile-icons';

import {
    getParrotsByCageId,
    getSpeciesList,
    addParrot,
    updateParrot,
    deleteParrot
} from '../api';

import ParrotForm from '../components/ParrotForm.jsx';

export default function CageParrotList() {
    const { cageId } = useParams();
    const [parrots, setParrots] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editParrot, setEditParrot] = useState(null);

    const closeForm = () => {
        setShowForm(false);
        setEditParrot(null);
    };

    useEffect(() => {
        fetchParrots();
        fetchSpecies();
    }, []);

    const fetchParrots = async () => {
        try {
            const res = await getParrotsByCageId(cageId);
            setParrots(res.data || []);
        } catch {
            Toast.show({ content: '获取鹦鹉失败' });
        }
    };

    const fetchSpecies = async () => {
        try {
            const res = await getSpeciesList();
            setSpeciesList(res.data || []);
        } catch {
            Toast.show({ content: '获取品种失败' });
        }
    };

    const handleAddParrot = async (values) => {
        try {
            await addParrot({ ...values, cageId: parseInt(cageId) });
            Toast.show({ content: '添加成功' });
            closeForm();
            fetchParrots();
        } catch {
            Toast.show({ content: '添加失败' });
        }
    };

    const handleUpdateParrot = async (values) => {
        try {
            await updateParrot(values.id, values);
            Toast.show({ content: '更新成功' });
            closeForm();
            fetchParrots();
        } catch {
            Toast.show({ content: '更新失败' });
        }
    };

    const handleDeleteParrot = async (id) => {
        Modal.confirm({
            content: '确定要删除这只鹦鹉吗？',
            onConfirm: async () => {
                try {
                    await deleteParrot(id);
                    Toast.show({ content: '删除成功' });
                    fetchParrots();
                } catch {
                    Toast.show({ content: '删除失败' });
                }
            }
        });
    };

    const renderDescription = (p) => {
        const speciesName =
            speciesList.find((s) => s.id === p.species)?.name || '未知';
        return `品种: ${speciesName}, 性别: ${p.gender}`;
    };

    return (
        <>
            <NavBar back="返回" onBack={() => window.history.back()}>
                笼子内鹦鹉
            </NavBar>

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
                                }
                            },
                            {
                                key: 'delete',
                                text: '删除',
                                color: 'danger',
                                onClick: () => handleDeleteParrot(p.id)
                            }
                        ]}
                    >
                        <List.Item description={renderDescription(p)}>
                            {p.ringNumber}
                        </List.Item>
                    </SwipeAction>
                ))}
            </List>

            <FloatingBubble
                style={{
                    '--initial-position-bottom': '80px',
                    '--initial-position-right': '24px'
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
                content={
                    <ParrotForm
                        onSubmit={editParrot ? handleUpdateParrot : handleAddParrot}
                        initialValues={editParrot || { cageId: parseInt(cageId) }}
                        disableCageSelection={!editParrot}
                    />
                }
                closeOnMaskClick={true}
                onClose={closeForm}
            />
        </>
    );
}
