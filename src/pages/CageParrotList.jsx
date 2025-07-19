import React, { useEffect, useState } from 'react';
import { NavBar, List, Toast } from 'antd-mobile';
import { useParams } from 'react-router-dom';
import { getParrotsByCageId } from '../api'; // 你需要创建这个 API

export default function CageParrotList() {
    const { cageId } = useParams();
    const [parrots, setParrots] = useState([]);

    useEffect(() => {
        console.log(`Fetching parrots for cage ID: ${cageId}`)
        fetchParrots();
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


    return (
        <>
            <NavBar back="返回" onBack={() => window.history.back()}>
                笼子内鹦鹉
            </NavBar>
            <List header="鹦鹉列表">
                {parrots.map(p => (
                    <List.Item key={p.id} description={`性别: ${p.gender}, 品种: ${p.breed}`}>
                        {p.name}（{p.ringNumber}）
                    </List.Item>
                ))}
            </List>
        </>
    );
}
