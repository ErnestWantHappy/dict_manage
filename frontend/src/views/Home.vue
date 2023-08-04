<template>
  <div class="container">
    <div class="Header">
      <div class="header">
        <div :class="store.selectedParams === 'dict' ? 'header-item-active' : 'header-item'" @click="handleDict">字典管理</div>
        <div v-for="(param, index) in store.navigationParams" :key="param">
          <div :class="store.selectedParams === param ? 'header-item-active' : 'header-item'">
            <div class="item-con">
              <span @click="handleTopClick(param)">字典数据</span>
              <span class="delete-icon" @click="deleteItem(index)"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="content">
      <!-- 下边内容显示 -->
      <router-view></router-view>
    </div>
    <!-- <button @click="ceshiClick">测试按钮</button> -->
  </div>
</template>
<script lang="jsx" setup>
//引入vue3的生命周期
import { onMounted,onBeforeUnmount,onBeforeMount} from 'vue'
import { ref, reactive, watch } from 'vue'
import { useStore } from '../store/index';
import { useRouter ,onBeforeRouteUpdate} from 'vue-router'
const router = useRouter()
const store = useStore()

//组件挂载完成后执行的函数；
onMounted(() => {
      // mounted 钩子函数的逻辑
      console.log("mounted")
      if(store.navigationParams.length!=0){
        router.push(`/dict/data/${store.selectedParams}`)
      }else{
        router.push('/dict')
      }
    });

const ceshiClick = () => {
  store.singleStage()
  store.multiStage()
}
//点击各个字典数据
const handleTopClick = (param) => {
  store.clickArr.push(param)
  store.selectedParams = param
  router.push(`/dict/data/${param}`)
  store.queryParamsDict.type = param
  store.getListDataDict()
}
//点击字典管理
const handleDict = () => {
  // console.log("点击字典管理")
  store.clickArr.push("dict")
  router.push('/dict')
  store.selectedParams = "dict"
}
//删除字典数据
const deleteItem = (index) => {
  
  if (store.navigationParams.length == 1) {
    router.push('/dict')//路由跳转
    store.selectedParams = "dict"//设置选中的参数
  }
  //如果有两个元素，同时点击删除的是自己，要跳转到点击的上一个页面
  else if (store.navigationParams[index] == store.selectedParams) {
    const secondToLastElement = store.clickArr[store.clickArr.length - 2];//获取上一个打开的页面参数
    if(secondToLastElement=="dict"){//如果上一个页面是字典管理
      router.push('/dict')
      store.selectedParams = "dict"
    }else{//如果上一个页面是字典数据
      store.clickArr.splice(store.clickArr.length - 2, 1)//删除上一个打开页面的参数
      router.push(`/dict/data/${secondToLastElement}`)
      store.selectedParams = secondToLastElement
      store.queryParamsDict.type = secondToLastElement
      store.getListDataDict()
    }
  }
  //如果有两个元素，同时点击删除的不是自己,要在这个页面不变化
  else{
    store.clickArr.splice(store.clickArr.length - 2, 1)
  }
  store.navigationParams.splice(index, 1)
}

// 监听浏览器的前进后退事件
window.addEventListener('popstate', () => {
  const currentPath = window.location.hash;
  console.log(currentPath)
  // 判断当前路径是否为根路径
  if (currentPath === '#/'||currentPath === '#/dict') {
    router.push('/dict'); // 使用 replace 方法将当前路径替换为 /#/dict
    store.clickArr.push("dict")
    store.selectedParams = "dict"
  }else{
    const str=currentPath.substring(12)
    console.log(str)
    router.push(`/dict/data/${str}`)
    store.selectedParams = str
    store.clickArr.push(str)
    store.queryParamsDict.type = str
    store.getListDataDict()
  }
});


</script>

<style lang="scss" scoped>

.container {
  display: flex;
  flex-direction: column;
  width: calc(100% - 150px);
  margin: 0 auto;
}

.delete-icon::after {
  content: "x";
  margin-left: 8px;
  color: #ffffff;
  cursor: pointer;
}

.Header {
  width: 100%;
  height: 40px;
  padding: 4px 0 2px 0;
  display: flex;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);

  .header {
    display: flex;
  }
}

.header-item-active {
  height: 24px;
  margin: 0px 5px;
  font-size: 0.9rem;
  border: 0.1px solid #D9ECFF;
  padding: 5px 18px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 4px;
  color: #ffffff;
  background: #409EFF;
  cursor: pointer;
}

.header-item {
  height: 24px;
  margin: 0px 5px;
  font-size: 0.9rem;
  border: 0.1px solid #D9ECFF;
  box-shadow: 0 0 0 1px #dcdfe6;
  padding: 5px 18px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.header-item:hover {
  background: #409EFF;
}
</style>
