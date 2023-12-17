import {Text, View} from "@tarojs/components";
import {makeAutoObservable, runInAction} from "mobx";
import {observer} from "mobx-react-lite";
import {useState} from "react";
import {getCurrentUserPlaylists, Playlist} from "@/api/MusicService";
import {Image} from "@antmjs/vantui";
import './main.less'
import Taro, {usePullDownRefresh} from "@tarojs/taro";

class MainViewModel {
  playlists: Playlist[] = []

  constructor() {
    makeAutoObservable(this)

    this.refresh().then()
  }

  async refresh() {

    const list = await getCurrentUserPlaylists()

    runInAction(() => {
      this.playlists = list
    })
  }
}

function Main() {

  const [viewModel] = useState(() => new MainViewModel())


  usePullDownRefresh(() => {
    // console.log('onPullDownRefresh')
    viewModel.refresh().then(() => {
      Taro.stopPullDownRefresh()
    })
  })

  return (


    <View className={'root'}>


      {
        viewModel.playlists.map((item) => {
          return <PlaylistItem playlist={item} key={item.id}/>
        })
      }

    </View>

  )
}

function PlaylistItem(props: {
  playlist: Playlist
}) {

  return <View className='playlist-item' onClick={() => {
    Taro.navigateTo({
      url: `/pages/playlist-detail/PlaylistDetail?id=${props.playlist.id}`,
    })
  }}>
    <Image src={props.playlist.coverImgUrl} width={80} height={80} fit='cover'/>
    <Text className='playlist-text'>{props.playlist.name}</Text>
  </View>
}

export default observer(Main)
