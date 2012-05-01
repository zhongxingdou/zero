
	function $each(obj, fn){
		if(!obj)return true;
		for(var i=0,l=obj.length; i<l; i++){
			if(fn(obj[i]) === false)return false;
		}
		return true;
	}


	/**
	 * 把集合对象转换成Array
	 * @param {Object} obj 被转换的对象
	 * @param {Object} start=0 从集合对象中的第几项开始转换 
	 */
	function $makeArray(obj, start){
		return Array.prototype.slice.apply(obj, [start || 0]);
	}


	/**
	 * copy对象成员到另一个对象
	 * @param {Object} from
	 * @param {Object} to
	 * @param {Boolean} overwrite = true 是否覆盖目标对象已存在的成员
	 */
	function $copy(args){
		var from = args.from, 
			to =  args.to, 
			overwrite = args.overwrite;

		if(!(from && to))return;

		if(overwrite === false){
			for(var p in from){
				if(!(p in to)){
					to[p] = from[p];
				}
			}
		}else{
			for(var p in from){
				to[p] = from[p];
			}
		}
	}

	/**
	 * clone对象
	 */
	function $clone(o){}
	
	$each(["$each", "$copy", "$makeArray", "$clone"], function(sName){
		$global.set(sName, eval(sName));
	});
