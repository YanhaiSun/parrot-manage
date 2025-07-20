import { TabBar } from 'antd-mobile'
import {
    AppOutline, SearchOutline, StarOutline, UnorderedListOutline,
} from 'antd-mobile-icons'
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom'
import ParrotPage from '../pages/ParrotManagement'
import CagePage from '../pages/CageManagement'
import SpeciesPage from "../pages/SpeciesManagement";
import SearchPage from '../pages/SearchParrot'
import CageParrotList from "../pages/CageParrotList.jsx";
import {useEffect, useState} from "react";

const tabs = [
    {
        key: '/parrot-web/parrots',
        title: '鹦鹉',
        icon: <StarOutline />,
    },
    {
        key: '/parrot-web/cages',
        title: '笼子',
        icon: <AppOutline />,
    },
    {
        key: '/parrot-web/species',
        title: '品种',
        icon: <UnorderedListOutline />,
    },
    {
        key: '/parrot-web/search',
        title: '搜索',
        icon: <SearchOutline />,
    },
]

export default function MainTab() {
    const location = useLocation()
    const navigate = useNavigate()
    const { pathname } = location

    const [viewHeight, setViewHeight] = useState(window.innerHeight)

    useEffect(() => {
        const resize = () => setViewHeight(window.innerHeight)
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [])

    return (
        <div style={{ height: viewHeight, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'auto', background: '#f5f5f5' }}>
                <Routes>
                    <Route path="/parrot-web/parrots" element={<ParrotPage />} />
                    <Route path="/parrot-web/cages" element={<CagePage />} />
                    <Route path="/parrot-web/species" element={<SpeciesPage />} />
                    <Route path="/parrot-web/search" element={<SearchPage />} />
                    <Route path="/parrot-web/cage/:cageId/parrots" element={<CageParrotList />} />
                    <Route path="/parrot-web/*" element={<ParrotPage />} />
                </Routes>
            </div>

            <TabBar
                safeArea
                activeKey={pathname}
                onChange={key => navigate(key)}
                style={{
                    // zIndex: 1000,
                    // paddingBottom: 4,
                    // paddingTop: 2,
                    borderTop: '1px solid #f0f0f0',
                }}
            >
                {tabs.map(item => (
                    <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                ))}
            </TabBar>
        </div>
    )
}
