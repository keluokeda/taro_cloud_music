import {observer} from "mobx-react-lite";
import {getCurrentInstance} from "@tarojs/runtime";
import {View} from "@tarojs/components";
import {makeAutoObservable} from "mobx";
import {getComments} from "@/api/MusicService";
import {useState} from "react";


class CommentsViewModel {
  type: string
  id: string

  constructor(type: string, id: string) {
    makeAutoObservable(this)
    this.type = type
    this.id = id

    this.loadComments()
  }

  loadComments() {
    getComments({
      id: this.id,
      type: this.type,
      sortType: 3,
      pageNo: 1,
      pageSize: 50
    }).then()
  }
}

function CommentsPage() {

  const params = getCurrentInstance().router?.params!

  const id = params.id!.toString()
  const type = params.type!.toString()


  const [viewModel] = useState(() => new CommentsViewModel(type, id))

  return <View>
    {viewModel.id}+{viewModel.type}
  </View>
}

export default observer(CommentsPage)
