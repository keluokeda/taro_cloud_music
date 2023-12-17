import Taro from "@tarojs/taro";

import {Text, View} from "@tarojs/components";
import {Button, Loading, Toast} from "@antmjs/vantui";
import {makeAutoObservable, runInAction} from "mobx";
import {checkLoginKey, createLoginQRUrl, loginStatus} from "@/api/MusicService";
import {observer} from "mobx-react-lite";
import {useState} from "react";
import './login.less'
import {QRCode} from "taro-code";

const Toast_ = Toast.createOnlyToast()

class LoginViewModel {
  url: string | undefined | null = undefined
  key: string = ''

  loading: boolean = false

  constructor() {
    makeAutoObservable(this)

    this.refresh()
  }

  async checkLogin() {

    if (this.key.length === 0) {
      return
    }
    this.loading = true

    const result = await checkLoginKey(this.key)

    if (result.code == 803) {
      await loginStatus()
      Taro.redirectTo({
        url: '/pages/main/main',
      })
    } else {
      Toast_.show(result.message)
    }
    runInAction(() => {
      this.loading = false
    })

  }

  refresh() {
    runInAction(() => {
      this.url = undefined
    })
    createLoginQRUrl().then((result) => {
      console.log(result)

      if (result) {
        runInAction(() => {
          this.url = result[0]
          this.key = result[2]
        })

      } else {
        runInAction(() => {
          this.key = ''
          this.url = null
        })

      }
    })
  }
}


function Login() {
  const [viewModel] = useState(() => new LoginViewModel())

  return (
    <View className='root'>
      <View className='imageContainer'>
        <ImageQrView image={viewModel.url}/>
      </View>

      <Button disabled={viewModel.loading} onClick={() => {
        viewModel.checkLogin().then()
      }} type='primary' block>登录</Button>

      <View className='refresh'>
        <Button disabled={viewModel.loading} onClick={() => {
          viewModel.refresh()
        }} type='info' plain hairline block>刷新二维码</Button>
      </View>

      <Toast_/>

    </View>
  )
}

function ImageQrView(props: { image: string | undefined | null }) {
  if (props.image) {
    return <QRCode text={props.image} size={300} className='image'/>
  } else if (props.image === null) {
    return <Text>出错了</Text>
  } else {
    return <Loading/>
  }
}

export default observer(Login)
