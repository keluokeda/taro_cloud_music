import {Song} from "@/api/MusicService";
import {Text, View} from "@tarojs/components";
import style from './SongView.module.css'
import {ActionSheet, Icon, Image} from "@antmjs/vantui";
import {useState} from "react";
import Taro from "@tarojs/taro";

export default function SongView(props: {
  song: Song
}) {
  const [showMenu, setShowMenu] = useState(false)

  const actions = [
    {
      name: '收藏到歌单'
    },

    {
      name: '评论'
    },
    {
      name: '分享'
    },

  ];

  props.song.ar.forEach(item => {
    actions.push({
      name: `歌手：${item.name}`
    })
  })

  actions.push({
    name: '专辑：' + props.song.al.name
  })

  return <View className={style.root} onClick={(event) => {
    event.stopPropagation()
    console.log('我点击了歌曲 ' + props.song.name)
  }}>
    <Image src={props.song.al.picUrl} width={80} height={80} fit={'cover'}/>
    <View className={style.middle}>
      <Text className={style.name}>{props.song.name}</Text>
      <Text className={style.subtitle}>{props.song.ar.map(e => e.name).join('/')} - {props.song.al.name}</Text>
    </View>

    {
      props.song.mv !== 0 && <Icon className={style.icon} size={48} name={'play-circle-o'}/>
    }

    <Icon className={style.icon} size={48} name={'more-o'} onClick={(event) => {
      event.stopPropagation()
      console.log('我点击了更多按钮' + props.song.name)
      setShowMenu(true)
    }}/>

    <ActionSheet show={showMenu} onClose={() => {
      setShowMenu(false)
    }}
                 actions={actions}

                 onSelect={(event) => {
                   event.stopPropagation()
                   console.log(event)

                   if (event.detail.name === '评论') {
                     Taro.navigateTo({
                       url: '/pages/comments/CommentsPage?id=' + props.song.id + "&type=" + 0
                     })
                   }
                 }}
    />

  </View>
}
