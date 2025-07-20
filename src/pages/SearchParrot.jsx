import React, { useEffect, useState } from 'react';
import { NavBar, SearchBar, List, Toast, SpinLoading, ErrorBlock } from 'antd-mobile';
import {getCages, getSpeciesList, searchParrotsByRing} from '../api/index.js';

export default function SearchParrot() {
    const [searchKey, setSearchKey] = useState('');
    const [results, setResults] = useState([]);
    const [cages, setCages] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [loading, setLoading] = useState(false);

    // 初始化笼子列表
    useEffect(() => {
        fetchCages();
        fetchSpeciesList();
    }, []);

    const fetchCages = async () => {
        setLoading(true);
        try {
            const res = await getCages();
            setCages(res.data || []);
        } catch {
            Toast.show({ content: '获取笼子列表失败' });
        }
        setLoading(false);
    };

    const fetchSpeciesList = async () => {
        setLoading(true);
        try {
            const res = await getSpeciesList();
            setSpeciesList(res.data || []);
        } catch {
            Toast.show({ content: '获取品种列表失败' });
        }
        setLoading(false);
    }

    function renderCageDisplay(cageId) {
        const cage = cages.find(c => c.id === cageId);
        if (!cage) return '无效笼子';
        const speciesName = speciesList.find(s => s.id === parseInt(cage.location))?.name || '未知';
        return `${speciesName}-${cage.cageCode}`;
    }

    const onSearch = async () => {
        if (!searchKey.trim()) {
            Toast.show('请输入脚环号关键字');
            return;
        }
        setLoading(true);
        try {
            const res = await searchParrotsByRing(searchKey);
            setResults(res.data);
        } catch {
            Toast.show('查询失败');
        }
        setLoading(false);
    };

    return (
        <>
            <NavBar
                backArrow={false}
                onBack={() => window.history.back()}
                style={{
                    backgroundColor: '#fff',
                    color: '#000',
                    borderBottom: '1px solid #f0f0f0',
                }}
            >
                搜索
            </NavBar>

            <div
                style={{
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                }}
            >
                <SearchBar
                    placeholder="输入脚环号模糊搜索"
                    value={searchKey}
                    onChange={(val) => setSearchKey(val)}
                    onSearch={onSearch}
                    showCancelButton
                />
            </div>

            {loading ? (
                <div
                    style={{
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <SpinLoading style={{ '--size': '48px' }} color="primary" />
                </div>
            ) : results.length === 0 ? (
                <div style={{ marginTop: '64px' }}>
                    <ErrorBlock status="empty" title={"没有搜索到需要的鹦鹉"} />
                </div>
            ) : (
                <List>
                    {results.map((p) => (
                        <List.Item
                            key={p.id}
                            description={`品种: ${p.species ? speciesList.find((s) => s.id === p.species)?.name : '未知'}, 性别: ${p.gender}, 笼子: 
                                ${p.cageId ? renderCageDisplay(p.cageId) : '未知'
                            }`}
                        >
                            {p.ringNumber}
                        </List.Item>
                    ))}
                </List>
            )}
        </>
    );
}
