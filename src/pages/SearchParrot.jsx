import React, {useEffect, useState} from 'react';
import { NavBar, SearchBar, List, Toast } from 'antd-mobile';
import {getCages, searchParrotsByRing} from '../api/index.js';

export default function SearchParrot() {
    const [searchKey, setSearchKey] = useState('');
    const [results, setResults] = useState([]);
    const [cages, setCages] = useState([]);

    // 初始化笼子列表
    useEffect(() => {
        fetchCages();
    }, []);

    const onSearch = async () => {
        if (!searchKey.trim()) {
            Toast.show('请输入脚环号关键字');
            return;
        }
        try {
            const res = await searchParrotsByRing(searchKey);
            setResults(res.data);
        } catch {
            Toast.show('查询失败');
        }
    };

    const fetchCages = async () => {
        try {
            const res = await getCages();
            setCages(res.data || []);
        } catch {
            Toast.show({ content: '获取笼子列表失败' });
        }
    }

    return (
        <>
            <NavBar backIcon={false} onBack={() => window.history.back()} style={{
                backgroundColor: '#fff', color: '#000', borderBottom: '1px solid #f0f0f0'
            }}>
                搜索
            </NavBar>
            <div style={
                { padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }
            }>
                <SearchBar
                    placeholder="输入脚环号模糊搜索"
                    value={searchKey}
                    onChange={val => setSearchKey(val)}
                    onSearch={onSearch}
                    showCancelButton
                />
            </div>
            <List>
                {results.map(p => (
                    <List.Item key={p.id} description={`品种: ${p.species}, 性别: ${p.gender}, 笼子: ${cages.find(c => c.id === p.cageId)?.cageCode || '未知'}`}>
                        {p.ringNumber}
                    </List.Item>
                ))}
            </List>
        </>
    );
}
