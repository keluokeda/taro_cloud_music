import {makeAutoObservable, runInAction} from "mobx";
import Taro from "@tarojs/taro";

import {observer} from "mobx-react-lite";
import {useState} from "react";
import {loginStatus} from "@/api/MusicService";
import {Button, Loading} from "@antmjs/vantui";


import {View} from '@tarojs/components'
import './index.less'


enum State {
  loading, error
}

class IndexViewModel {

  state: State = State.loading

  constructor() {
    makeAutoObservable(this)
    this.checkNextPage()
  }

  checkNextPage() {
    this.state = State.loading
    loginStatus().then((result) => {
      if (result) {
        const userId = result.data.profile?.userId

        let nextPage: string
        if (userId) {
          //已登录
          nextPage = '/pages/main/main'
        } else {
          //去登录
          nextPage = '/pages/login/login'
        }

        Taro.redirectTo({
          url: nextPage,
        })
      } else {
        runInAction(() => {
          this.state = State.error
        })
      }
    })
  }
}


function Index() {

  const [viewModel] = useState(() => new IndexViewModel())

  return (
    <View className='index'>

      {
        viewModel.state === State.loading ? <Loading/> : <Button onClick={() => {
          viewModel.checkNextPage()
        }} plain hairline type='primary'>出错了，点我重试</Button>
      }

    </View>
  )
}

export default observer(Index)
