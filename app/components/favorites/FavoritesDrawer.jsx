
import FavoritesDrawerClient from './FavoritesDrawerClient'
import FavoritesContent from './FavoritesContent'

export default function FavoritesDrawer() {
    return <FavoritesDrawerClient content={<FavoritesContent />} />
}
