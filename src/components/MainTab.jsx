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

const tabs = [
    {
        key: '/parrots',
        title: '鹦鹉',
        icon: <StarOutline />,
    },
    {
        key: '/cages',
        title: '笼子',
        icon: <AppOutline />,
    },
    {
        key: '/species',
        title: '品种',
        icon: <UnorderedListOutline />,
    },
    {
        key: '/search',
        title: '搜索',
        icon: <SearchOutline />,
    },
]

export default function MainTab() {
    const location = useLocation()
    const navigate = useNavigate()
    const { pathname } = location

    return (
        <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
            {/* 页面主体内容占满剩余高度 */}
            <div style={{ flex: 1, overflow: 'auto', background: '#f5f5f5' }}>
                <Routes>
                    <Route path="/parrots" element={<ParrotPage />} />
                    <Route path="/cages" element={<CagePage />} />
                    <Route path="/species" element={<SpeciesPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/cage/:cageId/parrots" element={<CageParrotList />} />
                    <Route path="*" element={<ParrotPage />} />
                </Routes>
            </div>

            {/* 固定在底部的 TabBar */}
            <TabBar safeArea activeKey={pathname} onChange={key => navigate(key)} style={{
                zIndex: 1000,
                paddingBottom: 8,
                paddingTop: 5,
                borderTop: '1px solid #f0f0f0',
            }}>
                {tabs.map(item => (
                    <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                ))}
            </TabBar>
        </div>
    )
}
