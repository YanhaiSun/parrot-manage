import React, { useState } from 'react';
import { NavBar, SearchBar, List, Toast } from 'antd-mobile';
import { searchParrotsByRing } from '../api/index.js';

export default function SearchParrot() {
    const [searchKey, setSearchKey] = useState('');
    const [results, setResults] = useState([]);

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

    return (
        <>
            <NavBar backIcon={false}>搜索鹦鹉</NavBar>
            <SearchBar
                placeholder="输入脚环号模糊搜索"
                value={searchKey}
                onChange={val => setSearchKey(val)}
                onSearch={onSearch}
                showCancelButton
            />
            <List header="搜索结果">
                {results.map(p => (
                    <List.Item key={p.id} description={`品种: ${p.species}, 性别: ${p.gender}, 年龄: ${p.age}`}>
                        {p.name} - {p.ringNumber}
                    </List.Item>
                ))}
            </List>
        </>
    );
}
