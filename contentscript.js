"use strict";
var get_tree = function(){
	return new TreeModel();
};
var get_root = function(){
	return get_tree().parse({id:-1});
};
var content = document.getElementById('mw-content-text');
function httpGet(theUrl)
{
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.response;
}
function onClickColapseHandler(elem, wqid){
	var div = document.getElementById('divid_'+wqid);
	div.parentNode.removeChild(div);
	
	var div_class = div.getAttribute('class');
	
	elem.removeAttribute('class');
	elem.onclick = onClickExpandHandler(elem);
}
function extendContentHandler(response_div, extend_div, extend_content, link_to_content, wqid) {
	var content = response_div.getElementsByClassName('mw-content-ltr')[0];
	for (var i = 0;i<content.childNodes.length;i++){
		if ((content.childNodes[i].nodeName == 'P' && content.childNodes[i].innerHTML !== '') ||
				content.childNodes[i].nodeName == 'H2' || 
				(content.childNodes[i].nodeName == 'DIV' && content.childNodes[i].getAttribute('class') != 'thumb tright') || 
				(content.childNodes[i].nodeName == 'DIV'  && content.childNodes[i].getAttribute('class') != 'toc')){
			
			var current_child_node = content.childNodes[i];
			
			if(content.childNodes[i].nodeName == '#text'){
				var tempP = document.createElement('p');
				current_child_node = tempP.insertAdjacentElement(content.childNodes[i]);
			}
			extend_div.removeChild(extend_content);
			extend_div.removeChild(link_to_content);
			extend_div.insertAdjacentElement('BeforeEnd', current_child_node);
			extendLinks(current_child_node, wqid);
			
			extend_div.insertAdjacentElement('BeforeEnd', extend_content);
			extend_div.insertAdjacentElement('BeforeEnd', link_to_content);
			response_div.replaceChild(response_div.getElementsByClassName('mw-content-ltr')[0], content);
			break;
		}			
	}
	
	return false;
}
function onClickExpandHandler(elem) {
	return function(){
		var linkcontent = httpGet(elem.href);
		
		var response_div = document.createElement('div');
		
		response_div.innerHTML = linkcontent;
		var wqid = elem.getAttribute('id').replace('wqid_', '');
		var node = wq_root.first(function(node){
			return node.model.id == wqid;	
		});
		var depth = node.getPath().length -1;
		var extend_div = document.createElement('div');
		extend_div.setAttribute('class', 'wikibubble_'+depth);
		elem.setAttribute('class', 'wikibubble_'+depth);

		elem.insertAdjacentElement('AfterEnd', extend_div);
		
		var extend_content = document.createElement('div');
		extend_content.innerHTML = "<b>...</b>";
		extend_content.setAttribute('class', 'extend_content');
		
		var link_to_content = document.createElement('a');
		link_to_content.innerHTML = 'open';
		link_to_content.setAttribute('href', elem.href);
		
		extend_div.insertAdjacentElement('BeforeEnd', extend_content);
		extend_div.insertAdjacentElement('BeforeEnd', link_to_content);
		extendContentHandler(response_div, extend_div, extend_content, link_to_content, wqid);
		extend_content.onclick = extendContentHandler(response_div, extend_div, extend_content, link_to_content, wqid);
		
		elem.onclick = onClickColapseHandler(elem, wqid);
		
		if (depth < 7){
			extendLinks(extend_div, wqid);
		}
		return false;
	};
}
var wq_tree = get_tree();
var wq_root = get_root();

function extendLinks(content, root_wqid) {
	var links = content.getElementsByTagName('a');
	for(var i = 0, l = links.length; i < l; i++) {
		if (/\/wiki\/[^#:]+$/.test(links[i].href) && links[i].innerText != 'open'){
			links[i].setAttribute('onclick', 'return false;');
			var cur_id = "";
			if(root_wqid != '-1'){
				cur_id = ""+root_wqid+i;
				links[i].setAttribute('id', 'wqid_'+root_wqid+i);
			}
			else{
				cur_id = ""+i;
				links[i].setAttribute('id', 'wqid_'+i);
			}		
			links[i].onclick = onClickExpandHandler(links[i]);
			var link_node = wq_tree.parse({id:cur_id});
			var parent_node = wq_root.first(function(node){
				return node.model.id == root_wqid;
			});
			parent_node.addChild(link_node);
		}
	}
}
extendLinks(content, '-1');
