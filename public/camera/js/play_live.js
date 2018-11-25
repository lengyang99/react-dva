

var ocx_preview=null;
var serviceUrl="http://10.39.3.54:8081/api/v1/sop/emer/camera";
var ccode='';

$(function(){

	var preview = {
		divId : "preview_1",
		theme: "Red"
	}
	ocx_preview = new PreviewOCX(preview);
	ocx_preview.registerCallback(PREVIEW_EVENT_TOKEN, tokenCallEvent_preview);

	ccode=getUrlParam("ccode");

	show();
	//setTimeout("show()",1000);
	//openUrl_preview(ccode,"球机");
});

function show(){
	$("#cdiv").show();


    					$("#preview_1").show();

    					$("#preview_1").css({
    						"position":"absolute",
    						"width":"100%",
    						"height":"100%",
    						"left":"0",
    						"top":"5px",
    						"z-index":"999",
    						"background":"#999"
    					});

						openUrl_preview(ccode,"球机");
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg);  //匹配目标参数
	if (r != null) return unescape(r[2]); return null; //返回参数值
}

function openUrl_preview(cid,cname){
	//ccode cname
	var width=$(window).width();

	$.ajax({
		type:"get",
		url: serviceUrl + '/getPreviewOcxOptions',
		dataType:"jsonp",
		jsonp:"callback",
		data:{
			indexCode:cid
		},
		success:function(res){
			res = typeof (res) == 'string' ? JSON.parse(res) : res;
			var winindex = ocx_preview.getSelectWindow();
		    if(ocx_preview.startPreview(winindex, res.data)==0){

				if(ocx_preview.setSelectWindow(winindex+1)==-1){
					ocx_preview.setSelectWindow(0);
				}

			}
		}
	});

}


function tokenCallEvent_preview(reqID){
	$.ajax({
		type:"get",
		url: serviceUrl + '/applyToken',
		dataType:"jsonp",
		jsonp:"callback",
		data:{
		},
		success:function(res){
			res = typeof (res) == 'string' ? JSON.parse(res) : res;
			ocx_preview.setToken(reqID,res.data);
			ocx_preview.setWindowsLayout(1);

			//openUrl_preview(ccode,"");
		}
	});
}



