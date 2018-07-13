title: 如何构建出色的Vue组件
speaker: trimmer
transition: newspaper
theme: color

[slide]

# 如何构建出色的Vue组件？
## 演讲者：trimmer

[slide]
# 我们怎么写组件
----
* 大部分开发者都是为了自己的项目编写组件  {:&.rollIn}
* 那开源的组件是怎么样的？

[slide]
# 什么算出色？

[slide]
## 通过对大量的开源组件进行调查后
----
* 实现 v-model 兼容性 {:&.rollIn}
* 对事件透明
* 为恰当的元素赋予属性
* 拥抱浏览器标准，实现键盘导航功能
* 优先选择事件，而不是回调
* 限制组件内样式的使用

[slide]
# 实现 v-model 兼容性

[slide]
> 某些组件主要是为表单字段所设计的，包括搜索自动完成、日期选择字段，或是为简单的字段添加额外的功能，使组件的使用者能够添加数据属性。为了使所设计的组件符合使用标准，最重要的一种方式就是支持 v-model。

----
> 根据[Vue组件开发指南](https://cn.vuejs.org/v2/guide/components.html#%E5%9C%A8%E7%BB%84%E4%BB%B6%E4%B8%8A%E4%BD%BF%E7%94%A8-v-model)
实现组件的 v-model 本质上只需传递一个 value 属性，并提供一个 input 事件处理器。

[slide]
#### 为输入框实现一个日期选择器的封装，则需要通过 value 这个 prop 对日期选择器进行初始化，并在选中状态下实现一个 input 事件

```js
import datepicker from 'my-magic-datepicker';

export default {
  props: ['value'],
  mounted() {
    datepicker(this.$el, {
          date: this.value,
          onDateSelected: (date) => {
            this.$emit('input', date);
      },
    });
  }
}
```
[slide]
# 对事件透明

[slide]
### 怎么处理其他的事件呢？ (单击、键盘输入)
----
* 原生的事件会基于 HTML 元素进行冒泡 {:&.rollIn}
* Vue 的事件处理默认不会产生冒泡行为

[slide]
## 有个my-textarea-wrappe组件，怎么调用showFocus事件？

```js
<my-textarea-wrapper @focus="showFocus">
```

[slide]
> Vue 为开发者提供了一种以编程方式访问某个组件的事件监听者的功能，因此我们可以将监听方法赋予适当的对象，即 $listeners 对象

----

```js
<div class="my-textarea-wrapper">
  <textarea v-on="$listeners" ></textarea>
</div>
```
----
> 这种方式能够让开发者在组件中的合适位置传递事件监听器

[slide]
# 为恰当的元素赋予属性

[slide]
### 我们应该怎么展示属性呢？ eg：textarea 的 rows，或是为任意的元素添加一个 title 属性以显示提示。

----
* 默认情况下，Vue 会识别出添加在组件上的属性，并将其应用在组件的根元素上  {:&.rollIn}
* 而在上例中，我们将属性赋予 textare，而不是 div 

[slide]
通过 $attrs 对象直接为目标元素添加属性
```js
export default {
  inheritAttrs: false,
}
```

在模板中这样写：
```html
<div class="my-textarea-wrapper">
  <textarea v-bind="$attrs"></textarea>
</div>
```
[其他的说明](https://www.jianshu.com/p/ce8ca875c337)

[slide]
# 拥抱浏览器标准，实现键盘导航功能

[slide]
* 确保组件符合浏览器标准：可以使用 tab 键选择表单字段，通常也可以使用回车键激活某个按钮或链接
* [键盘导航功能的完整建议](https://www.w3.org/TR/wai-aria-practices/#aria_ex)

[slide]
# 优先选择事件，而不是回调

[slide]
# 在组件与父组件进行数据通信或者用户交互 

---- 
* props 中添加回调函数 {:&.rollIn}
* 使用事件
* 由于 Vue 的自定义事件不会像原生的浏览器事件一样产生冒泡，因此这两种选择在功能上是一致的
* 从组件重用性的角度,推荐事件而不是回调

[slide]
# [来自Vue 的核心团队成员 Chris Fritz的意见](http://www.fullstackradio.com/87)

----
* 通过使用事件，使父组件能够了解的信息变得非常明确。它清晰地划分了“从父组件中获取的信息”和“发送给父组件的信息”这两种概念 {:&.rollIn}
* 在某些简单的场景中，可以选择在事件处理器中直接使用表达式，以精简代码。
* 这种方式更符合标准习惯，Vue 的示例代码与文档都倾向于在组件与父组件进行通信时使用事件。

[slide]

有个回调的方式如下：

```js
// my-custom-component.vue
export default {
  props: ['onActionHappened', ...]
  methods() {
    handleAction() {
      ... // your custom code
      if (typeof this.onActionHappened === 'function') {
        this.onActionHappened(data);
      }
    }
  }
}
```

```html
<my-custom-component :onActionHappened="actionHandler" />
```

如何改写成事件的模式呢？

[slide]
```js
// my-custom-component.vue
export default {
  methods() {
    handleAction() {
      ... // your custom code
      this.$emit('action-happened', data);
    }
  }
}
```

```html
<my-custom-component @action-happened="actionHandler" />
```

[slide]
# 限制组件内样式的使用

[slide]
> Vue 定义的单文件组件结构允许开发者在组件中直接嵌入样式，尤其在结合了组件应用范围的情况下，使开发者能够创建出完全封装的，具备完整样式的组件。并且这种组件不会影响到应用的其他部分

----
> 由于这一系统的强大能力，开发者会不自觉地选择将所有样式都封装在组件中，构建出一个包含全部样式的组件。问题在于，没有任何应用的样式是完全相同的，这种组件或许在你的应用中表现得非常美观，但在其他应用中就显得一团糟

----
> 为了避免这种情况的发生，我的建议是，如果某些 CSS 在结构上对于组件来说不是必需的（例如 color，border，shadow 等等），则应当从组件文件中去除，或是至少能够关闭这些样式。可以选择提供一个能够自定义的 SCSS partial，让使用者能够按照其意愿进行自定义。

----
> 不过，如果仅仅提供一个 SCSS 文件，这种方式仍然有一个缺陷。组件的使用者不得不在样式表的编译过程中引入这个 SCSS，否则就无法看到组件的样式。

[slide]
为了克服这一缺点，开发者可以通过一个 class 为样式提供控制范围。如果 SCSS 使用了 mixin 的结构，开发者就能够按照与使用者相同的方式利用这个 SCSS partial，以实现更多的自定义样式。

```html
<template>
  <div :class="isStyledClass">
    <!-- my component -->
  </div>
</template>
```
```js
export default {
  props: {
    disableStyles: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isStyledClass() {
    if (!this.disableStyles) {
      return 'is-styled';
    }
  },
}
```

```css
@import 'my-component-styles';
.is-styled {
  @include my-component-styles();
}
```
----
> 通过这种方式，组件自带的样式仍然按照开发者的想法呈现，如果使用者需要对其进行自定义的修改，也无需通过更高优先级的选择器进行覆盖。只需将 disableStyles 这个 prop 设置为 true 即可关闭默认的样式，随后选择按照自己的设置使用预定义的 mixin，或是完全从头开始编写样式。

[slide]
# 谢谢观看，后会有期。
[原文链接](https://vuejsdevelopers.com/2018/06/18/vue-components-play-nicely)

