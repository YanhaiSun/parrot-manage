import {TabBar, SafeArea} from 'antd-mobile'
import {
    AppOutline, HistogramOutline, SearchOutline, StarOutline, UnorderedListOutline,
} from 'antd-mobile-icons'
import {useLocation, useNavigate, Routes, Route} from 'react-router-dom'
import ParrotPage from '../pages/ParrotManagement'
import CagePage from '../pages/CageManagement'
import SpeciesPage from "../pages/SpeciesManagement";
import SearchPage from '../pages/SearchParrot'
import CageParrotList from "../pages/CageParrotList.jsx";
import ParrotStatistics from "../pages/ParrotStatistics.jsx";
import {useEffect, useState} from "react";

const tabs = [
    // {
    //     key: '/parrot-web/parrots',
    //     title: '统计',
    //     icon: <StarOutline />,
    // },
    {
        key: '/parrot-web/parrot-statistics',
        title: '统计',
        icon: <HistogramOutline />
    },
    {
        key: '/parrot-web/cages',
        title: '笼子',
        icon: <AppOutline/>,
    },
    {
        key: '/parrot-web/species',
        title: '品种',
        icon: <UnorderedListOutline/>,
    },
    {
        key: '/parrot-web/search',
        title: '搜索',
        icon: <SearchOutline/>,
    }

]

export default function MainTab() {
    const location = useLocation()
    const navigate = useNavigate()
    const {pathname} = location

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        }}>
            {/* 内容区域 - 独立滚动容器 */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                background: '#f5f5f5',
                // 隐藏滚动条
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none'
                }
            }}>
                <Routes>
                    <Route path="/parrot-web/parrots" element={<ParrotPage/>}/>
                    <Route path="/parrot-web/cages" element={<CagePage/>}/>
                    <Route path="/parrot-web/species" element={<SpeciesPage/>}/>
                    <Route path="/parrot-web/search" element={<SearchPage/>}/>
                    <Route path="/parrot-web/cage/:cageId/parrots" element={<CageParrotList/>}/>
                    <Route path="/parrot-web/parrot-statistics" element={<ParrotStatistics/>}/>
                    <Route path="/parrot-web/*" element={<ParrotPage/>}/>
                </Routes>
            </div>

            {/* 底部固定区域 */}
            <div style={{
                position: 'fixed',
                zIndex: 2
            }}>
                <TabBar
                    safeArea
                    activeKey={pathname}
                    onChange={key => navigate(key)}
                    style={{
                        borderTop: '1px solid #f0f0f0',
                        backgroundColor: '#fff',
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50px',
                        paddingBottom: '12px',
                    }}
                >
                    {tabs.map(item => (
                        <TabBar.Item key={item.key} icon={item.icon} title={item.title}/>
                    ))}
                </TabBar>
            </div>
            <SafeArea position='bottom'/>
        </div>
    )
}
