import React, { useEffect, useState } from 'react';
import { NavBar, SearchBar, List, Toast, SpinLoading, ErrorBlock } from 'antd-mobile';
import {getAllCages, getCages, getSpeciesList, searchParrotsByRing} from '../api/index.js';

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
            const res = await getAllCages();
            console.log('Fetched cages:', res.data)
            setCages(Array.isArray(res?.data) ? res.data : []);
        } catch {
            Toast.show({ content: '获取笼子列表失败' });
        }
        setLoading(false);
    };

    const fetchSpeciesList = async () => {
        setLoading(true);
        try {
            const res = await getSpeciesList();
            setSpeciesList(Array.isArray(res?.data) ? res.data : []);
        } catch {
            Toast.show({ content: '获取品种列表失败' });
        }
        setLoading(false);
    }

    function renderCageDisplay(cageId) {
        if (!Array.isArray(cages) || !cageId) return '未知';

        const cage = cages.find(c => c.id === cageId);
        if (!cage) return '未知';

        const species = Array.isArray(speciesList)
            ? speciesList.find(s => s.id === parseInt(cage.location))
            : null;
        const speciesName = species?.name || '未知';

        return `${speciesName}-${cage.cageCode || '未知'}`;
    }

    const onSearch = async () => {
        if (!searchKey.trim()) {
            Toast.show('请输入脚环号关键字');
            return;
        }
        setLoading(true);
        try {
            const res = await searchParrotsByRing(searchKey);
            setResults(Array.isArray(res?.data) ? res.data : []);
        } catch {
            Toast.show('查询失败');
        }
        setLoading(false);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div
                style={{
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                    flexShrink: 0
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
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <SpinLoading style={{ '--size': '48px' }} color="primary" />
                </div>
            ) : results.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ErrorBlock status="empty" title={"没有搜索到需要的鹦鹉"} />
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 70 }}>
                    <List>
                        {results.map((p) => (
                            <List.Item
                                key={p.id}
                                description={`品种: ${p.species ? (Array.isArray(speciesList) ? speciesList.find((s) => s.id === p.species)?.name : '未知') : '未知'}, 性别: ${p.gender || '未知'}, 笼子: 
                                    ${p.cageId ? renderCageDisplay(p.cageId) : '未知'
                                }`}
                            >
                                {p.ringNumber}
                            </List.Item>
                        ))}
                    </List>
                </div>
            )}
        </div>
    );
}