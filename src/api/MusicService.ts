import Taro from "@tarojs/taro";

const baseURL = 'https://ke-music.cpolar.top/'

//允许taro携带cookie

Taro.addInterceptor((chain) => {
  const {requestParams} = chain

  const cookie = getCookie()
  if (cookie) {
    requestParams.data = {
      ...requestParams.data,
      cookie: cookie,
      timestamp: Date.now(),
    }
  } else {
    requestParams.data = {
      ...requestParams.data,
      timestamp: Date.now(),
    }
  }

  return chain.proceed(requestParams)
})

export async function loginStatus(): Promise<LoginStatusResponse | null> {

  try {

    const response = await Taro.request<LoginStatusResponse>({
      url: baseURL + 'login/status',
      method: 'GET',
    })

    // await instance.get<LoginStatusResponse>('login/status');
    const data = response.data;


    console.log('loginStatus data = ' + JSON.stringify(data))
    const userId = data?.data?.profile?.userId;
    if (userId) {
      console.log(`user id = ${userId}`);
      setUserId(userId.toString());
    } else {
      removeUserId()
    }
    return data;
  } catch (e) {
    console.log(e)
    return null
  }
}

/**
 * 退出登录
 */
export async function logout(): Promise<boolean> {
  try {
    await Taro.request({
      url: baseURL + 'logout',
      method: 'GET',
    })
    // instance.get('logout');
    removeUserId()
    removeCookie()
    return true;
  } catch (e) {
    return false
  }

}

/**
 * 创建扫码登录二维码地址
 */
export async function createLoginQRUrl(): Promise<[string, string, string] | undefined> {

  try {
    const loginQrKeyResponse = await Taro.request<LoginQrKeyResponse>({
      url: baseURL + 'login/qr/key',
      method: 'GET',
    })
    // }
    //   await instance.get<LoginQrKeyResponse>(
    //   'login/qr/key',
    // );

    const key = loginQrKeyResponse.data.data.unikey;
    const response = await Taro.request<LoginQrCreateResponse>({
      url: baseURL + 'login/qr/create',
      method: 'GET',
      data: {
        key: key,
        'qrimg': 1
      }
    })
    //   instance.get<LoginQrCreateResponse>(
    //   'login/qr/create',
    //   {
    //     params: {
    //       key: key,
    //       'qrimg': 1
    //     },
    //   },
    // );

    return [response.data.data.qrurl, response.data.data.qrimg, key];
  } catch (e) {
    return undefined
  }

}

/**
 * 检查是否登录成功
 */
export async function checkLoginKey(key: string): Promise<CodeMessageResponse> {
  const response = await Taro.request<LoginResponse>({
    url: baseURL + 'login/qr/check',
    method: 'GET',
    data: {
      key: key,
    }
  })

  if (response.data.code === 803) {
    saveCookie(response.data.cookie)
  }

//   await instance.get<CodeMessageResponse>('login/qr/check', {
//   params: {
//     key: key,
//   },
// });

  return response.data;
}

export async function getPlaylistDetail(id: string): Promise<PlaylistDetail | undefined> {
  try {
    const playlistDetailResponse = await Taro.request<PlaylistDetailResponse>({
      url: baseURL + 'playlist/detail',
      data: {
        id: id
      }
    })

    const playlistTrackAllResponse = await Taro.request<PlaylistTrackAllResponse>({
      url: baseURL + 'playlist/track/all',
      data: {
        id: id
      }
    })
    const dynamic = await Taro.request<PlaylistDynamic>({
      url: baseURL + 'playlist/detail/dynamic',
      data: {
        id: id
      }
    })

    return {
      playlist: playlistDetailResponse.data.playlist,
      songs: playlistTrackAllResponse.data.songs,
      dynamic: dynamic.data
    }
  } catch (e) {
    console.log(e)
    return undefined
  }

}

/**
 * 获取评论
 */
export async function getComments(request: {
  id: string,
  type: string,
  sortType: number,
  pageNo: number,
  pageSize: number,
  cursor?: number
}) {

  try {
    await Taro.request({
      url: baseURL + 'comment/new',
      method: 'GET',
      data: request
    })
  } catch (e) {

  }
}

/**
 * 获取当前用户的歌单
 */
export async function getCurrentUserPlaylists(): Promise<Array<Playlist>> {

  try {
    const userId = getUserId();

    console.log('user id = ' + userId)

    if (userId === null) {
      return [];
    }
    const userPlaylistList = await Taro.request({
      url: baseURL + 'user/playlist',
      method: 'GET',
      data: {
        limit: 10000,
        uid: userId,
      }
    })
    console.log(userPlaylistList)

    return userPlaylistList.data.playlist
  } catch (e) {
    return []
  }

}

/**
 * 获取消息列表
 */
// export async function getPrivateMessageList() {
//   const response = await instance.get<PrivateMessageListResponse>(
//     'msg/private',
//     {
//       params: {
//         limit: 1000,
//       },
//     },
//   );
//   return response.data.msgs;
// }

/**
 * 登录状态响应
 */
export interface LoginStatusResponse {
  data: {
    profile?: {
      userId: number;
    };
  };
}

interface LoginQrKeyResponse {
  code: number;
  data: {
    unikey: string;
  };
}

interface LoginQrCreateResponse {
  code: number;
  data: {
    qrurl: string;
    qrimg: string
  };
}

export interface CodeMessageResponse {
  code: number;
  message: string;
}

interface LoginResponse {
  code: number;
  message: string;
  cookie: string;
}

export interface User {
  userId: number;
  nickname: string;
  avatarUrl: string;
  signature: string;
}

export interface PrivateMessageItem {
  lastMsgTime: number;
  lastMsg: string;
  fromUser: User;
  toUser: User;
  lastMsgId: number;
}

export interface PrivateMessageListResponse {
  msgs: PrivateMessageItem[];
}

export interface LastMessage {
  msg: string;
  type: number;
}

export interface UserPlaylistList {
  playlist: Playlist[];
}

export interface Artist {
  "id": number,
  "name": string,
}

export interface Album {
  "id": number,
  "name": string,
  "picUrl": string,

}

export interface Song {
  "name": string,
  "id": number,
  "ar": [Artist],
  "al": Album,
  "mv": number,
}

export interface Playlist {
  creator: User;
  coverImgUrl: string;
  tags: string[];
  name: string;
  id: number;
  trackCount: number;
}

/**
 * 歌单详情
 */
export interface PlaylistDetail {
  playlist: Playlist;
  dynamic: PlaylistDynamic;
  songs: Song[];
}

interface PlaylistDetailResponse {
  playlist: Playlist
}

interface PlaylistTrackAllResponse {
  songs: Song[]
}

export interface PlaylistDynamic {
  "commentCount": number,
  "shareCount": number,
  "playCount": number,
  "bookedCount": number,
  "subscribed": boolean
}

/**
 * 保存用户id
 */
function setUserId(userId: string) {
  // localStorage.setItem('userId', userId.toString());
  Taro.setStorageSync('userId', userId)
  // {
  //   key: 'userId',
  //   data: userId.toString()
  // })
}

function getUserId() {
  return Taro.getStorageSync('userId');
}

function removeUserId() {
  // localStorage.removeItem('userId');
  Taro.removeStorageSync('userId')
}

function saveCookie(cookie: string) {
  // localStorage.setItem('cookie', cookie);
  Taro.setStorageSync('cookie', cookie)
}

function getCookie() {
  return Taro.getStorageSync('cookie');
}

function removeCookie() {
  // localStorage.removeItem('cookie');
  Taro.removeStorageSync('cookie')
}
