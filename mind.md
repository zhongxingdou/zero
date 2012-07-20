# 想法集中营

### 不侵入的扩展机制

* 注册扩展
  
  $.registExpander(Array, reopenArgs)

* 注销扩展

  $.unRegistExpander(Array, expanderName); 

* 使用扩展
  
  $([a, b, c]).delete(a);

  $(8).times(function(i){});

  $(new Date()).nextWeek();

  $(queryElement("#id")).remove();
  
### 信息分类的API设计
   
   * ajax请求示例
   		 * request("get", "http://www.domain.com/resource").withData({}).set({async: false}).send();
   
   * 事件绑定示例
   		* on(button, "click").then(sayHello).then(sayByebye)
   		* button.on("click").then(sayHello).then(…)
		* button.on("click", sayHello).on("dbclick", sayByebye) 
		* on(button, "click").then([sayHello, sayByebye])
		* button.on("click").tell(obj).doSomething()

### 集中的类型转换

	//转换一个对象
	$covert(123456, {from: Number, to: Array});

	//转换一个对象,并优先使用给出的转换器
	$covert(123456, {from: Number, to: Array, convertor: conv});

	//添加一个转换器
	$convert.add({convert: fnConv, name: "", from: Number, to: String});

	//询问是否支持某种类型转换
	$convert.support({from: Number, to: Array});

	//将转换器设为默认的(它所支持的类型转换)
	$convert.setDefault(conv)

	
### delegate
	$delegate("getCellData")

	aObj.__delegateObj = bObj 
	aObj.setDelegate(bObj);
	this.getCellData.call();


