"use strict";
var get_tree = function(){
	return new TreeModel();
};
var get_root = function(){
	return get_tree().parse({id:-1});
};
var content = document.getElementById('mw-content-text');

function render_content_callback(req, elem){
	if(req.readyState != 4 || req.status != 200) return;
	
	var response_div = document.createElement('div');
	
	response_div.innerHTML = req.responseText;
	
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

	var link_to_content_tab = document.createElement('a');
	link_to_content_tab.innerHTML = 'open in tab';
	link_to_content_tab.setAttribute('href', elem.href);
	link_to_content_tab.setAttribute('target', '_blank');
	
	var spacer = document.createElement('span');
	spacer.innerHTML = ' ';
	
	extend_div.insertAdjacentElement('BeforeEnd', extend_content);
	extend_div.insertAdjacentElement('BeforeEnd', link_to_content);
	extend_div.insertAdjacentElement('BeforeEnd', spacer);
	extend_div.insertAdjacentElement('BeforeEnd', link_to_content_tab);
	extend_content.onclick = extendContentHandler.bind(this, response_div, extend_div, extend_content, link_to_content, link_to_content_tab, spacer, wqid);
	extendContentHandler(response_div, extend_div, extend_content, link_to_content, link_to_content_tab, spacer, wqid);

	elem.onclick = onClickColapseHandler.bind(this, elem, wqid, depth);
	
	if (depth < 7){
		extendLinks(extend_div, wqid);
	}
	return;
}
function httpGet(url, elem)
{
	var req = new XMLHttpRequest();
	req.onreadystatechange = render_content_callback.bind(this, req, elem);
	req.open('GET', url, true);
	req.send();
	return;
}
function onClickColapseHandler(elem, wqid, depth){
	var div_wiki = elem.parentElement.querySelector('div.wikibubble_'+depth);
	elem.parentElement.removeChild(div_wiki);
	elem.removeAttribute('class');
	elem.onclick = onClickExpandHandler.bind(this, elem)
	return;
}
function extendContentHandler(response_div, extend_div, extend_content, link_to_content, link_to_content_tab, spacer, wqid) {
	var content = response_div.querySelector('.mw-content-ltr');
	for (var i = 0;i<content.childNodes.length;i++){
		var cur_node = content.childNodes[i];
		if ((cur_node.nodeName == 'P' && cur_node.innerHTML !== '') ||
				cur_node.nodeName == 'H2' || 
				(cur_node.nodeName == 'DIV' && cur_node.getAttribute('class') != 'thumb tright' && 
				 !cur_node.getAttribute('class').match('hatnote') && cur_node.getAttribute('class') != 'toc'  &&
				 cur_node.nodeName != 'IMG' )){
			
			if(cur_node.nodeName == '#text'){
				var tempP = document.createElement('p');
				current_child_node = tempP.insertAdjacentElement(cur_node);
			}
			if (cur_node.nodeName == 'H2') {
				extend_div.insertAdjacentElement('BeforeEnd', cur_node);
				continue;
			}
			extend_div.removeChild(extend_content);
			extend_div.removeChild(link_to_content);
			extend_div.removeChild(spacer);
			extend_div.removeChild(link_to_content_tab);
			extend_div.insertAdjacentElement('BeforeEnd', cur_node);
			extendLinks(cur_node, wqid);
			
			extend_div.insertAdjacentElement('BeforeEnd', extend_content);
			extend_div.insertAdjacentElement('BeforeEnd', link_to_content);
			extend_div.insertAdjacentElement('BeforeEnd', spacer);
			extend_div.insertAdjacentElement('BeforeEnd', link_to_content_tab);
			response_div.replaceChild(response_div.getElementsByClassName('mw-content-ltr')[0], content);
			break;
		}			
	}
	
	return false;
}
function onClickExpandHandler(elem) {
	httpGet(elem.href, elem);
}

var wq_tree = get_tree();
var wq_root = get_root();

function extendLinks(content, root_wqid) {
	var links = content.getElementsByTagName('a');
	for(var i = 0, l = links.length; i < l; i++) {
		if (/\/wiki\/[^#:]+$/.test(links[i].href) && links[i].innerText != 'open' && links[i].innerText != 'open in tab'){
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
			links[i].onclick = onClickExpandHandler.bind(this, links[i]);
			var link_node = wq_tree.parse({id:cur_id});
			var parent_node = wq_root.first(function(node){
				return node.model.id == root_wqid;
			});
			parent_node.addChild(link_node);
		}
	}
}
extendLinks(content, '-1');
