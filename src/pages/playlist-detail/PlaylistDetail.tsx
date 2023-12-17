import {View} from "@tarojs/components";
import {observer} from "mobx-react-lite";
import {getCurrentInstance} from "@tarojs/runtime";
import {getPlaylistDetail, PlaylistDetail} from "@/api/MusicService";
import {useState} from "react";
import {makeAutoObservable, runInAction} from "mobx";
import {Image, Loading} from "@antmjs/vantui";
import './PlaylistDetail.less'
import SongView from "@/components/song/SongView";

class PlaylistDetailViewModel {

  id: string

  playlistDetail: PlaylistDetail | undefined = undefined

  constructor(id: string) {
    makeAutoObservable(this)
    this.id = id
    this.refresh()
  }

  refresh() {
    getPlaylistDetail(this.id).then((result) => {
      runInAction(() => {
        this.playlistDetail = result
      })
    })
  }
}


function PlaylistDetailPage() {
  const instance = getCurrentInstance()

  const id = instance?.router?.params?.id?.toString() ?? ''

  const [viewModel] = useState(() => new PlaylistDetailViewModel(id))


  if (viewModel.playlistDetail === undefined) {
    return <View className='loading-container'>
      <Loading/>
    </View>
  }


  return <View className='root'>
    <Image src={viewModel.playlistDetail.playlist.coverImgUrl} fit={'widthFix'} width={750} className='header-image'/>

    {
      viewModel.playlistDetail.songs.map((item) => {
        return <SongView song={item} key={item.id}/>
      })
    }
  </View>
}

export default observer(PlaylistDetailPage)
