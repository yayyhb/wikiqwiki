"use strict";
var tree = new TreeModel();
depth = tree.parse({
	id: 0,
	children: {}
});
var content = document.getElementById('mw-content-text');
function httpGet(theUrl)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.response;
}

function onClickColapseHandler(elem){
	return function(){
		var div = document.getElementsByClassName('wikibubble_'+depth[elem.innerHTML]);
		div = div[1];
		div.parentNode.removeChild(div);
		
		var div_class = div.getAttribute('class');
		
		elem.removeAttribute('class');
		
		depth[elem.innerHTML] = undefined;
		extendLinks(content);
	}
}
function extendContentHandler(response_div, extend_div, extend_content, link_to_content) {
	return function() {
		var content = response_div.getElementsByClassName('mw-content-ltr')[0];
		for (var i = 0;i<content.childNodes.length;i++){
			if ((content.childNodes[i].nodeName == 'P' && content.childNodes[i].innerHTML != '') || content.childNodes[i].nodeName == 'H2' || (content.childNodes[i].nodeName == 'DIV' && content.childNodes[i].getAttribute('id') != 'toc')){
				extend_div.insertAdjacentElement('beforeEnd', content.childNodes[i]);
				extend_div.removeChild(extend_content);
				extend_div.removeChild(link_to_content);
				break;
			}			
		}
		extend_content.onmouseup = extendContentHandler(response_div, extend_div, extend_content, link_to_content);
		
		extend_div.insertAdjacentElement('BeforeEnd', extend_content);
		extend_div.insertAdjacentElement('BeforeEnd', link_to_content)
	}
}
function onClickExpandHandler(elem) {
	return function(){
		var linkcontent = httpGet(elem.href);
		
		var response_div = document.createElement('div');
		
		response_div.innerHTML = linkcontent;
		
		var first_elem_counter = 0;
		var firstelem;
		
		while(first_elem_counter < response_div.getElementsByClassName('mw-content-ltr')[0].children.length){
			firstelem = response_div.getElementsByClassName('mw-content-ltr')[0].children[first_elem_counter];
			if (firstelem.nodeName == 'P' && firstelem.innerHTML != ''){
				firstelem = response_div.getElementsByClassName('mw-content-ltr')[0].children[first_elem_counter];
				break;
			}else{
				first_elem_counter++;
			}
		}
		var extend_div = document.createElement('div');
		if (!elem.hasAttribute('class', 'wikibubble')){
			if (depth.isRoot()){
					
			}
		}
		elem.removeAttribute('class');
		elem.setAttribute('class', 'wikibubble'+depth[elem.innerHTML]);
		extend_div.setAttribute('class', 'wikibubble_'+depth[elem.innerHTML]);
		extend_div.setAttribute('id', elem.innerHTML);
		
		elem.insertAdjacentElement('AfterEnd', extend_div);
		
		extend_div.insertAdjacentElement('BeforeEnd', firstelem);
		
		var extend_content = document.createElement('div');
		extend_content.innerHTML = "<b>...</b>"
		extend_content.setAttribute('class', 'extend_content');
		
		var link_to_content = document.createElement('a');
		link_to_content.innerHTML = 'open';
		link_to_content.setAttribute('href', elem.href);
		
		extend_content.onmouseup = extendContentHandler(response_div, extend_div, extend_content, link_to_content);
		extend_div.insertAdjacentElement('BeforeEnd', extend_content);
		extend_div.insertAdjacentElement('BeforeEnd', link_to_content);
		
		elem.onclick = onClickColapseHandler(elem);
		
		if (depth[elem.innerHTML] < 7){
			extendLinks(extend_div);
		}
	}
}

function extendLinks(content) {
	var links = content.getElementsByTagName('a');
	for(var i = 0, l = links.length; i < l; i++) {
		if (/\/wiki\/[^#:]+$/.test(links[i].href) && links[i].innerText != 'open'){
			links[i].setAttribute('onclick', 'return false;');
			links[i].setAttribute('class', 'wikibubble')
			links[i].onclick = onClickExpandHandler(links[i]);
		}
	}
}
extendLinks(content);
