(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))r(l);new MutationObserver(l=>{for(const c of l)if(c.type==="childList")for(const h of c.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&r(h)}).observe(document,{childList:!0,subtree:!0});function i(l){const c={};return l.integrity&&(c.integrity=l.integrity),l.referrerPolicy&&(c.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?c.credentials="include":l.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function r(l){if(l.ep)return;l.ep=!0;const c=i(l);fetch(l.href,c)}})();function bv(o){return o&&o.__esModule&&Object.prototype.hasOwnProperty.call(o,"default")?o.default:o}var Vf={exports:{}},yo={};var l_;function hx(){if(l_)return yo;l_=1;var o=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function i(r,l,c){var h=null;if(c!==void 0&&(h=""+c),l.key!==void 0&&(h=""+l.key),"key"in l){c={};for(var d in l)d!=="key"&&(c[d]=l[d])}else c=l;return l=c.ref,{$$typeof:o,type:r,key:h,ref:l!==void 0?l:null,props:c}}return yo.Fragment=e,yo.jsx=i,yo.jsxs=i,yo}var u_;function dx(){return u_||(u_=1,Vf.exports=hx()),Vf.exports}var Xe=dx(),Xf={exports:{}},ae={};var c_;function px(){if(c_)return ae;c_=1;var o=Symbol.for("react.transitional.element"),e=Symbol.for("react.portal"),i=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),l=Symbol.for("react.profiler"),c=Symbol.for("react.consumer"),h=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),m=Symbol.for("react.suspense"),p=Symbol.for("react.memo"),v=Symbol.for("react.lazy"),S=Symbol.for("react.activity"),x=Symbol.iterator;function M(U){return U===null||typeof U!="object"?null:(U=x&&U[x]||U["@@iterator"],typeof U=="function"?U:null)}var b={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},R=Object.assign,y={};function g(U,nt,St){this.props=U,this.context=nt,this.refs=y,this.updater=St||b}g.prototype.isReactComponent={},g.prototype.setState=function(U,nt){if(typeof U!="object"&&typeof U!="function"&&U!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,U,nt,"setState")},g.prototype.forceUpdate=function(U){this.updater.enqueueForceUpdate(this,U,"forceUpdate")};function B(){}B.prototype=g.prototype;function N(U,nt,St){this.props=U,this.context=nt,this.refs=y,this.updater=St||b}var D=N.prototype=new B;D.constructor=N,R(D,g.prototype),D.isPureReactComponent=!0;var W=Array.isArray;function F(){}var O={H:null,A:null,T:null,S:null},k=Object.prototype.hasOwnProperty;function w(U,nt,St){var j=St.ref;return{$$typeof:o,type:U,key:nt,ref:j!==void 0?j:null,props:St}}function C(U,nt){return w(U.type,nt,U.props)}function H(U){return typeof U=="object"&&U!==null&&U.$$typeof===o}function st(U){var nt={"=":"=0",":":"=2"};return"$"+U.replace(/[=:]/g,function(St){return nt[St]})}var at=/\/+/g;function ct(U,nt){return typeof U=="object"&&U!==null&&U.key!=null?st(""+U.key):nt.toString(36)}function dt(U){switch(U.status){case"fulfilled":return U.value;case"rejected":throw U.reason;default:switch(typeof U.status=="string"?U.then(F,F):(U.status="pending",U.then(function(nt){U.status==="pending"&&(U.status="fulfilled",U.value=nt)},function(nt){U.status==="pending"&&(U.status="rejected",U.reason=nt)})),U.status){case"fulfilled":return U.value;case"rejected":throw U.reason}}throw U}function z(U,nt,St,j,ft){var Tt=typeof U;(Tt==="undefined"||Tt==="boolean")&&(U=null);var yt=!1;if(U===null)yt=!0;else switch(Tt){case"bigint":case"string":case"number":yt=!0;break;case"object":switch(U.$$typeof){case o:case e:yt=!0;break;case v:return yt=U._init,z(yt(U._payload),nt,St,j,ft)}}if(yt)return ft=ft(U),yt=j===""?"."+ct(U,0):j,W(ft)?(St="",yt!=null&&(St=yt.replace(at,"$&/")+"/"),z(ft,nt,St,"",function(Qt){return Qt})):ft!=null&&(H(ft)&&(ft=C(ft,St+(ft.key==null||U&&U.key===ft.key?"":(""+ft.key).replace(at,"$&/")+"/")+yt)),nt.push(ft)),1;yt=0;var Ot=j===""?".":j+":";if(W(U))for(var Kt=0;Kt<U.length;Kt++)j=U[Kt],Tt=Ot+ct(j,Kt),yt+=z(j,nt,St,Tt,ft);else if(Kt=M(U),typeof Kt=="function")for(U=Kt.call(U),Kt=0;!(j=U.next()).done;)j=j.value,Tt=Ot+ct(j,Kt++),yt+=z(j,nt,St,Tt,ft);else if(Tt==="object"){if(typeof U.then=="function")return z(dt(U),nt,St,j,ft);throw nt=String(U),Error("Objects are not valid as a React child (found: "+(nt==="[object Object]"?"object with keys {"+Object.keys(U).join(", ")+"}":nt)+"). If you meant to render a collection of children, use an array instead.")}return yt}function K(U,nt,St){if(U==null)return U;var j=[],ft=0;return z(U,j,"","",function(Tt){return nt.call(St,Tt,ft++)}),j}function Z(U){if(U._status===-1){var nt=U._result;nt=nt(),nt.then(function(St){(U._status===0||U._status===-1)&&(U._status=1,U._result=St)},function(St){(U._status===0||U._status===-1)&&(U._status=2,U._result=St)}),U._status===-1&&(U._status=0,U._result=nt)}if(U._status===1)return U._result.default;throw U._result}var xt=typeof reportError=="function"?reportError:function(U){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var nt=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof U=="object"&&U!==null&&typeof U.message=="string"?String(U.message):String(U),error:U});if(!window.dispatchEvent(nt))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",U);return}console.error(U)},At={map:K,forEach:function(U,nt,St){K(U,function(){nt.apply(this,arguments)},St)},count:function(U){var nt=0;return K(U,function(){nt++}),nt},toArray:function(U){return K(U,function(nt){return nt})||[]},only:function(U){if(!H(U))throw Error("React.Children.only expected to receive a single React element child.");return U}};return ae.Activity=S,ae.Children=At,ae.Component=g,ae.Fragment=i,ae.Profiler=l,ae.PureComponent=N,ae.StrictMode=r,ae.Suspense=m,ae.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=O,ae.__COMPILER_RUNTIME={__proto__:null,c:function(U){return O.H.useMemoCache(U)}},ae.cache=function(U){return function(){return U.apply(null,arguments)}},ae.cacheSignal=function(){return null},ae.cloneElement=function(U,nt,St){if(U==null)throw Error("The argument must be a React element, but you passed "+U+".");var j=R({},U.props),ft=U.key;if(nt!=null)for(Tt in nt.key!==void 0&&(ft=""+nt.key),nt)!k.call(nt,Tt)||Tt==="key"||Tt==="__self"||Tt==="__source"||Tt==="ref"&&nt.ref===void 0||(j[Tt]=nt[Tt]);var Tt=arguments.length-2;if(Tt===1)j.children=St;else if(1<Tt){for(var yt=Array(Tt),Ot=0;Ot<Tt;Ot++)yt[Ot]=arguments[Ot+2];j.children=yt}return w(U.type,ft,j)},ae.createContext=function(U){return U={$$typeof:h,_currentValue:U,_currentValue2:U,_threadCount:0,Provider:null,Consumer:null},U.Provider=U,U.Consumer={$$typeof:c,_context:U},U},ae.createElement=function(U,nt,St){var j,ft={},Tt=null;if(nt!=null)for(j in nt.key!==void 0&&(Tt=""+nt.key),nt)k.call(nt,j)&&j!=="key"&&j!=="__self"&&j!=="__source"&&(ft[j]=nt[j]);var yt=arguments.length-2;if(yt===1)ft.children=St;else if(1<yt){for(var Ot=Array(yt),Kt=0;Kt<yt;Kt++)Ot[Kt]=arguments[Kt+2];ft.children=Ot}if(U&&U.defaultProps)for(j in yt=U.defaultProps,yt)ft[j]===void 0&&(ft[j]=yt[j]);return w(U,Tt,ft)},ae.createRef=function(){return{current:null}},ae.forwardRef=function(U){return{$$typeof:d,render:U}},ae.isValidElement=H,ae.lazy=function(U){return{$$typeof:v,_payload:{_status:-1,_result:U},_init:Z}},ae.memo=function(U,nt){return{$$typeof:p,type:U,compare:nt===void 0?null:nt}},ae.startTransition=function(U){var nt=O.T,St={};O.T=St;try{var j=U(),ft=O.S;ft!==null&&ft(St,j),typeof j=="object"&&j!==null&&typeof j.then=="function"&&j.then(F,xt)}catch(Tt){xt(Tt)}finally{nt!==null&&St.types!==null&&(nt.types=St.types),O.T=nt}},ae.unstable_useCacheRefresh=function(){return O.H.useCacheRefresh()},ae.use=function(U){return O.H.use(U)},ae.useActionState=function(U,nt,St){return O.H.useActionState(U,nt,St)},ae.useCallback=function(U,nt){return O.H.useCallback(U,nt)},ae.useContext=function(U){return O.H.useContext(U)},ae.useDebugValue=function(){},ae.useDeferredValue=function(U,nt){return O.H.useDeferredValue(U,nt)},ae.useEffect=function(U,nt){return O.H.useEffect(U,nt)},ae.useEffectEvent=function(U){return O.H.useEffectEvent(U)},ae.useId=function(){return O.H.useId()},ae.useImperativeHandle=function(U,nt,St){return O.H.useImperativeHandle(U,nt,St)},ae.useInsertionEffect=function(U,nt){return O.H.useInsertionEffect(U,nt)},ae.useLayoutEffect=function(U,nt){return O.H.useLayoutEffect(U,nt)},ae.useMemo=function(U,nt){return O.H.useMemo(U,nt)},ae.useOptimistic=function(U,nt){return O.H.useOptimistic(U,nt)},ae.useReducer=function(U,nt,St){return O.H.useReducer(U,nt,St)},ae.useRef=function(U){return O.H.useRef(U)},ae.useState=function(U){return O.H.useState(U)},ae.useSyncExternalStore=function(U,nt,St){return O.H.useSyncExternalStore(U,nt,St)},ae.useTransition=function(){return O.H.useTransition()},ae.version="19.2.7",ae}var f_;function md(){return f_||(f_=1,Xf.exports=px()),Xf.exports}var ia=md();const wo=bv(ia);var kf={exports:{}},Mo={},Wf={exports:{}},qf={};var h_;function mx(){return h_||(h_=1,(function(o){function e(z,K){var Z=z.length;z.push(K);t:for(;0<Z;){var xt=Z-1>>>1,At=z[xt];if(0<l(At,K))z[xt]=K,z[Z]=At,Z=xt;else break t}}function i(z){return z.length===0?null:z[0]}function r(z){if(z.length===0)return null;var K=z[0],Z=z.pop();if(Z!==K){z[0]=Z;t:for(var xt=0,At=z.length,U=At>>>1;xt<U;){var nt=2*(xt+1)-1,St=z[nt],j=nt+1,ft=z[j];if(0>l(St,Z))j<At&&0>l(ft,St)?(z[xt]=ft,z[j]=Z,xt=j):(z[xt]=St,z[nt]=Z,xt=nt);else if(j<At&&0>l(ft,Z))z[xt]=ft,z[j]=Z,xt=j;else break t}}return K}function l(z,K){var Z=z.sortIndex-K.sortIndex;return Z!==0?Z:z.id-K.id}if(o.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var c=performance;o.unstable_now=function(){return c.now()}}else{var h=Date,d=h.now();o.unstable_now=function(){return h.now()-d}}var m=[],p=[],v=1,S=null,x=3,M=!1,b=!1,R=!1,y=!1,g=typeof setTimeout=="function"?setTimeout:null,B=typeof clearTimeout=="function"?clearTimeout:null,N=typeof setImmediate<"u"?setImmediate:null;function D(z){for(var K=i(p);K!==null;){if(K.callback===null)r(p);else if(K.startTime<=z)r(p),K.sortIndex=K.expirationTime,e(m,K);else break;K=i(p)}}function W(z){if(R=!1,D(z),!b)if(i(m)!==null)b=!0,F||(F=!0,st());else{var K=i(p);K!==null&&dt(W,K.startTime-z)}}var F=!1,O=-1,k=5,w=-1;function C(){return y?!0:!(o.unstable_now()-w<k)}function H(){if(y=!1,F){var z=o.unstable_now();w=z;var K=!0;try{t:{b=!1,R&&(R=!1,B(O),O=-1),M=!0;var Z=x;try{e:{for(D(z),S=i(m);S!==null&&!(S.expirationTime>z&&C());){var xt=S.callback;if(typeof xt=="function"){S.callback=null,x=S.priorityLevel;var At=xt(S.expirationTime<=z);if(z=o.unstable_now(),typeof At=="function"){S.callback=At,D(z),K=!0;break e}S===i(m)&&r(m),D(z)}else r(m);S=i(m)}if(S!==null)K=!0;else{var U=i(p);U!==null&&dt(W,U.startTime-z),K=!1}}break t}finally{S=null,x=Z,M=!1}K=void 0}}finally{K?st():F=!1}}}var st;if(typeof N=="function")st=function(){N(H)};else if(typeof MessageChannel<"u"){var at=new MessageChannel,ct=at.port2;at.port1.onmessage=H,st=function(){ct.postMessage(null)}}else st=function(){g(H,0)};function dt(z,K){O=g(function(){z(o.unstable_now())},K)}o.unstable_IdlePriority=5,o.unstable_ImmediatePriority=1,o.unstable_LowPriority=4,o.unstable_NormalPriority=3,o.unstable_Profiling=null,o.unstable_UserBlockingPriority=2,o.unstable_cancelCallback=function(z){z.callback=null},o.unstable_forceFrameRate=function(z){0>z||125<z?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):k=0<z?Math.floor(1e3/z):5},o.unstable_getCurrentPriorityLevel=function(){return x},o.unstable_next=function(z){switch(x){case 1:case 2:case 3:var K=3;break;default:K=x}var Z=x;x=K;try{return z()}finally{x=Z}},o.unstable_requestPaint=function(){y=!0},o.unstable_runWithPriority=function(z,K){switch(z){case 1:case 2:case 3:case 4:case 5:break;default:z=3}var Z=x;x=z;try{return K()}finally{x=Z}},o.unstable_scheduleCallback=function(z,K,Z){var xt=o.unstable_now();switch(typeof Z=="object"&&Z!==null?(Z=Z.delay,Z=typeof Z=="number"&&0<Z?xt+Z:xt):Z=xt,z){case 1:var At=-1;break;case 2:At=250;break;case 5:At=1073741823;break;case 4:At=1e4;break;default:At=5e3}return At=Z+At,z={id:v++,callback:K,priorityLevel:z,startTime:Z,expirationTime:At,sortIndex:-1},Z>xt?(z.sortIndex=Z,e(p,z),i(m)===null&&z===i(p)&&(R?(B(O),O=-1):R=!0,dt(W,Z-xt))):(z.sortIndex=At,e(m,z),b||M||(b=!0,F||(F=!0,st()))),z},o.unstable_shouldYield=C,o.unstable_wrapCallback=function(z){var K=x;return function(){var Z=x;x=K;try{return z.apply(this,arguments)}finally{x=Z}}}})(qf)),qf}var d_;function gx(){return d_||(d_=1,Wf.exports=mx()),Wf.exports}var Yf={exports:{}},Rn={};var p_;function _x(){if(p_)return Rn;p_=1;var o=md();function e(m){var p="https://react.dev/errors/"+m;if(1<arguments.length){p+="?args[]="+encodeURIComponent(arguments[1]);for(var v=2;v<arguments.length;v++)p+="&args[]="+encodeURIComponent(arguments[v])}return"Minified React error #"+m+"; visit "+p+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function i(){}var r={d:{f:i,r:function(){throw Error(e(522))},D:i,C:i,L:i,m:i,X:i,S:i,M:i},p:0,findDOMNode:null},l=Symbol.for("react.portal");function c(m,p,v){var S=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:l,key:S==null?null:""+S,children:m,containerInfo:p,implementation:v}}var h=o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function d(m,p){if(m==="font")return"";if(typeof p=="string")return p==="use-credentials"?p:""}return Rn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=r,Rn.createPortal=function(m,p){var v=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!p||p.nodeType!==1&&p.nodeType!==9&&p.nodeType!==11)throw Error(e(299));return c(m,p,null,v)},Rn.flushSync=function(m){var p=h.T,v=r.p;try{if(h.T=null,r.p=2,m)return m()}finally{h.T=p,r.p=v,r.d.f()}},Rn.preconnect=function(m,p){typeof m=="string"&&(p?(p=p.crossOrigin,p=typeof p=="string"?p==="use-credentials"?p:"":void 0):p=null,r.d.C(m,p))},Rn.prefetchDNS=function(m){typeof m=="string"&&r.d.D(m)},Rn.preinit=function(m,p){if(typeof m=="string"&&p&&typeof p.as=="string"){var v=p.as,S=d(v,p.crossOrigin),x=typeof p.integrity=="string"?p.integrity:void 0,M=typeof p.fetchPriority=="string"?p.fetchPriority:void 0;v==="style"?r.d.S(m,typeof p.precedence=="string"?p.precedence:void 0,{crossOrigin:S,integrity:x,fetchPriority:M}):v==="script"&&r.d.X(m,{crossOrigin:S,integrity:x,fetchPriority:M,nonce:typeof p.nonce=="string"?p.nonce:void 0})}},Rn.preinitModule=function(m,p){if(typeof m=="string")if(typeof p=="object"&&p!==null){if(p.as==null||p.as==="script"){var v=d(p.as,p.crossOrigin);r.d.M(m,{crossOrigin:v,integrity:typeof p.integrity=="string"?p.integrity:void 0,nonce:typeof p.nonce=="string"?p.nonce:void 0})}}else p==null&&r.d.M(m)},Rn.preload=function(m,p){if(typeof m=="string"&&typeof p=="object"&&p!==null&&typeof p.as=="string"){var v=p.as,S=d(v,p.crossOrigin);r.d.L(m,v,{crossOrigin:S,integrity:typeof p.integrity=="string"?p.integrity:void 0,nonce:typeof p.nonce=="string"?p.nonce:void 0,type:typeof p.type=="string"?p.type:void 0,fetchPriority:typeof p.fetchPriority=="string"?p.fetchPriority:void 0,referrerPolicy:typeof p.referrerPolicy=="string"?p.referrerPolicy:void 0,imageSrcSet:typeof p.imageSrcSet=="string"?p.imageSrcSet:void 0,imageSizes:typeof p.imageSizes=="string"?p.imageSizes:void 0,media:typeof p.media=="string"?p.media:void 0})}},Rn.preloadModule=function(m,p){if(typeof m=="string")if(p){var v=d(p.as,p.crossOrigin);r.d.m(m,{as:typeof p.as=="string"&&p.as!=="script"?p.as:void 0,crossOrigin:v,integrity:typeof p.integrity=="string"?p.integrity:void 0})}else r.d.m(m)},Rn.requestFormReset=function(m){r.d.r(m)},Rn.unstable_batchedUpdates=function(m,p){return m(p)},Rn.useFormState=function(m,p,v){return h.H.useFormState(m,p,v)},Rn.useFormStatus=function(){return h.H.useHostTransitionStatus()},Rn.version="19.2.7",Rn}var m_;function vx(){if(m_)return Yf.exports;m_=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(e){console.error(e)}}return o(),Yf.exports=_x(),Yf.exports}var g_;function Sx(){if(g_)return Mo;g_=1;var o=gx(),e=md(),i=vx();function r(t){var n="https://react.dev/errors/"+t;if(1<arguments.length){n+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)n+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+t+"; visit "+n+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function l(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function c(t){var n=t,a=t;if(t.alternate)for(;n.return;)n=n.return;else{t=n;do n=t,(n.flags&4098)!==0&&(a=n.return),t=n.return;while(t)}return n.tag===3?a:null}function h(t){if(t.tag===13){var n=t.memoizedState;if(n===null&&(t=t.alternate,t!==null&&(n=t.memoizedState)),n!==null)return n.dehydrated}return null}function d(t){if(t.tag===31){var n=t.memoizedState;if(n===null&&(t=t.alternate,t!==null&&(n=t.memoizedState)),n!==null)return n.dehydrated}return null}function m(t){if(c(t)!==t)throw Error(r(188))}function p(t){var n=t.alternate;if(!n){if(n=c(t),n===null)throw Error(r(188));return n!==t?null:t}for(var a=t,s=n;;){var u=a.return;if(u===null)break;var f=u.alternate;if(f===null){if(s=u.return,s!==null){a=s;continue}break}if(u.child===f.child){for(f=u.child;f;){if(f===a)return m(u),t;if(f===s)return m(u),n;f=f.sibling}throw Error(r(188))}if(a.return!==s.return)a=u,s=f;else{for(var _=!1,T=u.child;T;){if(T===a){_=!0,a=u,s=f;break}if(T===s){_=!0,s=u,a=f;break}T=T.sibling}if(!_){for(T=f.child;T;){if(T===a){_=!0,a=f,s=u;break}if(T===s){_=!0,s=f,a=u;break}T=T.sibling}if(!_)throw Error(r(189))}}if(a.alternate!==s)throw Error(r(190))}if(a.tag!==3)throw Error(r(188));return a.stateNode.current===a?t:n}function v(t){var n=t.tag;if(n===5||n===26||n===27||n===6)return t;for(t=t.child;t!==null;){if(n=v(t),n!==null)return n;t=t.sibling}return null}var S=Object.assign,x=Symbol.for("react.element"),M=Symbol.for("react.transitional.element"),b=Symbol.for("react.portal"),R=Symbol.for("react.fragment"),y=Symbol.for("react.strict_mode"),g=Symbol.for("react.profiler"),B=Symbol.for("react.consumer"),N=Symbol.for("react.context"),D=Symbol.for("react.forward_ref"),W=Symbol.for("react.suspense"),F=Symbol.for("react.suspense_list"),O=Symbol.for("react.memo"),k=Symbol.for("react.lazy"),w=Symbol.for("react.activity"),C=Symbol.for("react.memo_cache_sentinel"),H=Symbol.iterator;function st(t){return t===null||typeof t!="object"?null:(t=H&&t[H]||t["@@iterator"],typeof t=="function"?t:null)}var at=Symbol.for("react.client.reference");function ct(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===at?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case R:return"Fragment";case g:return"Profiler";case y:return"StrictMode";case W:return"Suspense";case F:return"SuspenseList";case w:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case b:return"Portal";case N:return t.displayName||"Context";case B:return(t._context.displayName||"Context")+".Consumer";case D:var n=t.render;return t=t.displayName,t||(t=n.displayName||n.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case O:return n=t.displayName||null,n!==null?n:ct(t.type)||"Memo";case k:n=t._payload,t=t._init;try{return ct(t(n))}catch{}}return null}var dt=Array.isArray,z=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,K=i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Z={pending:!1,data:null,method:null,action:null},xt=[],At=-1;function U(t){return{current:t}}function nt(t){0>At||(t.current=xt[At],xt[At]=null,At--)}function St(t,n){At++,xt[At]=t.current,t.current=n}var j=U(null),ft=U(null),Tt=U(null),yt=U(null);function Ot(t,n){switch(St(Tt,n),St(ft,t),St(j,null),n.nodeType){case 9:case 11:t=(t=n.documentElement)&&(t=t.namespaceURI)?Ug(t):0;break;default:if(t=n.tagName,n=n.namespaceURI)n=Ug(n),t=Lg(n,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}nt(j),St(j,t)}function Kt(){nt(j),nt(ft),nt(Tt)}function Qt(t){t.memoizedState!==null&&St(yt,t);var n=j.current,a=Lg(n,t.type);n!==a&&(St(ft,t),St(j,a))}function Le(t){ft.current===t&&(nt(j),nt(ft)),yt.current===t&&(nt(yt),_o._currentValue=Z)}var He,Me;function I(t){if(He===void 0)try{throw Error()}catch(a){var n=a.stack.trim().match(/\n( *(at )?)/);He=n&&n[1]||"",Me=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+He+t+Me}var un=!1;function _e(t,n){if(!t||un)return"";un=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var s={DetermineComponentFrameRoot:function(){try{if(n){var mt=function(){throw Error()};if(Object.defineProperty(mt.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(mt,[])}catch(ot){var tt=ot}Reflect.construct(t,[],mt)}else{try{mt.call()}catch(ot){tt=ot}t.call(mt.prototype)}}else{try{throw Error()}catch(ot){tt=ot}(mt=t())&&typeof mt.catch=="function"&&mt.catch(function(){})}}catch(ot){if(ot&&tt&&typeof ot.stack=="string")return[ot.stack,tt.stack]}return[null,null]}};s.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var u=Object.getOwnPropertyDescriptor(s.DetermineComponentFrameRoot,"name");u&&u.configurable&&Object.defineProperty(s.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var f=s.DetermineComponentFrameRoot(),_=f[0],T=f[1];if(_&&T){var P=_.split(`
`),J=T.split(`
`);for(u=s=0;s<P.length&&!P[s].includes("DetermineComponentFrameRoot");)s++;for(;u<J.length&&!J[u].includes("DetermineComponentFrameRoot");)u++;if(s===P.length||u===J.length)for(s=P.length-1,u=J.length-1;1<=s&&0<=u&&P[s]!==J[u];)u--;for(;1<=s&&0<=u;s--,u--)if(P[s]!==J[u]){if(s!==1||u!==1)do if(s--,u--,0>u||P[s]!==J[u]){var ut=`
`+P[s].replace(" at new "," at ");return t.displayName&&ut.includes("<anonymous>")&&(ut=ut.replace("<anonymous>",t.displayName)),ut}while(1<=s&&0<=u);break}}}finally{un=!1,Error.prepareStackTrace=a}return(a=t?t.displayName||t.name:"")?I(a):""}function Ne(t,n){switch(t.tag){case 26:case 27:case 5:return I(t.type);case 16:return I("Lazy");case 13:return t.child!==n&&n!==null?I("Suspense Fallback"):I("Suspense");case 19:return I("SuspenseList");case 0:case 15:return _e(t.type,!1);case 11:return _e(t.type.render,!1);case 1:return _e(t.type,!0);case 31:return I("Activity");default:return""}}function Vt(t){try{var n="",a=null;do n+=Ne(t,a),a=t,t=t.return;while(t);return n}catch(s){return`
Error generating stack: `+s.message+`
`+s.stack}}var de=Object.prototype.hasOwnProperty,Yt=o.unstable_scheduleCallback,ie=o.unstable_cancelCallback,tn=o.unstable_shouldYield,L=o.unstable_requestPaint,E=o.unstable_now,$=o.unstable_getCurrentPriorityLevel,pt=o.unstable_ImmediatePriority,_t=o.unstable_UserBlockingPriority,lt=o.unstable_NormalPriority,Xt=o.unstable_LowPriority,Ct=o.unstable_IdlePriority,Ht=o.log,kt=o.unstable_setDisableYieldValue,vt=null,Rt=null;function Wt(t){if(typeof Ht=="function"&&kt(t),Rt&&typeof Rt.setStrictMode=="function")try{Rt.setStrictMode(vt,t)}catch{}}var Ft=Math.clz32?Math.clz32:V,wt=Math.log,ee=Math.LN2;function V(t){return t>>>=0,t===0?32:31-(wt(t)/ee|0)|0}var Dt=256,Mt=262144,Pt=4194304;function Et(t){var n=t&42;if(n!==0)return n;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function gt(t,n,a){var s=t.pendingLanes;if(s===0)return 0;var u=0,f=t.suspendedLanes,_=t.pingedLanes;t=t.warmLanes;var T=s&134217727;return T!==0?(s=T&~f,s!==0?u=Et(s):(_&=T,_!==0?u=Et(_):a||(a=T&~t,a!==0&&(u=Et(a))))):(T=s&~f,T!==0?u=Et(T):_!==0?u=Et(_):a||(a=s&~t,a!==0&&(u=Et(a)))),u===0?0:n!==0&&n!==u&&(n&f)===0&&(f=u&-u,a=n&-n,f>=a||f===32&&(a&4194048)!==0)?n:u}function Bt(t,n){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&n)===0}function ne(t,n){switch(t){case 1:case 2:case 4:case 8:case 64:return n+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Oe(){var t=Pt;return Pt<<=1,(Pt&62914560)===0&&(Pt=4194304),t}function Ee(t){for(var n=[],a=0;31>a;a++)n.push(t);return n}function gn(t,n){t.pendingLanes|=n,n!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function ci(t,n,a,s,u,f){var _=t.pendingLanes;t.pendingLanes=a,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=a,t.entangledLanes&=a,t.errorRecoveryDisabledLanes&=a,t.shellSuspendCounter=0;var T=t.entanglements,P=t.expirationTimes,J=t.hiddenUpdates;for(a=_&~a;0<a;){var ut=31-Ft(a),mt=1<<ut;T[ut]=0,P[ut]=-1;var tt=J[ut];if(tt!==null)for(J[ut]=null,ut=0;ut<tt.length;ut++){var ot=tt[ut];ot!==null&&(ot.lane&=-536870913)}a&=~mt}s!==0&&Cs(t,s,0),f!==0&&u===0&&t.tag!==0&&(t.suspendedLanes|=f&~(_&~n))}function Cs(t,n,a){t.pendingLanes|=n,t.suspendedLanes&=~n;var s=31-Ft(n);t.entangledLanes|=n,t.entanglements[s]=t.entanglements[s]|1073741824|a&261930}function ws(t,n){var a=t.entangledLanes|=n;for(t=t.entanglements;a;){var s=31-Ft(a),u=1<<s;u&n|t[s]&n&&(t[s]|=n),a&=~u}}function Ti(t,n){var a=n&-n;return a=(a&42)!==0?1:Xa(a),(a&(t.suspendedLanes|n))!==0?0:a}function Xa(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Mr(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function Ds(){var t=K.p;return t!==0?t:(t=window.event,t===void 0?32:e_(t.type))}function ka(t,n){var a=K.p;try{return K.p=t,n()}finally{K.p=a}}var fi=Math.random().toString(36).slice(2),Ze="__reactFiber$"+fi,_n="__reactProps$"+fi,Oi="__reactContainer$"+fi,Us="__reactEvents$"+fi,zu="__reactListeners$"+fi,Pu="__reactHandles$"+fi,Ho="__reactResources$"+fi,Wa="__reactMarker$"+fi;function Ls(t){delete t[Ze],delete t[_n],delete t[Us],delete t[zu],delete t[Pu]}function A(t){var n=t[Ze];if(n)return n;for(var a=t.parentNode;a;){if(n=a[Oi]||a[Ze]){if(a=n.alternate,n.child!==null||a!==null&&a.child!==null)for(t=Fg(t);t!==null;){if(a=t[Ze])return a;t=Fg(t)}return n}t=a,a=t.parentNode}return null}function q(t){if(t=t[Ze]||t[Oi]){var n=t.tag;if(n===5||n===6||n===13||n===31||n===26||n===27||n===3)return t}return null}function it(t){var n=t.tag;if(n===5||n===26||n===27||n===6)return t.stateNode;throw Error(r(33))}function rt(t){var n=t[Ho];return n||(n=t[Ho]={hoistableStyles:new Map,hoistableScripts:new Map}),n}function X(t){t[Wa]=!0}var bt=new Set,Ut={};function zt(t,n){Nt(t,n),Nt(t+"Capture",n)}function Nt(t,n){for(Ut[t]=n,t=0;t<n.length;t++)bt.add(n[t])}var $t=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),te={},qt={};function ce(t){return de.call(qt,t)?!0:de.call(te,t)?!1:$t.test(t)?qt[t]=!0:(te[t]=!0,!1)}function Te(t,n,a){if(ce(n))if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":t.removeAttribute(n);return;case"boolean":var s=n.toLowerCase().slice(0,5);if(s!=="data-"&&s!=="aria-"){t.removeAttribute(n);return}}t.setAttribute(n,""+a)}}function Ge(t,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttribute(n,""+a)}}function ve(t,n,a,s){if(s===null)t.removeAttribute(a);else{switch(typeof s){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(a);return}t.setAttributeNS(n,a,""+s)}}function le(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Zt(t){var n=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(n==="checkbox"||n==="radio")}function ke(t,n,a){var s=Object.getOwnPropertyDescriptor(t.constructor.prototype,n);if(!t.hasOwnProperty(n)&&typeof s<"u"&&typeof s.get=="function"&&typeof s.set=="function"){var u=s.get,f=s.set;return Object.defineProperty(t,n,{configurable:!0,get:function(){return u.call(this)},set:function(_){a=""+_,f.call(this,_)}}),Object.defineProperty(t,n,{enumerable:s.enumerable}),{getValue:function(){return a},setValue:function(_){a=""+_},stopTracking:function(){t._valueTracker=null,delete t[n]}}}}function pe(t){if(!t._valueTracker){var n=Zt(t)?"checked":"value";t._valueTracker=ke(t,n,""+t[n])}}function bn(t){if(!t)return!1;var n=t._valueTracker;if(!n)return!0;var a=n.getValue(),s="";return t&&(s=Zt(t)?t.checked?"true":"false":t.value),t=s,t!==a?(n.setValue(t),!0):!1}function hi(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var Dn=/[\n"\\]/g;function dn(t){return t.replace(Dn,function(n){return"\\"+n.charCodeAt(0).toString(16)+" "})}function ze(t,n,a,s,u,f,_,T){t.name="",_!=null&&typeof _!="function"&&typeof _!="symbol"&&typeof _!="boolean"?t.type=_:t.removeAttribute("type"),n!=null?_==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+le(n)):t.value!==""+le(n)&&(t.value=""+le(n)):_!=="submit"&&_!=="reset"||t.removeAttribute("value"),n!=null?An(t,_,le(n)):a!=null?An(t,_,le(a)):s!=null&&t.removeAttribute("value"),u==null&&f!=null&&(t.defaultChecked=!!f),u!=null&&(t.checked=u&&typeof u!="function"&&typeof u!="symbol"),T!=null&&typeof T!="function"&&typeof T!="symbol"&&typeof T!="boolean"?t.name=""+le(T):t.removeAttribute("name")}function Un(t,n,a,s,u,f,_,T){if(f!=null&&typeof f!="function"&&typeof f!="symbol"&&typeof f!="boolean"&&(t.type=f),n!=null||a!=null){if(!(f!=="submit"&&f!=="reset"||n!=null)){pe(t);return}a=a!=null?""+le(a):"",n=n!=null?""+le(n):a,T||n===t.value||(t.value=n),t.defaultValue=n}s=s??u,s=typeof s!="function"&&typeof s!="symbol"&&!!s,t.checked=T?t.checked:!!s,t.defaultChecked=!!s,_!=null&&typeof _!="function"&&typeof _!="symbol"&&typeof _!="boolean"&&(t.name=_),pe(t)}function An(t,n,a){n==="number"&&hi(t.ownerDocument)===t||t.defaultValue===""+a||(t.defaultValue=""+a)}function Ke(t,n,a,s){if(t=t.options,n){n={};for(var u=0;u<a.length;u++)n["$"+a[u]]=!0;for(a=0;a<t.length;a++)u=n.hasOwnProperty("$"+t[a].value),t[a].selected!==u&&(t[a].selected=u),u&&s&&(t[a].defaultSelected=!0)}else{for(a=""+le(a),n=null,u=0;u<t.length;u++){if(t[u].value===a){t[u].selected=!0,s&&(t[u].defaultSelected=!0);return}n!==null||t[u].disabled||(n=t[u])}n!==null&&(n.selected=!0)}}function vn(t,n,a){if(n!=null&&(n=""+le(n),n!==t.value&&(t.value=n),a==null)){t.defaultValue!==n&&(t.defaultValue=n);return}t.defaultValue=a!=null?""+le(a):""}function Er(t,n,a,s){if(n==null){if(s!=null){if(a!=null)throw Error(r(92));if(dt(s)){if(1<s.length)throw Error(r(93));s=s[0]}a=s}a==null&&(a=""),n=a}a=le(n),t.defaultValue=a,s=t.textContent,s===a&&s!==""&&s!==null&&(t.value=s),pe(t)}function On(t,n){if(n){var a=t.firstChild;if(a&&a===t.lastChild&&a.nodeType===3){a.nodeValue=n;return}}t.textContent=n}var o0=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Cd(t,n,a){var s=n.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?s?t.setProperty(n,""):n==="float"?t.cssFloat="":t[n]="":s?t.setProperty(n,a):typeof a!="number"||a===0||o0.has(n)?n==="float"?t.cssFloat=a:t[n]=(""+a).trim():t[n]=a+"px"}function wd(t,n,a){if(n!=null&&typeof n!="object")throw Error(r(62));if(t=t.style,a!=null){for(var s in a)!a.hasOwnProperty(s)||n!=null&&n.hasOwnProperty(s)||(s.indexOf("--")===0?t.setProperty(s,""):s==="float"?t.cssFloat="":t[s]="");for(var u in n)s=n[u],n.hasOwnProperty(u)&&a[u]!==s&&Cd(t,u,s)}else for(var f in n)n.hasOwnProperty(f)&&Cd(t,f,n[f])}function Bu(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var l0=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),u0=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Go(t){return u0.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function zi(){}var Iu=null;function Fu(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Tr=null,br=null;function Dd(t){var n=q(t);if(n&&(t=n.stateNode)){var a=t[_n]||null;t:switch(t=n.stateNode,n.type){case"input":if(ze(t,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),n=a.name,a.type==="radio"&&n!=null){for(a=t;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+dn(""+n)+'"][type="radio"]'),n=0;n<a.length;n++){var s=a[n];if(s!==t&&s.form===t.form){var u=s[_n]||null;if(!u)throw Error(r(90));ze(s,u.value,u.defaultValue,u.defaultValue,u.checked,u.defaultChecked,u.type,u.name)}}for(n=0;n<a.length;n++)s=a[n],s.form===t.form&&bn(s)}break t;case"textarea":vn(t,a.value,a.defaultValue);break t;case"select":n=a.value,n!=null&&Ke(t,!!a.multiple,n,!1)}}}var Hu=!1;function Ud(t,n,a){if(Hu)return t(n,a);Hu=!0;try{var s=t(n);return s}finally{if(Hu=!1,(Tr!==null||br!==null)&&(Cl(),Tr&&(n=Tr,t=br,br=Tr=null,Dd(n),t)))for(n=0;n<t.length;n++)Dd(t[n])}}function Ns(t,n){var a=t.stateNode;if(a===null)return null;var s=a[_n]||null;if(s===null)return null;a=s[n];t:switch(n){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(s=!s.disabled)||(t=t.type,s=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!s;break t;default:t=!1}if(t)return null;if(a&&typeof a!="function")throw Error(r(231,n,typeof a));return a}var Pi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Gu=!1;if(Pi)try{var Os={};Object.defineProperty(Os,"passive",{get:function(){Gu=!0}}),window.addEventListener("test",Os,Os),window.removeEventListener("test",Os,Os)}catch{Gu=!1}var ua=null,Vu=null,Vo=null;function Ld(){if(Vo)return Vo;var t,n=Vu,a=n.length,s,u="value"in ua?ua.value:ua.textContent,f=u.length;for(t=0;t<a&&n[t]===u[t];t++);var _=a-t;for(s=1;s<=_&&n[a-s]===u[f-s];s++);return Vo=u.slice(t,1<s?1-s:void 0)}function Xo(t){var n=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&n===13&&(t=13)):t=n,t===10&&(t=13),32<=t||t===13?t:0}function ko(){return!0}function Nd(){return!1}function zn(t){function n(a,s,u,f,_){this._reactName=a,this._targetInst=u,this.type=s,this.nativeEvent=f,this.target=_,this.currentTarget=null;for(var T in t)t.hasOwnProperty(T)&&(a=t[T],this[T]=a?a(f):f[T]);return this.isDefaultPrevented=(f.defaultPrevented!=null?f.defaultPrevented:f.returnValue===!1)?ko:Nd,this.isPropagationStopped=Nd,this}return S(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=ko)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=ko)},persist:function(){},isPersistent:ko}),n}var qa={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Wo=zn(qa),zs=S({},qa,{view:0,detail:0}),c0=zn(zs),Xu,ku,Ps,qo=S({},zs,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:qu,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Ps&&(Ps&&t.type==="mousemove"?(Xu=t.screenX-Ps.screenX,ku=t.screenY-Ps.screenY):ku=Xu=0,Ps=t),Xu)},movementY:function(t){return"movementY"in t?t.movementY:ku}}),Od=zn(qo),f0=S({},qo,{dataTransfer:0}),h0=zn(f0),d0=S({},zs,{relatedTarget:0}),Wu=zn(d0),p0=S({},qa,{animationName:0,elapsedTime:0,pseudoElement:0}),m0=zn(p0),g0=S({},qa,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),_0=zn(g0),v0=S({},qa,{data:0}),zd=zn(v0),S0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},x0={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},y0={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function M0(t){var n=this.nativeEvent;return n.getModifierState?n.getModifierState(t):(t=y0[t])?!!n[t]:!1}function qu(){return M0}var E0=S({},zs,{key:function(t){if(t.key){var n=S0[t.key]||t.key;if(n!=="Unidentified")return n}return t.type==="keypress"?(t=Xo(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?x0[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:qu,charCode:function(t){return t.type==="keypress"?Xo(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Xo(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),T0=zn(E0),b0=S({},qo,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Pd=zn(b0),A0=S({},zs,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:qu}),R0=zn(A0),C0=S({},qa,{propertyName:0,elapsedTime:0,pseudoElement:0}),w0=zn(C0),D0=S({},qo,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),U0=zn(D0),L0=S({},qa,{newState:0,oldState:0}),N0=zn(L0),O0=[9,13,27,32],Yu=Pi&&"CompositionEvent"in window,Bs=null;Pi&&"documentMode"in document&&(Bs=document.documentMode);var z0=Pi&&"TextEvent"in window&&!Bs,Bd=Pi&&(!Yu||Bs&&8<Bs&&11>=Bs),Id=" ",Fd=!1;function Hd(t,n){switch(t){case"keyup":return O0.indexOf(n.keyCode)!==-1;case"keydown":return n.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Gd(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Ar=!1;function P0(t,n){switch(t){case"compositionend":return Gd(n);case"keypress":return n.which!==32?null:(Fd=!0,Id);case"textInput":return t=n.data,t===Id&&Fd?null:t;default:return null}}function B0(t,n){if(Ar)return t==="compositionend"||!Yu&&Hd(t,n)?(t=Ld(),Vo=Vu=ua=null,Ar=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(n.ctrlKey||n.altKey||n.metaKey)||n.ctrlKey&&n.altKey){if(n.char&&1<n.char.length)return n.char;if(n.which)return String.fromCharCode(n.which)}return null;case"compositionend":return Bd&&n.locale!=="ko"?null:n.data;default:return null}}var I0={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Vd(t){var n=t&&t.nodeName&&t.nodeName.toLowerCase();return n==="input"?!!I0[t.type]:n==="textarea"}function Xd(t,n,a,s){Tr?br?br.push(s):br=[s]:Tr=s,n=zl(n,"onChange"),0<n.length&&(a=new Wo("onChange","change",null,a,s),t.push({event:a,listeners:n}))}var Is=null,Fs=null;function F0(t){bg(t,0)}function Yo(t){var n=it(t);if(bn(n))return t}function kd(t,n){if(t==="change")return n}var Wd=!1;if(Pi){var ju;if(Pi){var Zu="oninput"in document;if(!Zu){var qd=document.createElement("div");qd.setAttribute("oninput","return;"),Zu=typeof qd.oninput=="function"}ju=Zu}else ju=!1;Wd=ju&&(!document.documentMode||9<document.documentMode)}function Yd(){Is&&(Is.detachEvent("onpropertychange",jd),Fs=Is=null)}function jd(t){if(t.propertyName==="value"&&Yo(Fs)){var n=[];Xd(n,Fs,t,Fu(t)),Ud(F0,n)}}function H0(t,n,a){t==="focusin"?(Yd(),Is=n,Fs=a,Is.attachEvent("onpropertychange",jd)):t==="focusout"&&Yd()}function G0(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Yo(Fs)}function V0(t,n){if(t==="click")return Yo(n)}function X0(t,n){if(t==="input"||t==="change")return Yo(n)}function k0(t,n){return t===n&&(t!==0||1/t===1/n)||t!==t&&n!==n}var kn=typeof Object.is=="function"?Object.is:k0;function Hs(t,n){if(kn(t,n))return!0;if(typeof t!="object"||t===null||typeof n!="object"||n===null)return!1;var a=Object.keys(t),s=Object.keys(n);if(a.length!==s.length)return!1;for(s=0;s<a.length;s++){var u=a[s];if(!de.call(n,u)||!kn(t[u],n[u]))return!1}return!0}function Zd(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Kd(t,n){var a=Zd(t);t=0;for(var s;a;){if(a.nodeType===3){if(s=t+a.textContent.length,t<=n&&s>=n)return{node:a,offset:n-t};t=s}t:{for(;a;){if(a.nextSibling){a=a.nextSibling;break t}a=a.parentNode}a=void 0}a=Zd(a)}}function Qd(t,n){return t&&n?t===n?!0:t&&t.nodeType===3?!1:n&&n.nodeType===3?Qd(t,n.parentNode):"contains"in t?t.contains(n):t.compareDocumentPosition?!!(t.compareDocumentPosition(n)&16):!1:!1}function Jd(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var n=hi(t.document);n instanceof t.HTMLIFrameElement;){try{var a=typeof n.contentWindow.location.href=="string"}catch{a=!1}if(a)t=n.contentWindow;else break;n=hi(t.document)}return n}function Ku(t){var n=t&&t.nodeName&&t.nodeName.toLowerCase();return n&&(n==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||n==="textarea"||t.contentEditable==="true")}var W0=Pi&&"documentMode"in document&&11>=document.documentMode,Rr=null,Qu=null,Gs=null,Ju=!1;function $d(t,n,a){var s=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Ju||Rr==null||Rr!==hi(s)||(s=Rr,"selectionStart"in s&&Ku(s)?s={start:s.selectionStart,end:s.selectionEnd}:(s=(s.ownerDocument&&s.ownerDocument.defaultView||window).getSelection(),s={anchorNode:s.anchorNode,anchorOffset:s.anchorOffset,focusNode:s.focusNode,focusOffset:s.focusOffset}),Gs&&Hs(Gs,s)||(Gs=s,s=zl(Qu,"onSelect"),0<s.length&&(n=new Wo("onSelect","select",null,n,a),t.push({event:n,listeners:s}),n.target=Rr)))}function Ya(t,n){var a={};return a[t.toLowerCase()]=n.toLowerCase(),a["Webkit"+t]="webkit"+n,a["Moz"+t]="moz"+n,a}var Cr={animationend:Ya("Animation","AnimationEnd"),animationiteration:Ya("Animation","AnimationIteration"),animationstart:Ya("Animation","AnimationStart"),transitionrun:Ya("Transition","TransitionRun"),transitionstart:Ya("Transition","TransitionStart"),transitioncancel:Ya("Transition","TransitionCancel"),transitionend:Ya("Transition","TransitionEnd")},$u={},tp={};Pi&&(tp=document.createElement("div").style,"AnimationEvent"in window||(delete Cr.animationend.animation,delete Cr.animationiteration.animation,delete Cr.animationstart.animation),"TransitionEvent"in window||delete Cr.transitionend.transition);function ja(t){if($u[t])return $u[t];if(!Cr[t])return t;var n=Cr[t],a;for(a in n)if(n.hasOwnProperty(a)&&a in tp)return $u[t]=n[a];return t}var ep=ja("animationend"),np=ja("animationiteration"),ip=ja("animationstart"),q0=ja("transitionrun"),Y0=ja("transitionstart"),j0=ja("transitioncancel"),ap=ja("transitionend"),rp=new Map,tc="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");tc.push("scrollEnd");function di(t,n){rp.set(t,n),zt(n,[t])}var jo=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var n=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(n))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ti=[],wr=0,ec=0;function Zo(){for(var t=wr,n=ec=wr=0;n<t;){var a=ti[n];ti[n++]=null;var s=ti[n];ti[n++]=null;var u=ti[n];ti[n++]=null;var f=ti[n];if(ti[n++]=null,s!==null&&u!==null){var _=s.pending;_===null?u.next=u:(u.next=_.next,_.next=u),s.pending=u}f!==0&&sp(a,u,f)}}function Ko(t,n,a,s){ti[wr++]=t,ti[wr++]=n,ti[wr++]=a,ti[wr++]=s,ec|=s,t.lanes|=s,t=t.alternate,t!==null&&(t.lanes|=s)}function nc(t,n,a,s){return Ko(t,n,a,s),Qo(t)}function Za(t,n){return Ko(t,null,null,n),Qo(t)}function sp(t,n,a){t.lanes|=a;var s=t.alternate;s!==null&&(s.lanes|=a);for(var u=!1,f=t.return;f!==null;)f.childLanes|=a,s=f.alternate,s!==null&&(s.childLanes|=a),f.tag===22&&(t=f.stateNode,t===null||t._visibility&1||(u=!0)),t=f,f=f.return;return t.tag===3?(f=t.stateNode,u&&n!==null&&(u=31-Ft(a),t=f.hiddenUpdates,s=t[u],s===null?t[u]=[n]:s.push(n),n.lane=a|536870912),f):null}function Qo(t){if(50<uo)throw uo=0,hf=null,Error(r(185));for(var n=t.return;n!==null;)t=n,n=t.return;return t.tag===3?t.stateNode:null}var Dr={};function Z0(t,n,a,s){this.tag=t,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=n,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=s,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Wn(t,n,a,s){return new Z0(t,n,a,s)}function ic(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Bi(t,n){var a=t.alternate;return a===null?(a=Wn(t.tag,n,t.key,t.mode),a.elementType=t.elementType,a.type=t.type,a.stateNode=t.stateNode,a.alternate=t,t.alternate=a):(a.pendingProps=n,a.type=t.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=t.flags&65011712,a.childLanes=t.childLanes,a.lanes=t.lanes,a.child=t.child,a.memoizedProps=t.memoizedProps,a.memoizedState=t.memoizedState,a.updateQueue=t.updateQueue,n=t.dependencies,a.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext},a.sibling=t.sibling,a.index=t.index,a.ref=t.ref,a.refCleanup=t.refCleanup,a}function op(t,n){t.flags&=65011714;var a=t.alternate;return a===null?(t.childLanes=0,t.lanes=n,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=a.childLanes,t.lanes=a.lanes,t.child=a.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=a.memoizedProps,t.memoizedState=a.memoizedState,t.updateQueue=a.updateQueue,t.type=a.type,n=a.dependencies,t.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),t}function Jo(t,n,a,s,u,f){var _=0;if(s=t,typeof t=="function")ic(t)&&(_=1);else if(typeof t=="string")_=tx(t,a,j.current)?26:t==="html"||t==="head"||t==="body"?27:5;else t:switch(t){case w:return t=Wn(31,a,n,u),t.elementType=w,t.lanes=f,t;case R:return Ka(a.children,u,f,n);case y:_=8,u|=24;break;case g:return t=Wn(12,a,n,u|2),t.elementType=g,t.lanes=f,t;case W:return t=Wn(13,a,n,u),t.elementType=W,t.lanes=f,t;case F:return t=Wn(19,a,n,u),t.elementType=F,t.lanes=f,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case N:_=10;break t;case B:_=9;break t;case D:_=11;break t;case O:_=14;break t;case k:_=16,s=null;break t}_=29,a=Error(r(130,t===null?"null":typeof t,"")),s=null}return n=Wn(_,a,n,u),n.elementType=t,n.type=s,n.lanes=f,n}function Ka(t,n,a,s){return t=Wn(7,t,s,n),t.lanes=a,t}function ac(t,n,a){return t=Wn(6,t,null,n),t.lanes=a,t}function lp(t){var n=Wn(18,null,null,0);return n.stateNode=t,n}function rc(t,n,a){return n=Wn(4,t.children!==null?t.children:[],t.key,n),n.lanes=a,n.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},n}var up=new WeakMap;function ei(t,n){if(typeof t=="object"&&t!==null){var a=up.get(t);return a!==void 0?a:(n={value:t,source:n,stack:Vt(n)},up.set(t,n),n)}return{value:t,source:n,stack:Vt(n)}}var Ur=[],Lr=0,$o=null,Vs=0,ni=[],ii=0,ca=null,bi=1,Ai="";function Ii(t,n){Ur[Lr++]=Vs,Ur[Lr++]=$o,$o=t,Vs=n}function cp(t,n,a){ni[ii++]=bi,ni[ii++]=Ai,ni[ii++]=ca,ca=t;var s=bi;t=Ai;var u=32-Ft(s)-1;s&=~(1<<u),a+=1;var f=32-Ft(n)+u;if(30<f){var _=u-u%5;f=(s&(1<<_)-1).toString(32),s>>=_,u-=_,bi=1<<32-Ft(n)+u|a<<u|s,Ai=f+t}else bi=1<<f|a<<u|s,Ai=t}function sc(t){t.return!==null&&(Ii(t,1),cp(t,1,0))}function oc(t){for(;t===$o;)$o=Ur[--Lr],Ur[Lr]=null,Vs=Ur[--Lr],Ur[Lr]=null;for(;t===ca;)ca=ni[--ii],ni[ii]=null,Ai=ni[--ii],ni[ii]=null,bi=ni[--ii],ni[ii]=null}function fp(t,n){ni[ii++]=bi,ni[ii++]=Ai,ni[ii++]=ca,bi=n.id,Ai=n.overflow,ca=t}var Sn=null,We=null,Se=!1,fa=null,ai=!1,lc=Error(r(519));function ha(t){var n=Error(r(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Xs(ei(n,t)),lc}function hp(t){var n=t.stateNode,a=t.type,s=t.memoizedProps;switch(n[Ze]=t,n[_n]=s,a){case"dialog":he("cancel",n),he("close",n);break;case"iframe":case"object":case"embed":he("load",n);break;case"video":case"audio":for(a=0;a<fo.length;a++)he(fo[a],n);break;case"source":he("error",n);break;case"img":case"image":case"link":he("error",n),he("load",n);break;case"details":he("toggle",n);break;case"input":he("invalid",n),Un(n,s.value,s.defaultValue,s.checked,s.defaultChecked,s.type,s.name,!0);break;case"select":he("invalid",n);break;case"textarea":he("invalid",n),Er(n,s.value,s.defaultValue,s.children)}a=s.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||n.textContent===""+a||s.suppressHydrationWarning===!0||wg(n.textContent,a)?(s.popover!=null&&(he("beforetoggle",n),he("toggle",n)),s.onScroll!=null&&he("scroll",n),s.onScrollEnd!=null&&he("scrollend",n),s.onClick!=null&&(n.onclick=zi),n=!0):n=!1,n||ha(t,!0)}function dp(t){for(Sn=t.return;Sn;)switch(Sn.tag){case 5:case 31:case 13:ai=!1;return;case 27:case 3:ai=!0;return;default:Sn=Sn.return}}function Nr(t){if(t!==Sn)return!1;if(!Se)return dp(t),Se=!0,!1;var n=t.tag,a;if((a=n!==3&&n!==27)&&((a=n===5)&&(a=t.type,a=!(a!=="form"&&a!=="button")||Rf(t.type,t.memoizedProps)),a=!a),a&&We&&ha(t),dp(t),n===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(r(317));We=Ig(t)}else if(n===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(r(317));We=Ig(t)}else n===27?(n=We,Aa(t.type)?(t=Lf,Lf=null,We=t):We=n):We=Sn?si(t.stateNode.nextSibling):null;return!0}function Qa(){We=Sn=null,Se=!1}function uc(){var t=fa;return t!==null&&(Fn===null?Fn=t:Fn.push.apply(Fn,t),fa=null),t}function Xs(t){fa===null?fa=[t]:fa.push(t)}var cc=U(null),Ja=null,Fi=null;function da(t,n,a){St(cc,n._currentValue),n._currentValue=a}function Hi(t){t._currentValue=cc.current,nt(cc)}function fc(t,n,a){for(;t!==null;){var s=t.alternate;if((t.childLanes&n)!==n?(t.childLanes|=n,s!==null&&(s.childLanes|=n)):s!==null&&(s.childLanes&n)!==n&&(s.childLanes|=n),t===a)break;t=t.return}}function hc(t,n,a,s){var u=t.child;for(u!==null&&(u.return=t);u!==null;){var f=u.dependencies;if(f!==null){var _=u.child;f=f.firstContext;t:for(;f!==null;){var T=f;f=u;for(var P=0;P<n.length;P++)if(T.context===n[P]){f.lanes|=a,T=f.alternate,T!==null&&(T.lanes|=a),fc(f.return,a,t),s||(_=null);break t}f=T.next}}else if(u.tag===18){if(_=u.return,_===null)throw Error(r(341));_.lanes|=a,f=_.alternate,f!==null&&(f.lanes|=a),fc(_,a,t),_=null}else _=u.child;if(_!==null)_.return=u;else for(_=u;_!==null;){if(_===t){_=null;break}if(u=_.sibling,u!==null){u.return=_.return,_=u;break}_=_.return}u=_}}function Or(t,n,a,s){t=null;for(var u=n,f=!1;u!==null;){if(!f){if((u.flags&524288)!==0)f=!0;else if((u.flags&262144)!==0)break}if(u.tag===10){var _=u.alternate;if(_===null)throw Error(r(387));if(_=_.memoizedProps,_!==null){var T=u.type;kn(u.pendingProps.value,_.value)||(t!==null?t.push(T):t=[T])}}else if(u===yt.current){if(_=u.alternate,_===null)throw Error(r(387));_.memoizedState.memoizedState!==u.memoizedState.memoizedState&&(t!==null?t.push(_o):t=[_o])}u=u.return}t!==null&&hc(n,t,a,s),n.flags|=262144}function tl(t){for(t=t.firstContext;t!==null;){if(!kn(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function $a(t){Ja=t,Fi=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function xn(t){return pp(Ja,t)}function el(t,n){return Ja===null&&$a(t),pp(t,n)}function pp(t,n){var a=n._currentValue;if(n={context:n,memoizedValue:a,next:null},Fi===null){if(t===null)throw Error(r(308));Fi=n,t.dependencies={lanes:0,firstContext:n},t.flags|=524288}else Fi=Fi.next=n;return a}var K0=typeof AbortController<"u"?AbortController:function(){var t=[],n=this.signal={aborted:!1,addEventListener:function(a,s){t.push(s)}};this.abort=function(){n.aborted=!0,t.forEach(function(a){return a()})}},Q0=o.unstable_scheduleCallback,J0=o.unstable_NormalPriority,an={$$typeof:N,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function dc(){return{controller:new K0,data:new Map,refCount:0}}function ks(t){t.refCount--,t.refCount===0&&Q0(J0,function(){t.controller.abort()})}var Ws=null,pc=0,zr=0,Pr=null;function $0(t,n){if(Ws===null){var a=Ws=[];pc=0,zr=vf(),Pr={status:"pending",value:void 0,then:function(s){a.push(s)}}}return pc++,n.then(mp,mp),n}function mp(){if(--pc===0&&Ws!==null){Pr!==null&&(Pr.status="fulfilled");var t=Ws;Ws=null,zr=0,Pr=null;for(var n=0;n<t.length;n++)(0,t[n])()}}function tS(t,n){var a=[],s={status:"pending",value:null,reason:null,then:function(u){a.push(u)}};return t.then(function(){s.status="fulfilled",s.value=n;for(var u=0;u<a.length;u++)(0,a[u])(n)},function(u){for(s.status="rejected",s.reason=u,u=0;u<a.length;u++)(0,a[u])(void 0)}),s}var gp=z.S;z.S=function(t,n){$m=E(),typeof n=="object"&&n!==null&&typeof n.then=="function"&&$0(t,n),gp!==null&&gp(t,n)};var tr=U(null);function mc(){var t=tr.current;return t!==null?t:Ve.pooledCache}function nl(t,n){n===null?St(tr,tr.current):St(tr,n.pool)}function _p(){var t=mc();return t===null?null:{parent:an._currentValue,pool:t}}var Br=Error(r(460)),gc=Error(r(474)),il=Error(r(542)),al={then:function(){}};function vp(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Sp(t,n,a){switch(a=t[a],a===void 0?t.push(n):a!==n&&(n.then(zi,zi),n=a),n.status){case"fulfilled":return n.value;case"rejected":throw t=n.reason,yp(t),t;default:if(typeof n.status=="string")n.then(zi,zi);else{if(t=Ve,t!==null&&100<t.shellSuspendCounter)throw Error(r(482));t=n,t.status="pending",t.then(function(s){if(n.status==="pending"){var u=n;u.status="fulfilled",u.value=s}},function(s){if(n.status==="pending"){var u=n;u.status="rejected",u.reason=s}})}switch(n.status){case"fulfilled":return n.value;case"rejected":throw t=n.reason,yp(t),t}throw nr=n,Br}}function er(t){try{var n=t._init;return n(t._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(nr=a,Br):a}}var nr=null;function xp(){if(nr===null)throw Error(r(459));var t=nr;return nr=null,t}function yp(t){if(t===Br||t===il)throw Error(r(483))}var Ir=null,qs=0;function rl(t){var n=qs;return qs+=1,Ir===null&&(Ir=[]),Sp(Ir,t,n)}function Ys(t,n){n=n.props.ref,t.ref=n!==void 0?n:null}function sl(t,n){throw n.$$typeof===x?Error(r(525)):(t=Object.prototype.toString.call(n),Error(r(31,t==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":t)))}function Mp(t){function n(Y,G){if(t){var Q=Y.deletions;Q===null?(Y.deletions=[G],Y.flags|=16):Q.push(G)}}function a(Y,G){if(!t)return null;for(;G!==null;)n(Y,G),G=G.sibling;return null}function s(Y){for(var G=new Map;Y!==null;)Y.key!==null?G.set(Y.key,Y):G.set(Y.index,Y),Y=Y.sibling;return G}function u(Y,G){return Y=Bi(Y,G),Y.index=0,Y.sibling=null,Y}function f(Y,G,Q){return Y.index=Q,t?(Q=Y.alternate,Q!==null?(Q=Q.index,Q<G?(Y.flags|=67108866,G):Q):(Y.flags|=67108866,G)):(Y.flags|=1048576,G)}function _(Y){return t&&Y.alternate===null&&(Y.flags|=67108866),Y}function T(Y,G,Q,ht){return G===null||G.tag!==6?(G=ac(Q,Y.mode,ht),G.return=Y,G):(G=u(G,Q),G.return=Y,G)}function P(Y,G,Q,ht){var jt=Q.type;return jt===R?ut(Y,G,Q.props.children,ht,Q.key):G!==null&&(G.elementType===jt||typeof jt=="object"&&jt!==null&&jt.$$typeof===k&&er(jt)===G.type)?(G=u(G,Q.props),Ys(G,Q),G.return=Y,G):(G=Jo(Q.type,Q.key,Q.props,null,Y.mode,ht),Ys(G,Q),G.return=Y,G)}function J(Y,G,Q,ht){return G===null||G.tag!==4||G.stateNode.containerInfo!==Q.containerInfo||G.stateNode.implementation!==Q.implementation?(G=rc(Q,Y.mode,ht),G.return=Y,G):(G=u(G,Q.children||[]),G.return=Y,G)}function ut(Y,G,Q,ht,jt){return G===null||G.tag!==7?(G=Ka(Q,Y.mode,ht,jt),G.return=Y,G):(G=u(G,Q),G.return=Y,G)}function mt(Y,G,Q){if(typeof G=="string"&&G!==""||typeof G=="number"||typeof G=="bigint")return G=ac(""+G,Y.mode,Q),G.return=Y,G;if(typeof G=="object"&&G!==null){switch(G.$$typeof){case M:return Q=Jo(G.type,G.key,G.props,null,Y.mode,Q),Ys(Q,G),Q.return=Y,Q;case b:return G=rc(G,Y.mode,Q),G.return=Y,G;case k:return G=er(G),mt(Y,G,Q)}if(dt(G)||st(G))return G=Ka(G,Y.mode,Q,null),G.return=Y,G;if(typeof G.then=="function")return mt(Y,rl(G),Q);if(G.$$typeof===N)return mt(Y,el(Y,G),Q);sl(Y,G)}return null}function tt(Y,G,Q,ht){var jt=G!==null?G.key:null;if(typeof Q=="string"&&Q!==""||typeof Q=="number"||typeof Q=="bigint")return jt!==null?null:T(Y,G,""+Q,ht);if(typeof Q=="object"&&Q!==null){switch(Q.$$typeof){case M:return Q.key===jt?P(Y,G,Q,ht):null;case b:return Q.key===jt?J(Y,G,Q,ht):null;case k:return Q=er(Q),tt(Y,G,Q,ht)}if(dt(Q)||st(Q))return jt!==null?null:ut(Y,G,Q,ht,null);if(typeof Q.then=="function")return tt(Y,G,rl(Q),ht);if(Q.$$typeof===N)return tt(Y,G,el(Y,Q),ht);sl(Y,Q)}return null}function ot(Y,G,Q,ht,jt){if(typeof ht=="string"&&ht!==""||typeof ht=="number"||typeof ht=="bigint")return Y=Y.get(Q)||null,T(G,Y,""+ht,jt);if(typeof ht=="object"&&ht!==null){switch(ht.$$typeof){case M:return Y=Y.get(ht.key===null?Q:ht.key)||null,P(G,Y,ht,jt);case b:return Y=Y.get(ht.key===null?Q:ht.key)||null,J(G,Y,ht,jt);case k:return ht=er(ht),ot(Y,G,Q,ht,jt)}if(dt(ht)||st(ht))return Y=Y.get(Q)||null,ut(G,Y,ht,jt,null);if(typeof ht.then=="function")return ot(Y,G,Q,rl(ht),jt);if(ht.$$typeof===N)return ot(Y,G,Q,el(G,ht),jt);sl(G,ht)}return null}function It(Y,G,Q,ht){for(var jt=null,be=null,Gt=G,se=G=0,ge=null;Gt!==null&&se<Q.length;se++){Gt.index>se?(ge=Gt,Gt=null):ge=Gt.sibling;var Ae=tt(Y,Gt,Q[se],ht);if(Ae===null){Gt===null&&(Gt=ge);break}t&&Gt&&Ae.alternate===null&&n(Y,Gt),G=f(Ae,G,se),be===null?jt=Ae:be.sibling=Ae,be=Ae,Gt=ge}if(se===Q.length)return a(Y,Gt),Se&&Ii(Y,se),jt;if(Gt===null){for(;se<Q.length;se++)Gt=mt(Y,Q[se],ht),Gt!==null&&(G=f(Gt,G,se),be===null?jt=Gt:be.sibling=Gt,be=Gt);return Se&&Ii(Y,se),jt}for(Gt=s(Gt);se<Q.length;se++)ge=ot(Gt,Y,se,Q[se],ht),ge!==null&&(t&&ge.alternate!==null&&Gt.delete(ge.key===null?se:ge.key),G=f(ge,G,se),be===null?jt=ge:be.sibling=ge,be=ge);return t&&Gt.forEach(function(Ua){return n(Y,Ua)}),Se&&Ii(Y,se),jt}function Jt(Y,G,Q,ht){if(Q==null)throw Error(r(151));for(var jt=null,be=null,Gt=G,se=G=0,ge=null,Ae=Q.next();Gt!==null&&!Ae.done;se++,Ae=Q.next()){Gt.index>se?(ge=Gt,Gt=null):ge=Gt.sibling;var Ua=tt(Y,Gt,Ae.value,ht);if(Ua===null){Gt===null&&(Gt=ge);break}t&&Gt&&Ua.alternate===null&&n(Y,Gt),G=f(Ua,G,se),be===null?jt=Ua:be.sibling=Ua,be=Ua,Gt=ge}if(Ae.done)return a(Y,Gt),Se&&Ii(Y,se),jt;if(Gt===null){for(;!Ae.done;se++,Ae=Q.next())Ae=mt(Y,Ae.value,ht),Ae!==null&&(G=f(Ae,G,se),be===null?jt=Ae:be.sibling=Ae,be=Ae);return Se&&Ii(Y,se),jt}for(Gt=s(Gt);!Ae.done;se++,Ae=Q.next())Ae=ot(Gt,Y,se,Ae.value,ht),Ae!==null&&(t&&Ae.alternate!==null&&Gt.delete(Ae.key===null?se:Ae.key),G=f(Ae,G,se),be===null?jt=Ae:be.sibling=Ae,be=Ae);return t&&Gt.forEach(function(fx){return n(Y,fx)}),Se&&Ii(Y,se),jt}function Ie(Y,G,Q,ht){if(typeof Q=="object"&&Q!==null&&Q.type===R&&Q.key===null&&(Q=Q.props.children),typeof Q=="object"&&Q!==null){switch(Q.$$typeof){case M:t:{for(var jt=Q.key;G!==null;){if(G.key===jt){if(jt=Q.type,jt===R){if(G.tag===7){a(Y,G.sibling),ht=u(G,Q.props.children),ht.return=Y,Y=ht;break t}}else if(G.elementType===jt||typeof jt=="object"&&jt!==null&&jt.$$typeof===k&&er(jt)===G.type){a(Y,G.sibling),ht=u(G,Q.props),Ys(ht,Q),ht.return=Y,Y=ht;break t}a(Y,G);break}else n(Y,G);G=G.sibling}Q.type===R?(ht=Ka(Q.props.children,Y.mode,ht,Q.key),ht.return=Y,Y=ht):(ht=Jo(Q.type,Q.key,Q.props,null,Y.mode,ht),Ys(ht,Q),ht.return=Y,Y=ht)}return _(Y);case b:t:{for(jt=Q.key;G!==null;){if(G.key===jt)if(G.tag===4&&G.stateNode.containerInfo===Q.containerInfo&&G.stateNode.implementation===Q.implementation){a(Y,G.sibling),ht=u(G,Q.children||[]),ht.return=Y,Y=ht;break t}else{a(Y,G);break}else n(Y,G);G=G.sibling}ht=rc(Q,Y.mode,ht),ht.return=Y,Y=ht}return _(Y);case k:return Q=er(Q),Ie(Y,G,Q,ht)}if(dt(Q))return It(Y,G,Q,ht);if(st(Q)){if(jt=st(Q),typeof jt!="function")throw Error(r(150));return Q=jt.call(Q),Jt(Y,G,Q,ht)}if(typeof Q.then=="function")return Ie(Y,G,rl(Q),ht);if(Q.$$typeof===N)return Ie(Y,G,el(Y,Q),ht);sl(Y,Q)}return typeof Q=="string"&&Q!==""||typeof Q=="number"||typeof Q=="bigint"?(Q=""+Q,G!==null&&G.tag===6?(a(Y,G.sibling),ht=u(G,Q),ht.return=Y,Y=ht):(a(Y,G),ht=ac(Q,Y.mode,ht),ht.return=Y,Y=ht),_(Y)):a(Y,G)}return function(Y,G,Q,ht){try{qs=0;var jt=Ie(Y,G,Q,ht);return Ir=null,jt}catch(Gt){if(Gt===Br||Gt===il)throw Gt;var be=Wn(29,Gt,null,Y.mode);return be.lanes=ht,be.return=Y,be}}}var ir=Mp(!0),Ep=Mp(!1),pa=!1;function _c(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function vc(t,n){t=t.updateQueue,n.updateQueue===t&&(n.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function ma(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function ga(t,n,a){var s=t.updateQueue;if(s===null)return null;if(s=s.shared,(we&2)!==0){var u=s.pending;return u===null?n.next=n:(n.next=u.next,u.next=n),s.pending=n,n=Qo(t),sp(t,null,a),n}return Ko(t,s,n,a),Qo(t)}function js(t,n,a){if(n=n.updateQueue,n!==null&&(n=n.shared,(a&4194048)!==0)){var s=n.lanes;s&=t.pendingLanes,a|=s,n.lanes=a,ws(t,a)}}function Sc(t,n){var a=t.updateQueue,s=t.alternate;if(s!==null&&(s=s.updateQueue,a===s)){var u=null,f=null;if(a=a.firstBaseUpdate,a!==null){do{var _={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};f===null?u=f=_:f=f.next=_,a=a.next}while(a!==null);f===null?u=f=n:f=f.next=n}else u=f=n;a={baseState:s.baseState,firstBaseUpdate:u,lastBaseUpdate:f,shared:s.shared,callbacks:s.callbacks},t.updateQueue=a;return}t=a.lastBaseUpdate,t===null?a.firstBaseUpdate=n:t.next=n,a.lastBaseUpdate=n}var xc=!1;function Zs(){if(xc){var t=Pr;if(t!==null)throw t}}function Ks(t,n,a,s){xc=!1;var u=t.updateQueue;pa=!1;var f=u.firstBaseUpdate,_=u.lastBaseUpdate,T=u.shared.pending;if(T!==null){u.shared.pending=null;var P=T,J=P.next;P.next=null,_===null?f=J:_.next=J,_=P;var ut=t.alternate;ut!==null&&(ut=ut.updateQueue,T=ut.lastBaseUpdate,T!==_&&(T===null?ut.firstBaseUpdate=J:T.next=J,ut.lastBaseUpdate=P))}if(f!==null){var mt=u.baseState;_=0,ut=J=P=null,T=f;do{var tt=T.lane&-536870913,ot=tt!==T.lane;if(ot?(me&tt)===tt:(s&tt)===tt){tt!==0&&tt===zr&&(xc=!0),ut!==null&&(ut=ut.next={lane:0,tag:T.tag,payload:T.payload,callback:null,next:null});t:{var It=t,Jt=T;tt=n;var Ie=a;switch(Jt.tag){case 1:if(It=Jt.payload,typeof It=="function"){mt=It.call(Ie,mt,tt);break t}mt=It;break t;case 3:It.flags=It.flags&-65537|128;case 0:if(It=Jt.payload,tt=typeof It=="function"?It.call(Ie,mt,tt):It,tt==null)break t;mt=S({},mt,tt);break t;case 2:pa=!0}}tt=T.callback,tt!==null&&(t.flags|=64,ot&&(t.flags|=8192),ot=u.callbacks,ot===null?u.callbacks=[tt]:ot.push(tt))}else ot={lane:tt,tag:T.tag,payload:T.payload,callback:T.callback,next:null},ut===null?(J=ut=ot,P=mt):ut=ut.next=ot,_|=tt;if(T=T.next,T===null){if(T=u.shared.pending,T===null)break;ot=T,T=ot.next,ot.next=null,u.lastBaseUpdate=ot,u.shared.pending=null}}while(!0);ut===null&&(P=mt),u.baseState=P,u.firstBaseUpdate=J,u.lastBaseUpdate=ut,f===null&&(u.shared.lanes=0),ya|=_,t.lanes=_,t.memoizedState=mt}}function Tp(t,n){if(typeof t!="function")throw Error(r(191,t));t.call(n)}function bp(t,n){var a=t.callbacks;if(a!==null)for(t.callbacks=null,t=0;t<a.length;t++)Tp(a[t],n)}var Fr=U(null),ol=U(0);function Ap(t,n){t=Zi,St(ol,t),St(Fr,n),Zi=t|n.baseLanes}function yc(){St(ol,Zi),St(Fr,Fr.current)}function Mc(){Zi=ol.current,nt(Fr),nt(ol)}var qn=U(null),ri=null;function _a(t){var n=t.alternate;St(en,en.current&1),St(qn,t),ri===null&&(n===null||Fr.current!==null||n.memoizedState!==null)&&(ri=t)}function Ec(t){St(en,en.current),St(qn,t),ri===null&&(ri=t)}function Rp(t){t.tag===22?(St(en,en.current),St(qn,t),ri===null&&(ri=t)):va()}function va(){St(en,en.current),St(qn,qn.current)}function Yn(t){nt(qn),ri===t&&(ri=null),nt(en)}var en=U(0);function ll(t){for(var n=t;n!==null;){if(n.tag===13){var a=n.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Df(a)||Uf(a)))return n}else if(n.tag===19&&(n.memoizedProps.revealOrder==="forwards"||n.memoizedProps.revealOrder==="backwards"||n.memoizedProps.revealOrder==="unstable_legacy-backwards"||n.memoizedProps.revealOrder==="together")){if((n.flags&128)!==0)return n}else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return null;n=n.return}n.sibling.return=n.return,n=n.sibling}return null}var Gi=0,re=null,Pe=null,rn=null,ul=!1,Hr=!1,ar=!1,cl=0,Qs=0,Gr=null,eS=0;function Qe(){throw Error(r(321))}function Tc(t,n){if(n===null)return!1;for(var a=0;a<n.length&&a<t.length;a++)if(!kn(t[a],n[a]))return!1;return!0}function bc(t,n,a,s,u,f){return Gi=f,re=n,n.memoizedState=null,n.updateQueue=null,n.lanes=0,z.H=t===null||t.memoizedState===null?cm:Hc,ar=!1,f=a(s,u),ar=!1,Hr&&(f=wp(n,a,s,u)),Cp(t),f}function Cp(t){z.H=to;var n=Pe!==null&&Pe.next!==null;if(Gi=0,rn=Pe=re=null,ul=!1,Qs=0,Gr=null,n)throw Error(r(300));t===null||sn||(t=t.dependencies,t!==null&&tl(t)&&(sn=!0))}function wp(t,n,a,s){re=t;var u=0;do{if(Hr&&(Gr=null),Qs=0,Hr=!1,25<=u)throw Error(r(301));if(u+=1,rn=Pe=null,t.updateQueue!=null){var f=t.updateQueue;f.lastEffect=null,f.events=null,f.stores=null,f.memoCache!=null&&(f.memoCache.index=0)}z.H=fm,f=n(a,s)}while(Hr);return f}function nS(){var t=z.H,n=t.useState()[0];return n=typeof n.then=="function"?Js(n):n,t=t.useState()[0],(Pe!==null?Pe.memoizedState:null)!==t&&(re.flags|=1024),n}function Ac(){var t=cl!==0;return cl=0,t}function Rc(t,n,a){n.updateQueue=t.updateQueue,n.flags&=-2053,t.lanes&=~a}function Cc(t){if(ul){for(t=t.memoizedState;t!==null;){var n=t.queue;n!==null&&(n.pending=null),t=t.next}ul=!1}Gi=0,rn=Pe=re=null,Hr=!1,Qs=cl=0,Gr=null}function Ln(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return rn===null?re.memoizedState=rn=t:rn=rn.next=t,rn}function nn(){if(Pe===null){var t=re.alternate;t=t!==null?t.memoizedState:null}else t=Pe.next;var n=rn===null?re.memoizedState:rn.next;if(n!==null)rn=n,Pe=t;else{if(t===null)throw re.alternate===null?Error(r(467)):Error(r(310));Pe=t,t={memoizedState:Pe.memoizedState,baseState:Pe.baseState,baseQueue:Pe.baseQueue,queue:Pe.queue,next:null},rn===null?re.memoizedState=rn=t:rn=rn.next=t}return rn}function fl(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Js(t){var n=Qs;return Qs+=1,Gr===null&&(Gr=[]),t=Sp(Gr,t,n),n=re,(rn===null?n.memoizedState:rn.next)===null&&(n=n.alternate,z.H=n===null||n.memoizedState===null?cm:Hc),t}function hl(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Js(t);if(t.$$typeof===N)return xn(t)}throw Error(r(438,String(t)))}function wc(t){var n=null,a=re.updateQueue;if(a!==null&&(n=a.memoCache),n==null){var s=re.alternate;s!==null&&(s=s.updateQueue,s!==null&&(s=s.memoCache,s!=null&&(n={data:s.data.map(function(u){return u.slice()}),index:0})))}if(n==null&&(n={data:[],index:0}),a===null&&(a=fl(),re.updateQueue=a),a.memoCache=n,a=n.data[n.index],a===void 0)for(a=n.data[n.index]=Array(t),s=0;s<t;s++)a[s]=C;return n.index++,a}function Vi(t,n){return typeof n=="function"?n(t):n}function dl(t){var n=nn();return Dc(n,Pe,t)}function Dc(t,n,a){var s=t.queue;if(s===null)throw Error(r(311));s.lastRenderedReducer=a;var u=t.baseQueue,f=s.pending;if(f!==null){if(u!==null){var _=u.next;u.next=f.next,f.next=_}n.baseQueue=u=f,s.pending=null}if(f=t.baseState,u===null)t.memoizedState=f;else{n=u.next;var T=_=null,P=null,J=n,ut=!1;do{var mt=J.lane&-536870913;if(mt!==J.lane?(me&mt)===mt:(Gi&mt)===mt){var tt=J.revertLane;if(tt===0)P!==null&&(P=P.next={lane:0,revertLane:0,gesture:null,action:J.action,hasEagerState:J.hasEagerState,eagerState:J.eagerState,next:null}),mt===zr&&(ut=!0);else if((Gi&tt)===tt){J=J.next,tt===zr&&(ut=!0);continue}else mt={lane:0,revertLane:J.revertLane,gesture:null,action:J.action,hasEagerState:J.hasEagerState,eagerState:J.eagerState,next:null},P===null?(T=P=mt,_=f):P=P.next=mt,re.lanes|=tt,ya|=tt;mt=J.action,ar&&a(f,mt),f=J.hasEagerState?J.eagerState:a(f,mt)}else tt={lane:mt,revertLane:J.revertLane,gesture:J.gesture,action:J.action,hasEagerState:J.hasEagerState,eagerState:J.eagerState,next:null},P===null?(T=P=tt,_=f):P=P.next=tt,re.lanes|=mt,ya|=mt;J=J.next}while(J!==null&&J!==n);if(P===null?_=f:P.next=T,!kn(f,t.memoizedState)&&(sn=!0,ut&&(a=Pr,a!==null)))throw a;t.memoizedState=f,t.baseState=_,t.baseQueue=P,s.lastRenderedState=f}return u===null&&(s.lanes=0),[t.memoizedState,s.dispatch]}function Uc(t){var n=nn(),a=n.queue;if(a===null)throw Error(r(311));a.lastRenderedReducer=t;var s=a.dispatch,u=a.pending,f=n.memoizedState;if(u!==null){a.pending=null;var _=u=u.next;do f=t(f,_.action),_=_.next;while(_!==u);kn(f,n.memoizedState)||(sn=!0),n.memoizedState=f,n.baseQueue===null&&(n.baseState=f),a.lastRenderedState=f}return[f,s]}function Dp(t,n,a){var s=re,u=nn(),f=Se;if(f){if(a===void 0)throw Error(r(407));a=a()}else a=n();var _=!kn((Pe||u).memoizedState,a);if(_&&(u.memoizedState=a,sn=!0),u=u.queue,Oc(Np.bind(null,s,u,t),[t]),u.getSnapshot!==n||_||rn!==null&&rn.memoizedState.tag&1){if(s.flags|=2048,Vr(9,{destroy:void 0},Lp.bind(null,s,u,a,n),null),Ve===null)throw Error(r(349));f||(Gi&127)!==0||Up(s,n,a)}return a}function Up(t,n,a){t.flags|=16384,t={getSnapshot:n,value:a},n=re.updateQueue,n===null?(n=fl(),re.updateQueue=n,n.stores=[t]):(a=n.stores,a===null?n.stores=[t]:a.push(t))}function Lp(t,n,a,s){n.value=a,n.getSnapshot=s,Op(n)&&zp(t)}function Np(t,n,a){return a(function(){Op(n)&&zp(t)})}function Op(t){var n=t.getSnapshot;t=t.value;try{var a=n();return!kn(t,a)}catch{return!0}}function zp(t){var n=Za(t,2);n!==null&&Hn(n,t,2)}function Lc(t){var n=Ln();if(typeof t=="function"){var a=t;if(t=a(),ar){Wt(!0);try{a()}finally{Wt(!1)}}}return n.memoizedState=n.baseState=t,n.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vi,lastRenderedState:t},n}function Pp(t,n,a,s){return t.baseState=a,Dc(t,Pe,typeof s=="function"?s:Vi)}function iS(t,n,a,s,u){if(gl(t))throw Error(r(485));if(t=n.action,t!==null){var f={payload:u,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(_){f.listeners.push(_)}};z.T!==null?a(!0):f.isTransition=!1,s(f),a=n.pending,a===null?(f.next=n.pending=f,Bp(n,f)):(f.next=a.next,n.pending=a.next=f)}}function Bp(t,n){var a=n.action,s=n.payload,u=t.state;if(n.isTransition){var f=z.T,_={};z.T=_;try{var T=a(u,s),P=z.S;P!==null&&P(_,T),Ip(t,n,T)}catch(J){Nc(t,n,J)}finally{f!==null&&_.types!==null&&(f.types=_.types),z.T=f}}else try{f=a(u,s),Ip(t,n,f)}catch(J){Nc(t,n,J)}}function Ip(t,n,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(s){Fp(t,n,s)},function(s){return Nc(t,n,s)}):Fp(t,n,a)}function Fp(t,n,a){n.status="fulfilled",n.value=a,Hp(n),t.state=a,n=t.pending,n!==null&&(a=n.next,a===n?t.pending=null:(a=a.next,n.next=a,Bp(t,a)))}function Nc(t,n,a){var s=t.pending;if(t.pending=null,s!==null){s=s.next;do n.status="rejected",n.reason=a,Hp(n),n=n.next;while(n!==s)}t.action=null}function Hp(t){t=t.listeners;for(var n=0;n<t.length;n++)(0,t[n])()}function Gp(t,n){return n}function Vp(t,n){if(Se){var a=Ve.formState;if(a!==null){t:{var s=re;if(Se){if(We){e:{for(var u=We,f=ai;u.nodeType!==8;){if(!f){u=null;break e}if(u=si(u.nextSibling),u===null){u=null;break e}}f=u.data,u=f==="F!"||f==="F"?u:null}if(u){We=si(u.nextSibling),s=u.data==="F!";break t}}ha(s)}s=!1}s&&(n=a[0])}}return a=Ln(),a.memoizedState=a.baseState=n,s={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Gp,lastRenderedState:n},a.queue=s,a=om.bind(null,re,s),s.dispatch=a,s=Lc(!1),f=Fc.bind(null,re,!1,s.queue),s=Ln(),u={state:n,dispatch:null,action:t,pending:null},s.queue=u,a=iS.bind(null,re,u,f,a),u.dispatch=a,s.memoizedState=t,[n,a,!1]}function Xp(t){var n=nn();return kp(n,Pe,t)}function kp(t,n,a){if(n=Dc(t,n,Gp)[0],t=dl(Vi)[0],typeof n=="object"&&n!==null&&typeof n.then=="function")try{var s=Js(n)}catch(_){throw _===Br?il:_}else s=n;n=nn();var u=n.queue,f=u.dispatch;return a!==n.memoizedState&&(re.flags|=2048,Vr(9,{destroy:void 0},aS.bind(null,u,a),null)),[s,f,t]}function aS(t,n){t.action=n}function Wp(t){var n=nn(),a=Pe;if(a!==null)return kp(n,a,t);nn(),n=n.memoizedState,a=nn();var s=a.queue.dispatch;return a.memoizedState=t,[n,s,!1]}function Vr(t,n,a,s){return t={tag:t,create:a,deps:s,inst:n,next:null},n=re.updateQueue,n===null&&(n=fl(),re.updateQueue=n),a=n.lastEffect,a===null?n.lastEffect=t.next=t:(s=a.next,a.next=t,t.next=s,n.lastEffect=t),t}function qp(){return nn().memoizedState}function pl(t,n,a,s){var u=Ln();re.flags|=t,u.memoizedState=Vr(1|n,{destroy:void 0},a,s===void 0?null:s)}function ml(t,n,a,s){var u=nn();s=s===void 0?null:s;var f=u.memoizedState.inst;Pe!==null&&s!==null&&Tc(s,Pe.memoizedState.deps)?u.memoizedState=Vr(n,f,a,s):(re.flags|=t,u.memoizedState=Vr(1|n,f,a,s))}function Yp(t,n){pl(8390656,8,t,n)}function Oc(t,n){ml(2048,8,t,n)}function rS(t){re.flags|=4;var n=re.updateQueue;if(n===null)n=fl(),re.updateQueue=n,n.events=[t];else{var a=n.events;a===null?n.events=[t]:a.push(t)}}function jp(t){var n=nn().memoizedState;return rS({ref:n,nextImpl:t}),function(){if((we&2)!==0)throw Error(r(440));return n.impl.apply(void 0,arguments)}}function Zp(t,n){return ml(4,2,t,n)}function Kp(t,n){return ml(4,4,t,n)}function Qp(t,n){if(typeof n=="function"){t=t();var a=n(t);return function(){typeof a=="function"?a():n(null)}}if(n!=null)return t=t(),n.current=t,function(){n.current=null}}function Jp(t,n,a){a=a!=null?a.concat([t]):null,ml(4,4,Qp.bind(null,n,t),a)}function zc(){}function $p(t,n){var a=nn();n=n===void 0?null:n;var s=a.memoizedState;return n!==null&&Tc(n,s[1])?s[0]:(a.memoizedState=[t,n],t)}function tm(t,n){var a=nn();n=n===void 0?null:n;var s=a.memoizedState;if(n!==null&&Tc(n,s[1]))return s[0];if(s=t(),ar){Wt(!0);try{t()}finally{Wt(!1)}}return a.memoizedState=[s,n],s}function Pc(t,n,a){return a===void 0||(Gi&1073741824)!==0&&(me&261930)===0?t.memoizedState=n:(t.memoizedState=a,t=eg(),re.lanes|=t,ya|=t,a)}function em(t,n,a,s){return kn(a,n)?a:Fr.current!==null?(t=Pc(t,a,s),kn(t,n)||(sn=!0),t):(Gi&42)===0||(Gi&1073741824)!==0&&(me&261930)===0?(sn=!0,t.memoizedState=a):(t=eg(),re.lanes|=t,ya|=t,n)}function nm(t,n,a,s,u){var f=K.p;K.p=f!==0&&8>f?f:8;var _=z.T,T={};z.T=T,Fc(t,!1,n,a);try{var P=u(),J=z.S;if(J!==null&&J(T,P),P!==null&&typeof P=="object"&&typeof P.then=="function"){var ut=tS(P,s);$s(t,n,ut,Kn(t))}else $s(t,n,s,Kn(t))}catch(mt){$s(t,n,{then:function(){},status:"rejected",reason:mt},Kn())}finally{K.p=f,_!==null&&T.types!==null&&(_.types=T.types),z.T=_}}function sS(){}function Bc(t,n,a,s){if(t.tag!==5)throw Error(r(476));var u=im(t).queue;nm(t,u,n,Z,a===null?sS:function(){return am(t),a(s)})}function im(t){var n=t.memoizedState;if(n!==null)return n;n={memoizedState:Z,baseState:Z,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vi,lastRenderedState:Z},next:null};var a={};return n.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vi,lastRenderedState:a},next:null},t.memoizedState=n,t=t.alternate,t!==null&&(t.memoizedState=n),n}function am(t){var n=im(t);n.next===null&&(n=t.alternate.memoizedState),$s(t,n.next.queue,{},Kn())}function Ic(){return xn(_o)}function rm(){return nn().memoizedState}function sm(){return nn().memoizedState}function oS(t){for(var n=t.return;n!==null;){switch(n.tag){case 24:case 3:var a=Kn();t=ma(a);var s=ga(n,t,a);s!==null&&(Hn(s,n,a),js(s,n,a)),n={cache:dc()},t.payload=n;return}n=n.return}}function lS(t,n,a){var s=Kn();a={lane:s,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},gl(t)?lm(n,a):(a=nc(t,n,a,s),a!==null&&(Hn(a,t,s),um(a,n,s)))}function om(t,n,a){var s=Kn();$s(t,n,a,s)}function $s(t,n,a,s){var u={lane:s,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(gl(t))lm(n,u);else{var f=t.alternate;if(t.lanes===0&&(f===null||f.lanes===0)&&(f=n.lastRenderedReducer,f!==null))try{var _=n.lastRenderedState,T=f(_,a);if(u.hasEagerState=!0,u.eagerState=T,kn(T,_))return Ko(t,n,u,0),Ve===null&&Zo(),!1}catch{}if(a=nc(t,n,u,s),a!==null)return Hn(a,t,s),um(a,n,s),!0}return!1}function Fc(t,n,a,s){if(s={lane:2,revertLane:vf(),gesture:null,action:s,hasEagerState:!1,eagerState:null,next:null},gl(t)){if(n)throw Error(r(479))}else n=nc(t,a,s,2),n!==null&&Hn(n,t,2)}function gl(t){var n=t.alternate;return t===re||n!==null&&n===re}function lm(t,n){Hr=ul=!0;var a=t.pending;a===null?n.next=n:(n.next=a.next,a.next=n),t.pending=n}function um(t,n,a){if((a&4194048)!==0){var s=n.lanes;s&=t.pendingLanes,a|=s,n.lanes=a,ws(t,a)}}var to={readContext:xn,use:hl,useCallback:Qe,useContext:Qe,useEffect:Qe,useImperativeHandle:Qe,useLayoutEffect:Qe,useInsertionEffect:Qe,useMemo:Qe,useReducer:Qe,useRef:Qe,useState:Qe,useDebugValue:Qe,useDeferredValue:Qe,useTransition:Qe,useSyncExternalStore:Qe,useId:Qe,useHostTransitionStatus:Qe,useFormState:Qe,useActionState:Qe,useOptimistic:Qe,useMemoCache:Qe,useCacheRefresh:Qe};to.useEffectEvent=Qe;var cm={readContext:xn,use:hl,useCallback:function(t,n){return Ln().memoizedState=[t,n===void 0?null:n],t},useContext:xn,useEffect:Yp,useImperativeHandle:function(t,n,a){a=a!=null?a.concat([t]):null,pl(4194308,4,Qp.bind(null,n,t),a)},useLayoutEffect:function(t,n){return pl(4194308,4,t,n)},useInsertionEffect:function(t,n){pl(4,2,t,n)},useMemo:function(t,n){var a=Ln();n=n===void 0?null:n;var s=t();if(ar){Wt(!0);try{t()}finally{Wt(!1)}}return a.memoizedState=[s,n],s},useReducer:function(t,n,a){var s=Ln();if(a!==void 0){var u=a(n);if(ar){Wt(!0);try{a(n)}finally{Wt(!1)}}}else u=n;return s.memoizedState=s.baseState=u,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:u},s.queue=t,t=t.dispatch=lS.bind(null,re,t),[s.memoizedState,t]},useRef:function(t){var n=Ln();return t={current:t},n.memoizedState=t},useState:function(t){t=Lc(t);var n=t.queue,a=om.bind(null,re,n);return n.dispatch=a,[t.memoizedState,a]},useDebugValue:zc,useDeferredValue:function(t,n){var a=Ln();return Pc(a,t,n)},useTransition:function(){var t=Lc(!1);return t=nm.bind(null,re,t.queue,!0,!1),Ln().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,n,a){var s=re,u=Ln();if(Se){if(a===void 0)throw Error(r(407));a=a()}else{if(a=n(),Ve===null)throw Error(r(349));(me&127)!==0||Up(s,n,a)}u.memoizedState=a;var f={value:a,getSnapshot:n};return u.queue=f,Yp(Np.bind(null,s,f,t),[t]),s.flags|=2048,Vr(9,{destroy:void 0},Lp.bind(null,s,f,a,n),null),a},useId:function(){var t=Ln(),n=Ve.identifierPrefix;if(Se){var a=Ai,s=bi;a=(s&~(1<<32-Ft(s)-1)).toString(32)+a,n="_"+n+"R_"+a,a=cl++,0<a&&(n+="H"+a.toString(32)),n+="_"}else a=eS++,n="_"+n+"r_"+a.toString(32)+"_";return t.memoizedState=n},useHostTransitionStatus:Ic,useFormState:Vp,useActionState:Vp,useOptimistic:function(t){var n=Ln();n.memoizedState=n.baseState=t;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return n.queue=a,n=Fc.bind(null,re,!0,a),a.dispatch=n,[t,n]},useMemoCache:wc,useCacheRefresh:function(){return Ln().memoizedState=oS.bind(null,re)},useEffectEvent:function(t){var n=Ln(),a={impl:t};return n.memoizedState=a,function(){if((we&2)!==0)throw Error(r(440));return a.impl.apply(void 0,arguments)}}},Hc={readContext:xn,use:hl,useCallback:$p,useContext:xn,useEffect:Oc,useImperativeHandle:Jp,useInsertionEffect:Zp,useLayoutEffect:Kp,useMemo:tm,useReducer:dl,useRef:qp,useState:function(){return dl(Vi)},useDebugValue:zc,useDeferredValue:function(t,n){var a=nn();return em(a,Pe.memoizedState,t,n)},useTransition:function(){var t=dl(Vi)[0],n=nn().memoizedState;return[typeof t=="boolean"?t:Js(t),n]},useSyncExternalStore:Dp,useId:rm,useHostTransitionStatus:Ic,useFormState:Xp,useActionState:Xp,useOptimistic:function(t,n){var a=nn();return Pp(a,Pe,t,n)},useMemoCache:wc,useCacheRefresh:sm};Hc.useEffectEvent=jp;var fm={readContext:xn,use:hl,useCallback:$p,useContext:xn,useEffect:Oc,useImperativeHandle:Jp,useInsertionEffect:Zp,useLayoutEffect:Kp,useMemo:tm,useReducer:Uc,useRef:qp,useState:function(){return Uc(Vi)},useDebugValue:zc,useDeferredValue:function(t,n){var a=nn();return Pe===null?Pc(a,t,n):em(a,Pe.memoizedState,t,n)},useTransition:function(){var t=Uc(Vi)[0],n=nn().memoizedState;return[typeof t=="boolean"?t:Js(t),n]},useSyncExternalStore:Dp,useId:rm,useHostTransitionStatus:Ic,useFormState:Wp,useActionState:Wp,useOptimistic:function(t,n){var a=nn();return Pe!==null?Pp(a,Pe,t,n):(a.baseState=t,[t,a.queue.dispatch])},useMemoCache:wc,useCacheRefresh:sm};fm.useEffectEvent=jp;function Gc(t,n,a,s){n=t.memoizedState,a=a(s,n),a=a==null?n:S({},n,a),t.memoizedState=a,t.lanes===0&&(t.updateQueue.baseState=a)}var Vc={enqueueSetState:function(t,n,a){t=t._reactInternals;var s=Kn(),u=ma(s);u.payload=n,a!=null&&(u.callback=a),n=ga(t,u,s),n!==null&&(Hn(n,t,s),js(n,t,s))},enqueueReplaceState:function(t,n,a){t=t._reactInternals;var s=Kn(),u=ma(s);u.tag=1,u.payload=n,a!=null&&(u.callback=a),n=ga(t,u,s),n!==null&&(Hn(n,t,s),js(n,t,s))},enqueueForceUpdate:function(t,n){t=t._reactInternals;var a=Kn(),s=ma(a);s.tag=2,n!=null&&(s.callback=n),n=ga(t,s,a),n!==null&&(Hn(n,t,a),js(n,t,a))}};function hm(t,n,a,s,u,f,_){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(s,f,_):n.prototype&&n.prototype.isPureReactComponent?!Hs(a,s)||!Hs(u,f):!0}function dm(t,n,a,s){t=n.state,typeof n.componentWillReceiveProps=="function"&&n.componentWillReceiveProps(a,s),typeof n.UNSAFE_componentWillReceiveProps=="function"&&n.UNSAFE_componentWillReceiveProps(a,s),n.state!==t&&Vc.enqueueReplaceState(n,n.state,null)}function rr(t,n){var a=n;if("ref"in n){a={};for(var s in n)s!=="ref"&&(a[s]=n[s])}if(t=t.defaultProps){a===n&&(a=S({},a));for(var u in t)a[u]===void 0&&(a[u]=t[u])}return a}function pm(t){jo(t)}function mm(t){console.error(t)}function gm(t){jo(t)}function _l(t,n){try{var a=t.onUncaughtError;a(n.value,{componentStack:n.stack})}catch(s){setTimeout(function(){throw s})}}function _m(t,n,a){try{var s=t.onCaughtError;s(a.value,{componentStack:a.stack,errorBoundary:n.tag===1?n.stateNode:null})}catch(u){setTimeout(function(){throw u})}}function Xc(t,n,a){return a=ma(a),a.tag=3,a.payload={element:null},a.callback=function(){_l(t,n)},a}function vm(t){return t=ma(t),t.tag=3,t}function Sm(t,n,a,s){var u=a.type.getDerivedStateFromError;if(typeof u=="function"){var f=s.value;t.payload=function(){return u(f)},t.callback=function(){_m(n,a,s)}}var _=a.stateNode;_!==null&&typeof _.componentDidCatch=="function"&&(t.callback=function(){_m(n,a,s),typeof u!="function"&&(Ma===null?Ma=new Set([this]):Ma.add(this));var T=s.stack;this.componentDidCatch(s.value,{componentStack:T!==null?T:""})})}function uS(t,n,a,s,u){if(a.flags|=32768,s!==null&&typeof s=="object"&&typeof s.then=="function"){if(n=a.alternate,n!==null&&Or(n,a,u,!0),a=qn.current,a!==null){switch(a.tag){case 31:case 13:return ri===null?wl():a.alternate===null&&Je===0&&(Je=3),a.flags&=-257,a.flags|=65536,a.lanes=u,s===al?a.flags|=16384:(n=a.updateQueue,n===null?a.updateQueue=new Set([s]):n.add(s),mf(t,s,u)),!1;case 22:return a.flags|=65536,s===al?a.flags|=16384:(n=a.updateQueue,n===null?(n={transitions:null,markerInstances:null,retryQueue:new Set([s])},a.updateQueue=n):(a=n.retryQueue,a===null?n.retryQueue=new Set([s]):a.add(s)),mf(t,s,u)),!1}throw Error(r(435,a.tag))}return mf(t,s,u),wl(),!1}if(Se)return n=qn.current,n!==null?((n.flags&65536)===0&&(n.flags|=256),n.flags|=65536,n.lanes=u,s!==lc&&(t=Error(r(422),{cause:s}),Xs(ei(t,a)))):(s!==lc&&(n=Error(r(423),{cause:s}),Xs(ei(n,a))),t=t.current.alternate,t.flags|=65536,u&=-u,t.lanes|=u,s=ei(s,a),u=Xc(t.stateNode,s,u),Sc(t,u),Je!==4&&(Je=2)),!1;var f=Error(r(520),{cause:s});if(f=ei(f,a),lo===null?lo=[f]:lo.push(f),Je!==4&&(Je=2),n===null)return!0;s=ei(s,a),a=n;do{switch(a.tag){case 3:return a.flags|=65536,t=u&-u,a.lanes|=t,t=Xc(a.stateNode,s,t),Sc(a,t),!1;case 1:if(n=a.type,f=a.stateNode,(a.flags&128)===0&&(typeof n.getDerivedStateFromError=="function"||f!==null&&typeof f.componentDidCatch=="function"&&(Ma===null||!Ma.has(f))))return a.flags|=65536,u&=-u,a.lanes|=u,u=vm(u),Sm(u,t,a,s),Sc(a,u),!1}a=a.return}while(a!==null);return!1}var kc=Error(r(461)),sn=!1;function yn(t,n,a,s){n.child=t===null?Ep(n,null,a,s):ir(n,t.child,a,s)}function xm(t,n,a,s,u){a=a.render;var f=n.ref;if("ref"in s){var _={};for(var T in s)T!=="ref"&&(_[T]=s[T])}else _=s;return $a(n),s=bc(t,n,a,_,f,u),T=Ac(),t!==null&&!sn?(Rc(t,n,u),Xi(t,n,u)):(Se&&T&&sc(n),n.flags|=1,yn(t,n,s,u),n.child)}function ym(t,n,a,s,u){if(t===null){var f=a.type;return typeof f=="function"&&!ic(f)&&f.defaultProps===void 0&&a.compare===null?(n.tag=15,n.type=f,Mm(t,n,f,s,u)):(t=Jo(a.type,null,s,n,n.mode,u),t.ref=n.ref,t.return=n,n.child=t)}if(f=t.child,!Jc(t,u)){var _=f.memoizedProps;if(a=a.compare,a=a!==null?a:Hs,a(_,s)&&t.ref===n.ref)return Xi(t,n,u)}return n.flags|=1,t=Bi(f,s),t.ref=n.ref,t.return=n,n.child=t}function Mm(t,n,a,s,u){if(t!==null){var f=t.memoizedProps;if(Hs(f,s)&&t.ref===n.ref)if(sn=!1,n.pendingProps=s=f,Jc(t,u))(t.flags&131072)!==0&&(sn=!0);else return n.lanes=t.lanes,Xi(t,n,u)}return Wc(t,n,a,s,u)}function Em(t,n,a,s){var u=s.children,f=t!==null?t.memoizedState:null;if(t===null&&n.stateNode===null&&(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),s.mode==="hidden"){if((n.flags&128)!==0){if(f=f!==null?f.baseLanes|a:a,t!==null){for(s=n.child=t.child,u=0;s!==null;)u=u|s.lanes|s.childLanes,s=s.sibling;s=u&~f}else s=0,n.child=null;return Tm(t,n,f,a,s)}if((a&536870912)!==0)n.memoizedState={baseLanes:0,cachePool:null},t!==null&&nl(n,f!==null?f.cachePool:null),f!==null?Ap(n,f):yc(),Rp(n);else return s=n.lanes=536870912,Tm(t,n,f!==null?f.baseLanes|a:a,a,s)}else f!==null?(nl(n,f.cachePool),Ap(n,f),va(),n.memoizedState=null):(t!==null&&nl(n,null),yc(),va());return yn(t,n,u,a),n.child}function eo(t,n){return t!==null&&t.tag===22||n.stateNode!==null||(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.sibling}function Tm(t,n,a,s,u){var f=mc();return f=f===null?null:{parent:an._currentValue,pool:f},n.memoizedState={baseLanes:a,cachePool:f},t!==null&&nl(n,null),yc(),Rp(n),t!==null&&Or(t,n,s,!0),n.childLanes=u,null}function vl(t,n){return n=xl({mode:n.mode,children:n.children},t.mode),n.ref=t.ref,t.child=n,n.return=t,n}function bm(t,n,a){return ir(n,t.child,null,a),t=vl(n,n.pendingProps),t.flags|=2,Yn(n),n.memoizedState=null,t}function cS(t,n,a){var s=n.pendingProps,u=(n.flags&128)!==0;if(n.flags&=-129,t===null){if(Se){if(s.mode==="hidden")return t=vl(n,s),n.lanes=536870912,eo(null,t);if(Ec(n),(t=We)?(t=Bg(t,ai),t=t!==null&&t.data==="&"?t:null,t!==null&&(n.memoizedState={dehydrated:t,treeContext:ca!==null?{id:bi,overflow:Ai}:null,retryLane:536870912,hydrationErrors:null},a=lp(t),a.return=n,n.child=a,Sn=n,We=null)):t=null,t===null)throw ha(n);return n.lanes=536870912,null}return vl(n,s)}var f=t.memoizedState;if(f!==null){var _=f.dehydrated;if(Ec(n),u)if(n.flags&256)n.flags&=-257,n=bm(t,n,a);else if(n.memoizedState!==null)n.child=t.child,n.flags|=128,n=null;else throw Error(r(558));else if(sn||Or(t,n,a,!1),u=(a&t.childLanes)!==0,sn||u){if(s=Ve,s!==null&&(_=Ti(s,a),_!==0&&_!==f.retryLane))throw f.retryLane=_,Za(t,_),Hn(s,t,_),kc;wl(),n=bm(t,n,a)}else t=f.treeContext,We=si(_.nextSibling),Sn=n,Se=!0,fa=null,ai=!1,t!==null&&fp(n,t),n=vl(n,s),n.flags|=4096;return n}return t=Bi(t.child,{mode:s.mode,children:s.children}),t.ref=n.ref,n.child=t,t.return=n,t}function Sl(t,n){var a=n.ref;if(a===null)t!==null&&t.ref!==null&&(n.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(r(284));(t===null||t.ref!==a)&&(n.flags|=4194816)}}function Wc(t,n,a,s,u){return $a(n),a=bc(t,n,a,s,void 0,u),s=Ac(),t!==null&&!sn?(Rc(t,n,u),Xi(t,n,u)):(Se&&s&&sc(n),n.flags|=1,yn(t,n,a,u),n.child)}function Am(t,n,a,s,u,f){return $a(n),n.updateQueue=null,a=wp(n,s,a,u),Cp(t),s=Ac(),t!==null&&!sn?(Rc(t,n,f),Xi(t,n,f)):(Se&&s&&sc(n),n.flags|=1,yn(t,n,a,f),n.child)}function Rm(t,n,a,s,u){if($a(n),n.stateNode===null){var f=Dr,_=a.contextType;typeof _=="object"&&_!==null&&(f=xn(_)),f=new a(s,f),n.memoizedState=f.state!==null&&f.state!==void 0?f.state:null,f.updater=Vc,n.stateNode=f,f._reactInternals=n,f=n.stateNode,f.props=s,f.state=n.memoizedState,f.refs={},_c(n),_=a.contextType,f.context=typeof _=="object"&&_!==null?xn(_):Dr,f.state=n.memoizedState,_=a.getDerivedStateFromProps,typeof _=="function"&&(Gc(n,a,_,s),f.state=n.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof f.getSnapshotBeforeUpdate=="function"||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(_=f.state,typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount(),_!==f.state&&Vc.enqueueReplaceState(f,f.state,null),Ks(n,s,f,u),Zs(),f.state=n.memoizedState),typeof f.componentDidMount=="function"&&(n.flags|=4194308),s=!0}else if(t===null){f=n.stateNode;var T=n.memoizedProps,P=rr(a,T);f.props=P;var J=f.context,ut=a.contextType;_=Dr,typeof ut=="object"&&ut!==null&&(_=xn(ut));var mt=a.getDerivedStateFromProps;ut=typeof mt=="function"||typeof f.getSnapshotBeforeUpdate=="function",T=n.pendingProps!==T,ut||typeof f.UNSAFE_componentWillReceiveProps!="function"&&typeof f.componentWillReceiveProps!="function"||(T||J!==_)&&dm(n,f,s,_),pa=!1;var tt=n.memoizedState;f.state=tt,Ks(n,s,f,u),Zs(),J=n.memoizedState,T||tt!==J||pa?(typeof mt=="function"&&(Gc(n,a,mt,s),J=n.memoizedState),(P=pa||hm(n,a,P,s,tt,J,_))?(ut||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount()),typeof f.componentDidMount=="function"&&(n.flags|=4194308)):(typeof f.componentDidMount=="function"&&(n.flags|=4194308),n.memoizedProps=s,n.memoizedState=J),f.props=s,f.state=J,f.context=_,s=P):(typeof f.componentDidMount=="function"&&(n.flags|=4194308),s=!1)}else{f=n.stateNode,vc(t,n),_=n.memoizedProps,ut=rr(a,_),f.props=ut,mt=n.pendingProps,tt=f.context,J=a.contextType,P=Dr,typeof J=="object"&&J!==null&&(P=xn(J)),T=a.getDerivedStateFromProps,(J=typeof T=="function"||typeof f.getSnapshotBeforeUpdate=="function")||typeof f.UNSAFE_componentWillReceiveProps!="function"&&typeof f.componentWillReceiveProps!="function"||(_!==mt||tt!==P)&&dm(n,f,s,P),pa=!1,tt=n.memoizedState,f.state=tt,Ks(n,s,f,u),Zs();var ot=n.memoizedState;_!==mt||tt!==ot||pa||t!==null&&t.dependencies!==null&&tl(t.dependencies)?(typeof T=="function"&&(Gc(n,a,T,s),ot=n.memoizedState),(ut=pa||hm(n,a,ut,s,tt,ot,P)||t!==null&&t.dependencies!==null&&tl(t.dependencies))?(J||typeof f.UNSAFE_componentWillUpdate!="function"&&typeof f.componentWillUpdate!="function"||(typeof f.componentWillUpdate=="function"&&f.componentWillUpdate(s,ot,P),typeof f.UNSAFE_componentWillUpdate=="function"&&f.UNSAFE_componentWillUpdate(s,ot,P)),typeof f.componentDidUpdate=="function"&&(n.flags|=4),typeof f.getSnapshotBeforeUpdate=="function"&&(n.flags|=1024)):(typeof f.componentDidUpdate!="function"||_===t.memoizedProps&&tt===t.memoizedState||(n.flags|=4),typeof f.getSnapshotBeforeUpdate!="function"||_===t.memoizedProps&&tt===t.memoizedState||(n.flags|=1024),n.memoizedProps=s,n.memoizedState=ot),f.props=s,f.state=ot,f.context=P,s=ut):(typeof f.componentDidUpdate!="function"||_===t.memoizedProps&&tt===t.memoizedState||(n.flags|=4),typeof f.getSnapshotBeforeUpdate!="function"||_===t.memoizedProps&&tt===t.memoizedState||(n.flags|=1024),s=!1)}return f=s,Sl(t,n),s=(n.flags&128)!==0,f||s?(f=n.stateNode,a=s&&typeof a.getDerivedStateFromError!="function"?null:f.render(),n.flags|=1,t!==null&&s?(n.child=ir(n,t.child,null,u),n.child=ir(n,null,a,u)):yn(t,n,a,u),n.memoizedState=f.state,t=n.child):t=Xi(t,n,u),t}function Cm(t,n,a,s){return Qa(),n.flags|=256,yn(t,n,a,s),n.child}var qc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Yc(t){return{baseLanes:t,cachePool:_p()}}function jc(t,n,a){return t=t!==null?t.childLanes&~a:0,n&&(t|=Zn),t}function wm(t,n,a){var s=n.pendingProps,u=!1,f=(n.flags&128)!==0,_;if((_=f)||(_=t!==null&&t.memoizedState===null?!1:(en.current&2)!==0),_&&(u=!0,n.flags&=-129),_=(n.flags&32)!==0,n.flags&=-33,t===null){if(Se){if(u?_a(n):va(),(t=We)?(t=Bg(t,ai),t=t!==null&&t.data!=="&"?t:null,t!==null&&(n.memoizedState={dehydrated:t,treeContext:ca!==null?{id:bi,overflow:Ai}:null,retryLane:536870912,hydrationErrors:null},a=lp(t),a.return=n,n.child=a,Sn=n,We=null)):t=null,t===null)throw ha(n);return Uf(t)?n.lanes=32:n.lanes=536870912,null}var T=s.children;return s=s.fallback,u?(va(),u=n.mode,T=xl({mode:"hidden",children:T},u),s=Ka(s,u,a,null),T.return=n,s.return=n,T.sibling=s,n.child=T,s=n.child,s.memoizedState=Yc(a),s.childLanes=jc(t,_,a),n.memoizedState=qc,eo(null,s)):(_a(n),Zc(n,T))}var P=t.memoizedState;if(P!==null&&(T=P.dehydrated,T!==null)){if(f)n.flags&256?(_a(n),n.flags&=-257,n=Kc(t,n,a)):n.memoizedState!==null?(va(),n.child=t.child,n.flags|=128,n=null):(va(),T=s.fallback,u=n.mode,s=xl({mode:"visible",children:s.children},u),T=Ka(T,u,a,null),T.flags|=2,s.return=n,T.return=n,s.sibling=T,n.child=s,ir(n,t.child,null,a),s=n.child,s.memoizedState=Yc(a),s.childLanes=jc(t,_,a),n.memoizedState=qc,n=eo(null,s));else if(_a(n),Uf(T)){if(_=T.nextSibling&&T.nextSibling.dataset,_)var J=_.dgst;_=J,s=Error(r(419)),s.stack="",s.digest=_,Xs({value:s,source:null,stack:null}),n=Kc(t,n,a)}else if(sn||Or(t,n,a,!1),_=(a&t.childLanes)!==0,sn||_){if(_=Ve,_!==null&&(s=Ti(_,a),s!==0&&s!==P.retryLane))throw P.retryLane=s,Za(t,s),Hn(_,t,s),kc;Df(T)||wl(),n=Kc(t,n,a)}else Df(T)?(n.flags|=192,n.child=t.child,n=null):(t=P.treeContext,We=si(T.nextSibling),Sn=n,Se=!0,fa=null,ai=!1,t!==null&&fp(n,t),n=Zc(n,s.children),n.flags|=4096);return n}return u?(va(),T=s.fallback,u=n.mode,P=t.child,J=P.sibling,s=Bi(P,{mode:"hidden",children:s.children}),s.subtreeFlags=P.subtreeFlags&65011712,J!==null?T=Bi(J,T):(T=Ka(T,u,a,null),T.flags|=2),T.return=n,s.return=n,s.sibling=T,n.child=s,eo(null,s),s=n.child,T=t.child.memoizedState,T===null?T=Yc(a):(u=T.cachePool,u!==null?(P=an._currentValue,u=u.parent!==P?{parent:P,pool:P}:u):u=_p(),T={baseLanes:T.baseLanes|a,cachePool:u}),s.memoizedState=T,s.childLanes=jc(t,_,a),n.memoizedState=qc,eo(t.child,s)):(_a(n),a=t.child,t=a.sibling,a=Bi(a,{mode:"visible",children:s.children}),a.return=n,a.sibling=null,t!==null&&(_=n.deletions,_===null?(n.deletions=[t],n.flags|=16):_.push(t)),n.child=a,n.memoizedState=null,a)}function Zc(t,n){return n=xl({mode:"visible",children:n},t.mode),n.return=t,t.child=n}function xl(t,n){return t=Wn(22,t,null,n),t.lanes=0,t}function Kc(t,n,a){return ir(n,t.child,null,a),t=Zc(n,n.pendingProps.children),t.flags|=2,n.memoizedState=null,t}function Dm(t,n,a){t.lanes|=n;var s=t.alternate;s!==null&&(s.lanes|=n),fc(t.return,n,a)}function Qc(t,n,a,s,u,f){var _=t.memoizedState;_===null?t.memoizedState={isBackwards:n,rendering:null,renderingStartTime:0,last:s,tail:a,tailMode:u,treeForkCount:f}:(_.isBackwards=n,_.rendering=null,_.renderingStartTime=0,_.last=s,_.tail=a,_.tailMode=u,_.treeForkCount=f)}function Um(t,n,a){var s=n.pendingProps,u=s.revealOrder,f=s.tail;s=s.children;var _=en.current,T=(_&2)!==0;if(T?(_=_&1|2,n.flags|=128):_&=1,St(en,_),yn(t,n,s,a),s=Se?Vs:0,!T&&t!==null&&(t.flags&128)!==0)t:for(t=n.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Dm(t,a,n);else if(t.tag===19)Dm(t,a,n);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===n)break t;for(;t.sibling===null;){if(t.return===null||t.return===n)break t;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(u){case"forwards":for(a=n.child,u=null;a!==null;)t=a.alternate,t!==null&&ll(t)===null&&(u=a),a=a.sibling;a=u,a===null?(u=n.child,n.child=null):(u=a.sibling,a.sibling=null),Qc(n,!1,u,a,f,s);break;case"backwards":case"unstable_legacy-backwards":for(a=null,u=n.child,n.child=null;u!==null;){if(t=u.alternate,t!==null&&ll(t)===null){n.child=u;break}t=u.sibling,u.sibling=a,a=u,u=t}Qc(n,!0,a,null,f,s);break;case"together":Qc(n,!1,null,null,void 0,s);break;default:n.memoizedState=null}return n.child}function Xi(t,n,a){if(t!==null&&(n.dependencies=t.dependencies),ya|=n.lanes,(a&n.childLanes)===0)if(t!==null){if(Or(t,n,a,!1),(a&n.childLanes)===0)return null}else return null;if(t!==null&&n.child!==t.child)throw Error(r(153));if(n.child!==null){for(t=n.child,a=Bi(t,t.pendingProps),n.child=a,a.return=n;t.sibling!==null;)t=t.sibling,a=a.sibling=Bi(t,t.pendingProps),a.return=n;a.sibling=null}return n.child}function Jc(t,n){return(t.lanes&n)!==0?!0:(t=t.dependencies,!!(t!==null&&tl(t)))}function fS(t,n,a){switch(n.tag){case 3:Ot(n,n.stateNode.containerInfo),da(n,an,t.memoizedState.cache),Qa();break;case 27:case 5:Qt(n);break;case 4:Ot(n,n.stateNode.containerInfo);break;case 10:da(n,n.type,n.memoizedProps.value);break;case 31:if(n.memoizedState!==null)return n.flags|=128,Ec(n),null;break;case 13:var s=n.memoizedState;if(s!==null)return s.dehydrated!==null?(_a(n),n.flags|=128,null):(a&n.child.childLanes)!==0?wm(t,n,a):(_a(n),t=Xi(t,n,a),t!==null?t.sibling:null);_a(n);break;case 19:var u=(t.flags&128)!==0;if(s=(a&n.childLanes)!==0,s||(Or(t,n,a,!1),s=(a&n.childLanes)!==0),u){if(s)return Um(t,n,a);n.flags|=128}if(u=n.memoizedState,u!==null&&(u.rendering=null,u.tail=null,u.lastEffect=null),St(en,en.current),s)break;return null;case 22:return n.lanes=0,Em(t,n,a,n.pendingProps);case 24:da(n,an,t.memoizedState.cache)}return Xi(t,n,a)}function Lm(t,n,a){if(t!==null)if(t.memoizedProps!==n.pendingProps)sn=!0;else{if(!Jc(t,a)&&(n.flags&128)===0)return sn=!1,fS(t,n,a);sn=(t.flags&131072)!==0}else sn=!1,Se&&(n.flags&1048576)!==0&&cp(n,Vs,n.index);switch(n.lanes=0,n.tag){case 16:t:{var s=n.pendingProps;if(t=er(n.elementType),n.type=t,typeof t=="function")ic(t)?(s=rr(t,s),n.tag=1,n=Rm(null,n,t,s,a)):(n.tag=0,n=Wc(null,n,t,s,a));else{if(t!=null){var u=t.$$typeof;if(u===D){n.tag=11,n=xm(null,n,t,s,a);break t}else if(u===O){n.tag=14,n=ym(null,n,t,s,a);break t}}throw n=ct(t)||t,Error(r(306,n,""))}}return n;case 0:return Wc(t,n,n.type,n.pendingProps,a);case 1:return s=n.type,u=rr(s,n.pendingProps),Rm(t,n,s,u,a);case 3:t:{if(Ot(n,n.stateNode.containerInfo),t===null)throw Error(r(387));s=n.pendingProps;var f=n.memoizedState;u=f.element,vc(t,n),Ks(n,s,null,a);var _=n.memoizedState;if(s=_.cache,da(n,an,s),s!==f.cache&&hc(n,[an],a,!0),Zs(),s=_.element,f.isDehydrated)if(f={element:s,isDehydrated:!1,cache:_.cache},n.updateQueue.baseState=f,n.memoizedState=f,n.flags&256){n=Cm(t,n,s,a);break t}else if(s!==u){u=ei(Error(r(424)),n),Xs(u),n=Cm(t,n,s,a);break t}else for(t=n.stateNode.containerInfo,t.nodeType===9?t=t.body:t=t.nodeName==="HTML"?t.ownerDocument.body:t,We=si(t.firstChild),Sn=n,Se=!0,fa=null,ai=!0,a=Ep(n,null,s,a),n.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(Qa(),s===u){n=Xi(t,n,a);break t}yn(t,n,s,a)}n=n.child}return n;case 26:return Sl(t,n),t===null?(a=Xg(n.type,null,n.pendingProps,null))?n.memoizedState=a:Se||(a=n.type,t=n.pendingProps,s=Pl(Tt.current).createElement(a),s[Ze]=n,s[_n]=t,Mn(s,a,t),X(s),n.stateNode=s):n.memoizedState=Xg(n.type,t.memoizedProps,n.pendingProps,t.memoizedState),null;case 27:return Qt(n),t===null&&Se&&(s=n.stateNode=Hg(n.type,n.pendingProps,Tt.current),Sn=n,ai=!0,u=We,Aa(n.type)?(Lf=u,We=si(s.firstChild)):We=u),yn(t,n,n.pendingProps.children,a),Sl(t,n),t===null&&(n.flags|=4194304),n.child;case 5:return t===null&&Se&&((u=s=We)&&(s=GS(s,n.type,n.pendingProps,ai),s!==null?(n.stateNode=s,Sn=n,We=si(s.firstChild),ai=!1,u=!0):u=!1),u||ha(n)),Qt(n),u=n.type,f=n.pendingProps,_=t!==null?t.memoizedProps:null,s=f.children,Rf(u,f)?s=null:_!==null&&Rf(u,_)&&(n.flags|=32),n.memoizedState!==null&&(u=bc(t,n,nS,null,null,a),_o._currentValue=u),Sl(t,n),yn(t,n,s,a),n.child;case 6:return t===null&&Se&&((t=a=We)&&(a=VS(a,n.pendingProps,ai),a!==null?(n.stateNode=a,Sn=n,We=null,t=!0):t=!1),t||ha(n)),null;case 13:return wm(t,n,a);case 4:return Ot(n,n.stateNode.containerInfo),s=n.pendingProps,t===null?n.child=ir(n,null,s,a):yn(t,n,s,a),n.child;case 11:return xm(t,n,n.type,n.pendingProps,a);case 7:return yn(t,n,n.pendingProps,a),n.child;case 8:return yn(t,n,n.pendingProps.children,a),n.child;case 12:return yn(t,n,n.pendingProps.children,a),n.child;case 10:return s=n.pendingProps,da(n,n.type,s.value),yn(t,n,s.children,a),n.child;case 9:return u=n.type._context,s=n.pendingProps.children,$a(n),u=xn(u),s=s(u),n.flags|=1,yn(t,n,s,a),n.child;case 14:return ym(t,n,n.type,n.pendingProps,a);case 15:return Mm(t,n,n.type,n.pendingProps,a);case 19:return Um(t,n,a);case 31:return cS(t,n,a);case 22:return Em(t,n,a,n.pendingProps);case 24:return $a(n),s=xn(an),t===null?(u=mc(),u===null&&(u=Ve,f=dc(),u.pooledCache=f,f.refCount++,f!==null&&(u.pooledCacheLanes|=a),u=f),n.memoizedState={parent:s,cache:u},_c(n),da(n,an,u)):((t.lanes&a)!==0&&(vc(t,n),Ks(n,null,null,a),Zs()),u=t.memoizedState,f=n.memoizedState,u.parent!==s?(u={parent:s,cache:s},n.memoizedState=u,n.lanes===0&&(n.memoizedState=n.updateQueue.baseState=u),da(n,an,s)):(s=f.cache,da(n,an,s),s!==u.cache&&hc(n,[an],a,!0))),yn(t,n,n.pendingProps.children,a),n.child;case 29:throw n.pendingProps}throw Error(r(156,n.tag))}function ki(t){t.flags|=4}function $c(t,n,a,s,u){if((n=(t.mode&32)!==0)&&(n=!1),n){if(t.flags|=16777216,(u&335544128)===u)if(t.stateNode.complete)t.flags|=8192;else if(rg())t.flags|=8192;else throw nr=al,gc}else t.flags&=-16777217}function Nm(t,n){if(n.type!=="stylesheet"||(n.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!jg(n))if(rg())t.flags|=8192;else throw nr=al,gc}function yl(t,n){n!==null&&(t.flags|=4),t.flags&16384&&(n=t.tag!==22?Oe():536870912,t.lanes|=n,qr|=n)}function no(t,n){if(!Se)switch(t.tailMode){case"hidden":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?t.tail=null:a.sibling=null;break;case"collapsed":a=t.tail;for(var s=null;a!==null;)a.alternate!==null&&(s=a),a=a.sibling;s===null?n||t.tail===null?t.tail=null:t.tail.sibling=null:s.sibling=null}}function qe(t){var n=t.alternate!==null&&t.alternate.child===t.child,a=0,s=0;if(n)for(var u=t.child;u!==null;)a|=u.lanes|u.childLanes,s|=u.subtreeFlags&65011712,s|=u.flags&65011712,u.return=t,u=u.sibling;else for(u=t.child;u!==null;)a|=u.lanes|u.childLanes,s|=u.subtreeFlags,s|=u.flags,u.return=t,u=u.sibling;return t.subtreeFlags|=s,t.childLanes=a,n}function hS(t,n,a){var s=n.pendingProps;switch(oc(n),n.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return qe(n),null;case 1:return qe(n),null;case 3:return a=n.stateNode,s=null,t!==null&&(s=t.memoizedState.cache),n.memoizedState.cache!==s&&(n.flags|=2048),Hi(an),Kt(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(t===null||t.child===null)&&(Nr(n)?ki(n):t===null||t.memoizedState.isDehydrated&&(n.flags&256)===0||(n.flags|=1024,uc())),qe(n),null;case 26:var u=n.type,f=n.memoizedState;return t===null?(ki(n),f!==null?(qe(n),Nm(n,f)):(qe(n),$c(n,u,null,s,a))):f?f!==t.memoizedState?(ki(n),qe(n),Nm(n,f)):(qe(n),n.flags&=-16777217):(t=t.memoizedProps,t!==s&&ki(n),qe(n),$c(n,u,t,s,a)),null;case 27:if(Le(n),a=Tt.current,u=n.type,t!==null&&n.stateNode!=null)t.memoizedProps!==s&&ki(n);else{if(!s){if(n.stateNode===null)throw Error(r(166));return qe(n),null}t=j.current,Nr(n)?hp(n):(t=Hg(u,s,a),n.stateNode=t,ki(n))}return qe(n),null;case 5:if(Le(n),u=n.type,t!==null&&n.stateNode!=null)t.memoizedProps!==s&&ki(n);else{if(!s){if(n.stateNode===null)throw Error(r(166));return qe(n),null}if(f=j.current,Nr(n))hp(n);else{var _=Pl(Tt.current);switch(f){case 1:f=_.createElementNS("http://www.w3.org/2000/svg",u);break;case 2:f=_.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;default:switch(u){case"svg":f=_.createElementNS("http://www.w3.org/2000/svg",u);break;case"math":f=_.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;case"script":f=_.createElement("div"),f.innerHTML="<script><\/script>",f=f.removeChild(f.firstChild);break;case"select":f=typeof s.is=="string"?_.createElement("select",{is:s.is}):_.createElement("select"),s.multiple?f.multiple=!0:s.size&&(f.size=s.size);break;default:f=typeof s.is=="string"?_.createElement(u,{is:s.is}):_.createElement(u)}}f[Ze]=n,f[_n]=s;t:for(_=n.child;_!==null;){if(_.tag===5||_.tag===6)f.appendChild(_.stateNode);else if(_.tag!==4&&_.tag!==27&&_.child!==null){_.child.return=_,_=_.child;continue}if(_===n)break t;for(;_.sibling===null;){if(_.return===null||_.return===n)break t;_=_.return}_.sibling.return=_.return,_=_.sibling}n.stateNode=f;t:switch(Mn(f,u,s),u){case"button":case"input":case"select":case"textarea":s=!!s.autoFocus;break t;case"img":s=!0;break t;default:s=!1}s&&ki(n)}}return qe(n),$c(n,n.type,t===null?null:t.memoizedProps,n.pendingProps,a),null;case 6:if(t&&n.stateNode!=null)t.memoizedProps!==s&&ki(n);else{if(typeof s!="string"&&n.stateNode===null)throw Error(r(166));if(t=Tt.current,Nr(n)){if(t=n.stateNode,a=n.memoizedProps,s=null,u=Sn,u!==null)switch(u.tag){case 27:case 5:s=u.memoizedProps}t[Ze]=n,t=!!(t.nodeValue===a||s!==null&&s.suppressHydrationWarning===!0||wg(t.nodeValue,a)),t||ha(n,!0)}else t=Pl(t).createTextNode(s),t[Ze]=n,n.stateNode=t}return qe(n),null;case 31:if(a=n.memoizedState,t===null||t.memoizedState!==null){if(s=Nr(n),a!==null){if(t===null){if(!s)throw Error(r(318));if(t=n.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(r(557));t[Ze]=n}else Qa(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;qe(n),t=!1}else a=uc(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=a),t=!0;if(!t)return n.flags&256?(Yn(n),n):(Yn(n),null);if((n.flags&128)!==0)throw Error(r(558))}return qe(n),null;case 13:if(s=n.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(u=Nr(n),s!==null&&s.dehydrated!==null){if(t===null){if(!u)throw Error(r(318));if(u=n.memoizedState,u=u!==null?u.dehydrated:null,!u)throw Error(r(317));u[Ze]=n}else Qa(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;qe(n),u=!1}else u=uc(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=u),u=!0;if(!u)return n.flags&256?(Yn(n),n):(Yn(n),null)}return Yn(n),(n.flags&128)!==0?(n.lanes=a,n):(a=s!==null,t=t!==null&&t.memoizedState!==null,a&&(s=n.child,u=null,s.alternate!==null&&s.alternate.memoizedState!==null&&s.alternate.memoizedState.cachePool!==null&&(u=s.alternate.memoizedState.cachePool.pool),f=null,s.memoizedState!==null&&s.memoizedState.cachePool!==null&&(f=s.memoizedState.cachePool.pool),f!==u&&(s.flags|=2048)),a!==t&&a&&(n.child.flags|=8192),yl(n,n.updateQueue),qe(n),null);case 4:return Kt(),t===null&&Mf(n.stateNode.containerInfo),qe(n),null;case 10:return Hi(n.type),qe(n),null;case 19:if(nt(en),s=n.memoizedState,s===null)return qe(n),null;if(u=(n.flags&128)!==0,f=s.rendering,f===null)if(u)no(s,!1);else{if(Je!==0||t!==null&&(t.flags&128)!==0)for(t=n.child;t!==null;){if(f=ll(t),f!==null){for(n.flags|=128,no(s,!1),t=f.updateQueue,n.updateQueue=t,yl(n,t),n.subtreeFlags=0,t=a,a=n.child;a!==null;)op(a,t),a=a.sibling;return St(en,en.current&1|2),Se&&Ii(n,s.treeForkCount),n.child}t=t.sibling}s.tail!==null&&E()>Al&&(n.flags|=128,u=!0,no(s,!1),n.lanes=4194304)}else{if(!u)if(t=ll(f),t!==null){if(n.flags|=128,u=!0,t=t.updateQueue,n.updateQueue=t,yl(n,t),no(s,!0),s.tail===null&&s.tailMode==="hidden"&&!f.alternate&&!Se)return qe(n),null}else 2*E()-s.renderingStartTime>Al&&a!==536870912&&(n.flags|=128,u=!0,no(s,!1),n.lanes=4194304);s.isBackwards?(f.sibling=n.child,n.child=f):(t=s.last,t!==null?t.sibling=f:n.child=f,s.last=f)}return s.tail!==null?(t=s.tail,s.rendering=t,s.tail=t.sibling,s.renderingStartTime=E(),t.sibling=null,a=en.current,St(en,u?a&1|2:a&1),Se&&Ii(n,s.treeForkCount),t):(qe(n),null);case 22:case 23:return Yn(n),Mc(),s=n.memoizedState!==null,t!==null?t.memoizedState!==null!==s&&(n.flags|=8192):s&&(n.flags|=8192),s?(a&536870912)!==0&&(n.flags&128)===0&&(qe(n),n.subtreeFlags&6&&(n.flags|=8192)):qe(n),a=n.updateQueue,a!==null&&yl(n,a.retryQueue),a=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),s=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(s=n.memoizedState.cachePool.pool),s!==a&&(n.flags|=2048),t!==null&&nt(tr),null;case 24:return a=null,t!==null&&(a=t.memoizedState.cache),n.memoizedState.cache!==a&&(n.flags|=2048),Hi(an),qe(n),null;case 25:return null;case 30:return null}throw Error(r(156,n.tag))}function dS(t,n){switch(oc(n),n.tag){case 1:return t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 3:return Hi(an),Kt(),t=n.flags,(t&65536)!==0&&(t&128)===0?(n.flags=t&-65537|128,n):null;case 26:case 27:case 5:return Le(n),null;case 31:if(n.memoizedState!==null){if(Yn(n),n.alternate===null)throw Error(r(340));Qa()}return t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 13:if(Yn(n),t=n.memoizedState,t!==null&&t.dehydrated!==null){if(n.alternate===null)throw Error(r(340));Qa()}return t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 19:return nt(en),null;case 4:return Kt(),null;case 10:return Hi(n.type),null;case 22:case 23:return Yn(n),Mc(),t!==null&&nt(tr),t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 24:return Hi(an),null;case 25:return null;default:return null}}function Om(t,n){switch(oc(n),n.tag){case 3:Hi(an),Kt();break;case 26:case 27:case 5:Le(n);break;case 4:Kt();break;case 31:n.memoizedState!==null&&Yn(n);break;case 13:Yn(n);break;case 19:nt(en);break;case 10:Hi(n.type);break;case 22:case 23:Yn(n),Mc(),t!==null&&nt(tr);break;case 24:Hi(an)}}function io(t,n){try{var a=n.updateQueue,s=a!==null?a.lastEffect:null;if(s!==null){var u=s.next;a=u;do{if((a.tag&t)===t){s=void 0;var f=a.create,_=a.inst;s=f(),_.destroy=s}a=a.next}while(a!==u)}}catch(T){Ue(n,n.return,T)}}function Sa(t,n,a){try{var s=n.updateQueue,u=s!==null?s.lastEffect:null;if(u!==null){var f=u.next;s=f;do{if((s.tag&t)===t){var _=s.inst,T=_.destroy;if(T!==void 0){_.destroy=void 0,u=n;var P=a,J=T;try{J()}catch(ut){Ue(u,P,ut)}}}s=s.next}while(s!==f)}}catch(ut){Ue(n,n.return,ut)}}function zm(t){var n=t.updateQueue;if(n!==null){var a=t.stateNode;try{bp(n,a)}catch(s){Ue(t,t.return,s)}}}function Pm(t,n,a){a.props=rr(t.type,t.memoizedProps),a.state=t.memoizedState;try{a.componentWillUnmount()}catch(s){Ue(t,n,s)}}function ao(t,n){try{var a=t.ref;if(a!==null){switch(t.tag){case 26:case 27:case 5:var s=t.stateNode;break;case 30:s=t.stateNode;break;default:s=t.stateNode}typeof a=="function"?t.refCleanup=a(s):a.current=s}}catch(u){Ue(t,n,u)}}function Ri(t,n){var a=t.ref,s=t.refCleanup;if(a!==null)if(typeof s=="function")try{s()}catch(u){Ue(t,n,u)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(u){Ue(t,n,u)}else a.current=null}function Bm(t){var n=t.type,a=t.memoizedProps,s=t.stateNode;try{t:switch(n){case"button":case"input":case"select":case"textarea":a.autoFocus&&s.focus();break t;case"img":a.src?s.src=a.src:a.srcSet&&(s.srcset=a.srcSet)}}catch(u){Ue(t,t.return,u)}}function tf(t,n,a){try{var s=t.stateNode;zS(s,t.type,a,n),s[_n]=n}catch(u){Ue(t,t.return,u)}}function Im(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&Aa(t.type)||t.tag===4}function ef(t){t:for(;;){for(;t.sibling===null;){if(t.return===null||Im(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&Aa(t.type)||t.flags&2||t.child===null||t.tag===4)continue t;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function nf(t,n,a){var s=t.tag;if(s===5||s===6)t=t.stateNode,n?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(t,n):(n=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,n.appendChild(t),a=a._reactRootContainer,a!=null||n.onclick!==null||(n.onclick=zi));else if(s!==4&&(s===27&&Aa(t.type)&&(a=t.stateNode,n=null),t=t.child,t!==null))for(nf(t,n,a),t=t.sibling;t!==null;)nf(t,n,a),t=t.sibling}function Ml(t,n,a){var s=t.tag;if(s===5||s===6)t=t.stateNode,n?a.insertBefore(t,n):a.appendChild(t);else if(s!==4&&(s===27&&Aa(t.type)&&(a=t.stateNode),t=t.child,t!==null))for(Ml(t,n,a),t=t.sibling;t!==null;)Ml(t,n,a),t=t.sibling}function Fm(t){var n=t.stateNode,a=t.memoizedProps;try{for(var s=t.type,u=n.attributes;u.length;)n.removeAttributeNode(u[0]);Mn(n,s,a),n[Ze]=t,n[_n]=a}catch(f){Ue(t,t.return,f)}}var Wi=!1,on=!1,af=!1,Hm=typeof WeakSet=="function"?WeakSet:Set,pn=null;function pS(t,n){if(t=t.containerInfo,bf=Xl,t=Jd(t),Ku(t)){if("selectionStart"in t)var a={start:t.selectionStart,end:t.selectionEnd};else t:{a=(a=t.ownerDocument)&&a.defaultView||window;var s=a.getSelection&&a.getSelection();if(s&&s.rangeCount!==0){a=s.anchorNode;var u=s.anchorOffset,f=s.focusNode;s=s.focusOffset;try{a.nodeType,f.nodeType}catch{a=null;break t}var _=0,T=-1,P=-1,J=0,ut=0,mt=t,tt=null;e:for(;;){for(var ot;mt!==a||u!==0&&mt.nodeType!==3||(T=_+u),mt!==f||s!==0&&mt.nodeType!==3||(P=_+s),mt.nodeType===3&&(_+=mt.nodeValue.length),(ot=mt.firstChild)!==null;)tt=mt,mt=ot;for(;;){if(mt===t)break e;if(tt===a&&++J===u&&(T=_),tt===f&&++ut===s&&(P=_),(ot=mt.nextSibling)!==null)break;mt=tt,tt=mt.parentNode}mt=ot}a=T===-1||P===-1?null:{start:T,end:P}}else a=null}a=a||{start:0,end:0}}else a=null;for(Af={focusedElem:t,selectionRange:a},Xl=!1,pn=n;pn!==null;)if(n=pn,t=n.child,(n.subtreeFlags&1028)!==0&&t!==null)t.return=n,pn=t;else for(;pn!==null;){switch(n=pn,f=n.alternate,t=n.flags,n.tag){case 0:if((t&4)!==0&&(t=n.updateQueue,t=t!==null?t.events:null,t!==null))for(a=0;a<t.length;a++)u=t[a],u.ref.impl=u.nextImpl;break;case 11:case 15:break;case 1:if((t&1024)!==0&&f!==null){t=void 0,a=n,u=f.memoizedProps,f=f.memoizedState,s=a.stateNode;try{var It=rr(a.type,u);t=s.getSnapshotBeforeUpdate(It,f),s.__reactInternalSnapshotBeforeUpdate=t}catch(Jt){Ue(a,a.return,Jt)}}break;case 3:if((t&1024)!==0){if(t=n.stateNode.containerInfo,a=t.nodeType,a===9)wf(t);else if(a===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":wf(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((t&1024)!==0)throw Error(r(163))}if(t=n.sibling,t!==null){t.return=n.return,pn=t;break}pn=n.return}}function Gm(t,n,a){var s=a.flags;switch(a.tag){case 0:case 11:case 15:Yi(t,a),s&4&&io(5,a);break;case 1:if(Yi(t,a),s&4)if(t=a.stateNode,n===null)try{t.componentDidMount()}catch(_){Ue(a,a.return,_)}else{var u=rr(a.type,n.memoizedProps);n=n.memoizedState;try{t.componentDidUpdate(u,n,t.__reactInternalSnapshotBeforeUpdate)}catch(_){Ue(a,a.return,_)}}s&64&&zm(a),s&512&&ao(a,a.return);break;case 3:if(Yi(t,a),s&64&&(t=a.updateQueue,t!==null)){if(n=null,a.child!==null)switch(a.child.tag){case 27:case 5:n=a.child.stateNode;break;case 1:n=a.child.stateNode}try{bp(t,n)}catch(_){Ue(a,a.return,_)}}break;case 27:n===null&&s&4&&Fm(a);case 26:case 5:Yi(t,a),n===null&&s&4&&Bm(a),s&512&&ao(a,a.return);break;case 12:Yi(t,a);break;case 31:Yi(t,a),s&4&&km(t,a);break;case 13:Yi(t,a),s&4&&Wm(t,a),s&64&&(t=a.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(a=ES.bind(null,a),XS(t,a))));break;case 22:if(s=a.memoizedState!==null||Wi,!s){n=n!==null&&n.memoizedState!==null||on,u=Wi;var f=on;Wi=s,(on=n)&&!f?ji(t,a,(a.subtreeFlags&8772)!==0):Yi(t,a),Wi=u,on=f}break;case 30:break;default:Yi(t,a)}}function Vm(t){var n=t.alternate;n!==null&&(t.alternate=null,Vm(n)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(n=t.stateNode,n!==null&&Ls(n)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var Ye=null,Pn=!1;function qi(t,n,a){for(a=a.child;a!==null;)Xm(t,n,a),a=a.sibling}function Xm(t,n,a){if(Rt&&typeof Rt.onCommitFiberUnmount=="function")try{Rt.onCommitFiberUnmount(vt,a)}catch{}switch(a.tag){case 26:on||Ri(a,n),qi(t,n,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:on||Ri(a,n);var s=Ye,u=Pn;Aa(a.type)&&(Ye=a.stateNode,Pn=!1),qi(t,n,a),po(a.stateNode),Ye=s,Pn=u;break;case 5:on||Ri(a,n);case 6:if(s=Ye,u=Pn,Ye=null,qi(t,n,a),Ye=s,Pn=u,Ye!==null)if(Pn)try{(Ye.nodeType===9?Ye.body:Ye.nodeName==="HTML"?Ye.ownerDocument.body:Ye).removeChild(a.stateNode)}catch(f){Ue(a,n,f)}else try{Ye.removeChild(a.stateNode)}catch(f){Ue(a,n,f)}break;case 18:Ye!==null&&(Pn?(t=Ye,zg(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,a.stateNode),ts(t)):zg(Ye,a.stateNode));break;case 4:s=Ye,u=Pn,Ye=a.stateNode.containerInfo,Pn=!0,qi(t,n,a),Ye=s,Pn=u;break;case 0:case 11:case 14:case 15:Sa(2,a,n),on||Sa(4,a,n),qi(t,n,a);break;case 1:on||(Ri(a,n),s=a.stateNode,typeof s.componentWillUnmount=="function"&&Pm(a,n,s)),qi(t,n,a);break;case 21:qi(t,n,a);break;case 22:on=(s=on)||a.memoizedState!==null,qi(t,n,a),on=s;break;default:qi(t,n,a)}}function km(t,n){if(n.memoizedState===null&&(t=n.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{ts(t)}catch(a){Ue(n,n.return,a)}}}function Wm(t,n){if(n.memoizedState===null&&(t=n.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{ts(t)}catch(a){Ue(n,n.return,a)}}function mS(t){switch(t.tag){case 31:case 13:case 19:var n=t.stateNode;return n===null&&(n=t.stateNode=new Hm),n;case 22:return t=t.stateNode,n=t._retryCache,n===null&&(n=t._retryCache=new Hm),n;default:throw Error(r(435,t.tag))}}function El(t,n){var a=mS(t);n.forEach(function(s){if(!a.has(s)){a.add(s);var u=TS.bind(null,t,s);s.then(u,u)}})}function Bn(t,n){var a=n.deletions;if(a!==null)for(var s=0;s<a.length;s++){var u=a[s],f=t,_=n,T=_;t:for(;T!==null;){switch(T.tag){case 27:if(Aa(T.type)){Ye=T.stateNode,Pn=!1;break t}break;case 5:Ye=T.stateNode,Pn=!1;break t;case 3:case 4:Ye=T.stateNode.containerInfo,Pn=!0;break t}T=T.return}if(Ye===null)throw Error(r(160));Xm(f,_,u),Ye=null,Pn=!1,f=u.alternate,f!==null&&(f.return=null),u.return=null}if(n.subtreeFlags&13886)for(n=n.child;n!==null;)qm(n,t),n=n.sibling}var pi=null;function qm(t,n){var a=t.alternate,s=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:Bn(n,t),In(t),s&4&&(Sa(3,t,t.return),io(3,t),Sa(5,t,t.return));break;case 1:Bn(n,t),In(t),s&512&&(on||a===null||Ri(a,a.return)),s&64&&Wi&&(t=t.updateQueue,t!==null&&(s=t.callbacks,s!==null&&(a=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=a===null?s:a.concat(s))));break;case 26:var u=pi;if(Bn(n,t),In(t),s&512&&(on||a===null||Ri(a,a.return)),s&4){var f=a!==null?a.memoizedState:null;if(s=t.memoizedState,a===null)if(s===null)if(t.stateNode===null){t:{s=t.type,a=t.memoizedProps,u=u.ownerDocument||u;e:switch(s){case"title":f=u.getElementsByTagName("title")[0],(!f||f[Wa]||f[Ze]||f.namespaceURI==="http://www.w3.org/2000/svg"||f.hasAttribute("itemprop"))&&(f=u.createElement(s),u.head.insertBefore(f,u.querySelector("head > title"))),Mn(f,s,a),f[Ze]=t,X(f),s=f;break t;case"link":var _=qg("link","href",u).get(s+(a.href||""));if(_){for(var T=0;T<_.length;T++)if(f=_[T],f.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&f.getAttribute("rel")===(a.rel==null?null:a.rel)&&f.getAttribute("title")===(a.title==null?null:a.title)&&f.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){_.splice(T,1);break e}}f=u.createElement(s),Mn(f,s,a),u.head.appendChild(f);break;case"meta":if(_=qg("meta","content",u).get(s+(a.content||""))){for(T=0;T<_.length;T++)if(f=_[T],f.getAttribute("content")===(a.content==null?null:""+a.content)&&f.getAttribute("name")===(a.name==null?null:a.name)&&f.getAttribute("property")===(a.property==null?null:a.property)&&f.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&f.getAttribute("charset")===(a.charSet==null?null:a.charSet)){_.splice(T,1);break e}}f=u.createElement(s),Mn(f,s,a),u.head.appendChild(f);break;default:throw Error(r(468,s))}f[Ze]=t,X(f),s=f}t.stateNode=s}else Yg(u,t.type,t.stateNode);else t.stateNode=Wg(u,s,t.memoizedProps);else f!==s?(f===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):f.count--,s===null?Yg(u,t.type,t.stateNode):Wg(u,s,t.memoizedProps)):s===null&&t.stateNode!==null&&tf(t,t.memoizedProps,a.memoizedProps)}break;case 27:Bn(n,t),In(t),s&512&&(on||a===null||Ri(a,a.return)),a!==null&&s&4&&tf(t,t.memoizedProps,a.memoizedProps);break;case 5:if(Bn(n,t),In(t),s&512&&(on||a===null||Ri(a,a.return)),t.flags&32){u=t.stateNode;try{On(u,"")}catch(It){Ue(t,t.return,It)}}s&4&&t.stateNode!=null&&(u=t.memoizedProps,tf(t,u,a!==null?a.memoizedProps:u)),s&1024&&(af=!0);break;case 6:if(Bn(n,t),In(t),s&4){if(t.stateNode===null)throw Error(r(162));s=t.memoizedProps,a=t.stateNode;try{a.nodeValue=s}catch(It){Ue(t,t.return,It)}}break;case 3:if(Fl=null,u=pi,pi=Bl(n.containerInfo),Bn(n,t),pi=u,In(t),s&4&&a!==null&&a.memoizedState.isDehydrated)try{ts(n.containerInfo)}catch(It){Ue(t,t.return,It)}af&&(af=!1,Ym(t));break;case 4:s=pi,pi=Bl(t.stateNode.containerInfo),Bn(n,t),In(t),pi=s;break;case 12:Bn(n,t),In(t);break;case 31:Bn(n,t),In(t),s&4&&(s=t.updateQueue,s!==null&&(t.updateQueue=null,El(t,s)));break;case 13:Bn(n,t),In(t),t.child.flags&8192&&t.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(bl=E()),s&4&&(s=t.updateQueue,s!==null&&(t.updateQueue=null,El(t,s)));break;case 22:u=t.memoizedState!==null;var P=a!==null&&a.memoizedState!==null,J=Wi,ut=on;if(Wi=J||u,on=ut||P,Bn(n,t),on=ut,Wi=J,In(t),s&8192)t:for(n=t.stateNode,n._visibility=u?n._visibility&-2:n._visibility|1,u&&(a===null||P||Wi||on||sr(t)),a=null,n=t;;){if(n.tag===5||n.tag===26){if(a===null){P=a=n;try{if(f=P.stateNode,u)_=f.style,typeof _.setProperty=="function"?_.setProperty("display","none","important"):_.display="none";else{T=P.stateNode;var mt=P.memoizedProps.style,tt=mt!=null&&mt.hasOwnProperty("display")?mt.display:null;T.style.display=tt==null||typeof tt=="boolean"?"":(""+tt).trim()}}catch(It){Ue(P,P.return,It)}}}else if(n.tag===6){if(a===null){P=n;try{P.stateNode.nodeValue=u?"":P.memoizedProps}catch(It){Ue(P,P.return,It)}}}else if(n.tag===18){if(a===null){P=n;try{var ot=P.stateNode;u?Pg(ot,!0):Pg(P.stateNode,!1)}catch(It){Ue(P,P.return,It)}}}else if((n.tag!==22&&n.tag!==23||n.memoizedState===null||n===t)&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break t;for(;n.sibling===null;){if(n.return===null||n.return===t)break t;a===n&&(a=null),n=n.return}a===n&&(a=null),n.sibling.return=n.return,n=n.sibling}s&4&&(s=t.updateQueue,s!==null&&(a=s.retryQueue,a!==null&&(s.retryQueue=null,El(t,a))));break;case 19:Bn(n,t),In(t),s&4&&(s=t.updateQueue,s!==null&&(t.updateQueue=null,El(t,s)));break;case 30:break;case 21:break;default:Bn(n,t),In(t)}}function In(t){var n=t.flags;if(n&2){try{for(var a,s=t.return;s!==null;){if(Im(s)){a=s;break}s=s.return}if(a==null)throw Error(r(160));switch(a.tag){case 27:var u=a.stateNode,f=ef(t);Ml(t,f,u);break;case 5:var _=a.stateNode;a.flags&32&&(On(_,""),a.flags&=-33);var T=ef(t);Ml(t,T,_);break;case 3:case 4:var P=a.stateNode.containerInfo,J=ef(t);nf(t,J,P);break;default:throw Error(r(161))}}catch(ut){Ue(t,t.return,ut)}t.flags&=-3}n&4096&&(t.flags&=-4097)}function Ym(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var n=t;Ym(n),n.tag===5&&n.flags&1024&&n.stateNode.reset(),t=t.sibling}}function Yi(t,n){if(n.subtreeFlags&8772)for(n=n.child;n!==null;)Gm(t,n.alternate,n),n=n.sibling}function sr(t){for(t=t.child;t!==null;){var n=t;switch(n.tag){case 0:case 11:case 14:case 15:Sa(4,n,n.return),sr(n);break;case 1:Ri(n,n.return);var a=n.stateNode;typeof a.componentWillUnmount=="function"&&Pm(n,n.return,a),sr(n);break;case 27:po(n.stateNode);case 26:case 5:Ri(n,n.return),sr(n);break;case 22:n.memoizedState===null&&sr(n);break;case 30:sr(n);break;default:sr(n)}t=t.sibling}}function ji(t,n,a){for(a=a&&(n.subtreeFlags&8772)!==0,n=n.child;n!==null;){var s=n.alternate,u=t,f=n,_=f.flags;switch(f.tag){case 0:case 11:case 15:ji(u,f,a),io(4,f);break;case 1:if(ji(u,f,a),s=f,u=s.stateNode,typeof u.componentDidMount=="function")try{u.componentDidMount()}catch(J){Ue(s,s.return,J)}if(s=f,u=s.updateQueue,u!==null){var T=s.stateNode;try{var P=u.shared.hiddenCallbacks;if(P!==null)for(u.shared.hiddenCallbacks=null,u=0;u<P.length;u++)Tp(P[u],T)}catch(J){Ue(s,s.return,J)}}a&&_&64&&zm(f),ao(f,f.return);break;case 27:Fm(f);case 26:case 5:ji(u,f,a),a&&s===null&&_&4&&Bm(f),ao(f,f.return);break;case 12:ji(u,f,a);break;case 31:ji(u,f,a),a&&_&4&&km(u,f);break;case 13:ji(u,f,a),a&&_&4&&Wm(u,f);break;case 22:f.memoizedState===null&&ji(u,f,a),ao(f,f.return);break;case 30:break;default:ji(u,f,a)}n=n.sibling}}function rf(t,n){var a=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),t=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(t=n.memoizedState.cachePool.pool),t!==a&&(t!=null&&t.refCount++,a!=null&&ks(a))}function sf(t,n){t=null,n.alternate!==null&&(t=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==t&&(n.refCount++,t!=null&&ks(t))}function mi(t,n,a,s){if(n.subtreeFlags&10256)for(n=n.child;n!==null;)jm(t,n,a,s),n=n.sibling}function jm(t,n,a,s){var u=n.flags;switch(n.tag){case 0:case 11:case 15:mi(t,n,a,s),u&2048&&io(9,n);break;case 1:mi(t,n,a,s);break;case 3:mi(t,n,a,s),u&2048&&(t=null,n.alternate!==null&&(t=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==t&&(n.refCount++,t!=null&&ks(t)));break;case 12:if(u&2048){mi(t,n,a,s),t=n.stateNode;try{var f=n.memoizedProps,_=f.id,T=f.onPostCommit;typeof T=="function"&&T(_,n.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(P){Ue(n,n.return,P)}}else mi(t,n,a,s);break;case 31:mi(t,n,a,s);break;case 13:mi(t,n,a,s);break;case 23:break;case 22:f=n.stateNode,_=n.alternate,n.memoizedState!==null?f._visibility&2?mi(t,n,a,s):ro(t,n):f._visibility&2?mi(t,n,a,s):(f._visibility|=2,Xr(t,n,a,s,(n.subtreeFlags&10256)!==0||!1)),u&2048&&rf(_,n);break;case 24:mi(t,n,a,s),u&2048&&sf(n.alternate,n);break;default:mi(t,n,a,s)}}function Xr(t,n,a,s,u){for(u=u&&((n.subtreeFlags&10256)!==0||!1),n=n.child;n!==null;){var f=t,_=n,T=a,P=s,J=_.flags;switch(_.tag){case 0:case 11:case 15:Xr(f,_,T,P,u),io(8,_);break;case 23:break;case 22:var ut=_.stateNode;_.memoizedState!==null?ut._visibility&2?Xr(f,_,T,P,u):ro(f,_):(ut._visibility|=2,Xr(f,_,T,P,u)),u&&J&2048&&rf(_.alternate,_);break;case 24:Xr(f,_,T,P,u),u&&J&2048&&sf(_.alternate,_);break;default:Xr(f,_,T,P,u)}n=n.sibling}}function ro(t,n){if(n.subtreeFlags&10256)for(n=n.child;n!==null;){var a=t,s=n,u=s.flags;switch(s.tag){case 22:ro(a,s),u&2048&&rf(s.alternate,s);break;case 24:ro(a,s),u&2048&&sf(s.alternate,s);break;default:ro(a,s)}n=n.sibling}}var so=8192;function kr(t,n,a){if(t.subtreeFlags&so)for(t=t.child;t!==null;)Zm(t,n,a),t=t.sibling}function Zm(t,n,a){switch(t.tag){case 26:kr(t,n,a),t.flags&so&&t.memoizedState!==null&&ex(a,pi,t.memoizedState,t.memoizedProps);break;case 5:kr(t,n,a);break;case 3:case 4:var s=pi;pi=Bl(t.stateNode.containerInfo),kr(t,n,a),pi=s;break;case 22:t.memoizedState===null&&(s=t.alternate,s!==null&&s.memoizedState!==null?(s=so,so=16777216,kr(t,n,a),so=s):kr(t,n,a));break;default:kr(t,n,a)}}function Km(t){var n=t.alternate;if(n!==null&&(t=n.child,t!==null)){n.child=null;do n=t.sibling,t.sibling=null,t=n;while(t!==null)}}function oo(t){var n=t.deletions;if((t.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var s=n[a];pn=s,Jm(s,t)}Km(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Qm(t),t=t.sibling}function Qm(t){switch(t.tag){case 0:case 11:case 15:oo(t),t.flags&2048&&Sa(9,t,t.return);break;case 3:oo(t);break;case 12:oo(t);break;case 22:var n=t.stateNode;t.memoizedState!==null&&n._visibility&2&&(t.return===null||t.return.tag!==13)?(n._visibility&=-3,Tl(t)):oo(t);break;default:oo(t)}}function Tl(t){var n=t.deletions;if((t.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var s=n[a];pn=s,Jm(s,t)}Km(t)}for(t=t.child;t!==null;){switch(n=t,n.tag){case 0:case 11:case 15:Sa(8,n,n.return),Tl(n);break;case 22:a=n.stateNode,a._visibility&2&&(a._visibility&=-3,Tl(n));break;default:Tl(n)}t=t.sibling}}function Jm(t,n){for(;pn!==null;){var a=pn;switch(a.tag){case 0:case 11:case 15:Sa(8,a,n);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var s=a.memoizedState.cachePool.pool;s!=null&&s.refCount++}break;case 24:ks(a.memoizedState.cache)}if(s=a.child,s!==null)s.return=a,pn=s;else t:for(a=t;pn!==null;){s=pn;var u=s.sibling,f=s.return;if(Vm(s),s===a){pn=null;break t}if(u!==null){u.return=f,pn=u;break t}pn=f}}}var gS={getCacheForType:function(t){var n=xn(an),a=n.data.get(t);return a===void 0&&(a=t(),n.data.set(t,a)),a},cacheSignal:function(){return xn(an).controller.signal}},_S=typeof WeakMap=="function"?WeakMap:Map,we=0,Ve=null,fe=null,me=0,De=0,jn=null,xa=!1,Wr=!1,of=!1,Zi=0,Je=0,ya=0,or=0,lf=0,Zn=0,qr=0,lo=null,Fn=null,uf=!1,bl=0,$m=0,Al=1/0,Rl=null,Ma=null,cn=0,Ea=null,Yr=null,Ki=0,cf=0,ff=null,tg=null,uo=0,hf=null;function Kn(){return(we&2)!==0&&me!==0?me&-me:z.T!==null?vf():Ds()}function eg(){if(Zn===0)if((me&536870912)===0||Se){var t=Mt;Mt<<=1,(Mt&3932160)===0&&(Mt=262144),Zn=t}else Zn=536870912;return t=qn.current,t!==null&&(t.flags|=32),Zn}function Hn(t,n,a){(t===Ve&&(De===2||De===9)||t.cancelPendingCommit!==null)&&(jr(t,0),Ta(t,me,Zn,!1)),gn(t,a),((we&2)===0||t!==Ve)&&(t===Ve&&((we&2)===0&&(or|=a),Je===4&&Ta(t,me,Zn,!1)),Ci(t))}function ng(t,n,a){if((we&6)!==0)throw Error(r(327));var s=!a&&(n&127)===0&&(n&t.expiredLanes)===0||Bt(t,n),u=s?xS(t,n):pf(t,n,!0),f=s;do{if(u===0){Wr&&!s&&Ta(t,n,0,!1);break}else{if(a=t.current.alternate,f&&!vS(a)){u=pf(t,n,!1),f=!1;continue}if(u===2){if(f=n,t.errorRecoveryDisabledLanes&f)var _=0;else _=t.pendingLanes&-536870913,_=_!==0?_:_&536870912?536870912:0;if(_!==0){n=_;t:{var T=t;u=lo;var P=T.current.memoizedState.isDehydrated;if(P&&(jr(T,_).flags|=256),_=pf(T,_,!1),_!==2){if(of&&!P){T.errorRecoveryDisabledLanes|=f,or|=f,u=4;break t}f=Fn,Fn=u,f!==null&&(Fn===null?Fn=f:Fn.push.apply(Fn,f))}u=_}if(f=!1,u!==2)continue}}if(u===1){jr(t,0),Ta(t,n,0,!0);break}t:{switch(s=t,f=u,f){case 0:case 1:throw Error(r(345));case 4:if((n&4194048)!==n)break;case 6:Ta(s,n,Zn,!xa);break t;case 2:Fn=null;break;case 3:case 5:break;default:throw Error(r(329))}if((n&62914560)===n&&(u=bl+300-E(),10<u)){if(Ta(s,n,Zn,!xa),gt(s,0,!0)!==0)break t;Ki=n,s.timeoutHandle=Ng(ig.bind(null,s,a,Fn,Rl,uf,n,Zn,or,qr,xa,f,"Throttled",-0,0),u);break t}ig(s,a,Fn,Rl,uf,n,Zn,or,qr,xa,f,null,-0,0)}}break}while(!0);Ci(t)}function ig(t,n,a,s,u,f,_,T,P,J,ut,mt,tt,ot){if(t.timeoutHandle=-1,mt=n.subtreeFlags,mt&8192||(mt&16785408)===16785408){mt={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:zi},Zm(n,f,mt);var It=(f&62914560)===f?bl-E():(f&4194048)===f?$m-E():0;if(It=nx(mt,It),It!==null){Ki=f,t.cancelPendingCommit=It(fg.bind(null,t,n,f,a,s,u,_,T,P,ut,mt,null,tt,ot)),Ta(t,f,_,!J);return}}fg(t,n,f,a,s,u,_,T,P)}function vS(t){for(var n=t;;){var a=n.tag;if((a===0||a===11||a===15)&&n.flags&16384&&(a=n.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var s=0;s<a.length;s++){var u=a[s],f=u.getSnapshot;u=u.value;try{if(!kn(f(),u))return!1}catch{return!1}}if(a=n.child,n.subtreeFlags&16384&&a!==null)a.return=n,n=a;else{if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return!0;n=n.return}n.sibling.return=n.return,n=n.sibling}}return!0}function Ta(t,n,a,s){n&=~lf,n&=~or,t.suspendedLanes|=n,t.pingedLanes&=~n,s&&(t.warmLanes|=n),s=t.expirationTimes;for(var u=n;0<u;){var f=31-Ft(u),_=1<<f;s[f]=-1,u&=~_}a!==0&&Cs(t,a,n)}function Cl(){return(we&6)===0?(co(0),!1):!0}function df(){if(fe!==null){if(De===0)var t=fe.return;else t=fe,Fi=Ja=null,Cc(t),Ir=null,qs=0,t=fe;for(;t!==null;)Om(t.alternate,t),t=t.return;fe=null}}function jr(t,n){var a=t.timeoutHandle;a!==-1&&(t.timeoutHandle=-1,IS(a)),a=t.cancelPendingCommit,a!==null&&(t.cancelPendingCommit=null,a()),Ki=0,df(),Ve=t,fe=a=Bi(t.current,null),me=n,De=0,jn=null,xa=!1,Wr=Bt(t,n),of=!1,qr=Zn=lf=or=ya=Je=0,Fn=lo=null,uf=!1,(n&8)!==0&&(n|=n&32);var s=t.entangledLanes;if(s!==0)for(t=t.entanglements,s&=n;0<s;){var u=31-Ft(s),f=1<<u;n|=t[u],s&=~f}return Zi=n,Zo(),a}function ag(t,n){re=null,z.H=to,n===Br||n===il?(n=xp(),De=3):n===gc?(n=xp(),De=4):De=n===kc?8:n!==null&&typeof n=="object"&&typeof n.then=="function"?6:1,jn=n,fe===null&&(Je=1,_l(t,ei(n,t.current)))}function rg(){var t=qn.current;return t===null?!0:(me&4194048)===me?ri===null:(me&62914560)===me||(me&536870912)!==0?t===ri:!1}function sg(){var t=z.H;return z.H=to,t===null?to:t}function og(){var t=z.A;return z.A=gS,t}function wl(){Je=4,xa||(me&4194048)!==me&&qn.current!==null||(Wr=!0),(ya&134217727)===0&&(or&134217727)===0||Ve===null||Ta(Ve,me,Zn,!1)}function pf(t,n,a){var s=we;we|=2;var u=sg(),f=og();(Ve!==t||me!==n)&&(Rl=null,jr(t,n)),n=!1;var _=Je;t:do try{if(De!==0&&fe!==null){var T=fe,P=jn;switch(De){case 8:df(),_=6;break t;case 3:case 2:case 9:case 6:qn.current===null&&(n=!0);var J=De;if(De=0,jn=null,Zr(t,T,P,J),a&&Wr){_=0;break t}break;default:J=De,De=0,jn=null,Zr(t,T,P,J)}}SS(),_=Je;break}catch(ut){ag(t,ut)}while(!0);return n&&t.shellSuspendCounter++,Fi=Ja=null,we=s,z.H=u,z.A=f,fe===null&&(Ve=null,me=0,Zo()),_}function SS(){for(;fe!==null;)lg(fe)}function xS(t,n){var a=we;we|=2;var s=sg(),u=og();Ve!==t||me!==n?(Rl=null,Al=E()+500,jr(t,n)):Wr=Bt(t,n);t:do try{if(De!==0&&fe!==null){n=fe;var f=jn;e:switch(De){case 1:De=0,jn=null,Zr(t,n,f,1);break;case 2:case 9:if(vp(f)){De=0,jn=null,ug(n);break}n=function(){De!==2&&De!==9||Ve!==t||(De=7),Ci(t)},f.then(n,n);break t;case 3:De=7;break t;case 4:De=5;break t;case 7:vp(f)?(De=0,jn=null,ug(n)):(De=0,jn=null,Zr(t,n,f,7));break;case 5:var _=null;switch(fe.tag){case 26:_=fe.memoizedState;case 5:case 27:var T=fe;if(_?jg(_):T.stateNode.complete){De=0,jn=null;var P=T.sibling;if(P!==null)fe=P;else{var J=T.return;J!==null?(fe=J,Dl(J)):fe=null}break e}}De=0,jn=null,Zr(t,n,f,5);break;case 6:De=0,jn=null,Zr(t,n,f,6);break;case 8:df(),Je=6;break t;default:throw Error(r(462))}}yS();break}catch(ut){ag(t,ut)}while(!0);return Fi=Ja=null,z.H=s,z.A=u,we=a,fe!==null?0:(Ve=null,me=0,Zo(),Je)}function yS(){for(;fe!==null&&!tn();)lg(fe)}function lg(t){var n=Lm(t.alternate,t,Zi);t.memoizedProps=t.pendingProps,n===null?Dl(t):fe=n}function ug(t){var n=t,a=n.alternate;switch(n.tag){case 15:case 0:n=Am(a,n,n.pendingProps,n.type,void 0,me);break;case 11:n=Am(a,n,n.pendingProps,n.type.render,n.ref,me);break;case 5:Cc(n);default:Om(a,n),n=fe=op(n,Zi),n=Lm(a,n,Zi)}t.memoizedProps=t.pendingProps,n===null?Dl(t):fe=n}function Zr(t,n,a,s){Fi=Ja=null,Cc(n),Ir=null,qs=0;var u=n.return;try{if(uS(t,u,n,a,me)){Je=1,_l(t,ei(a,t.current)),fe=null;return}}catch(f){if(u!==null)throw fe=u,f;Je=1,_l(t,ei(a,t.current)),fe=null;return}n.flags&32768?(Se||s===1?t=!0:Wr||(me&536870912)!==0?t=!1:(xa=t=!0,(s===2||s===9||s===3||s===6)&&(s=qn.current,s!==null&&s.tag===13&&(s.flags|=16384))),cg(n,t)):Dl(n)}function Dl(t){var n=t;do{if((n.flags&32768)!==0){cg(n,xa);return}t=n.return;var a=hS(n.alternate,n,Zi);if(a!==null){fe=a;return}if(n=n.sibling,n!==null){fe=n;return}fe=n=t}while(n!==null);Je===0&&(Je=5)}function cg(t,n){do{var a=dS(t.alternate,t);if(a!==null){a.flags&=32767,fe=a;return}if(a=t.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!n&&(t=t.sibling,t!==null)){fe=t;return}fe=t=a}while(t!==null);Je=6,fe=null}function fg(t,n,a,s,u,f,_,T,P){t.cancelPendingCommit=null;do Ul();while(cn!==0);if((we&6)!==0)throw Error(r(327));if(n!==null){if(n===t.current)throw Error(r(177));if(f=n.lanes|n.childLanes,f|=ec,ci(t,a,f,_,T,P),t===Ve&&(fe=Ve=null,me=0),Yr=n,Ea=t,Ki=a,cf=f,ff=u,tg=s,(n.subtreeFlags&10256)!==0||(n.flags&10256)!==0?(t.callbackNode=null,t.callbackPriority=0,bS(lt,function(){return gg(),null})):(t.callbackNode=null,t.callbackPriority=0),s=(n.flags&13878)!==0,(n.subtreeFlags&13878)!==0||s){s=z.T,z.T=null,u=K.p,K.p=2,_=we,we|=4;try{pS(t,n,a)}finally{we=_,K.p=u,z.T=s}}cn=1,hg(),dg(),pg()}}function hg(){if(cn===1){cn=0;var t=Ea,n=Yr,a=(n.flags&13878)!==0;if((n.subtreeFlags&13878)!==0||a){a=z.T,z.T=null;var s=K.p;K.p=2;var u=we;we|=4;try{qm(n,t);var f=Af,_=Jd(t.containerInfo),T=f.focusedElem,P=f.selectionRange;if(_!==T&&T&&T.ownerDocument&&Qd(T.ownerDocument.documentElement,T)){if(P!==null&&Ku(T)){var J=P.start,ut=P.end;if(ut===void 0&&(ut=J),"selectionStart"in T)T.selectionStart=J,T.selectionEnd=Math.min(ut,T.value.length);else{var mt=T.ownerDocument||document,tt=mt&&mt.defaultView||window;if(tt.getSelection){var ot=tt.getSelection(),It=T.textContent.length,Jt=Math.min(P.start,It),Ie=P.end===void 0?Jt:Math.min(P.end,It);!ot.extend&&Jt>Ie&&(_=Ie,Ie=Jt,Jt=_);var Y=Kd(T,Jt),G=Kd(T,Ie);if(Y&&G&&(ot.rangeCount!==1||ot.anchorNode!==Y.node||ot.anchorOffset!==Y.offset||ot.focusNode!==G.node||ot.focusOffset!==G.offset)){var Q=mt.createRange();Q.setStart(Y.node,Y.offset),ot.removeAllRanges(),Jt>Ie?(ot.addRange(Q),ot.extend(G.node,G.offset)):(Q.setEnd(G.node,G.offset),ot.addRange(Q))}}}}for(mt=[],ot=T;ot=ot.parentNode;)ot.nodeType===1&&mt.push({element:ot,left:ot.scrollLeft,top:ot.scrollTop});for(typeof T.focus=="function"&&T.focus(),T=0;T<mt.length;T++){var ht=mt[T];ht.element.scrollLeft=ht.left,ht.element.scrollTop=ht.top}}Xl=!!bf,Af=bf=null}finally{we=u,K.p=s,z.T=a}}t.current=n,cn=2}}function dg(){if(cn===2){cn=0;var t=Ea,n=Yr,a=(n.flags&8772)!==0;if((n.subtreeFlags&8772)!==0||a){a=z.T,z.T=null;var s=K.p;K.p=2;var u=we;we|=4;try{Gm(t,n.alternate,n)}finally{we=u,K.p=s,z.T=a}}cn=3}}function pg(){if(cn===4||cn===3){cn=0,L();var t=Ea,n=Yr,a=Ki,s=tg;(n.subtreeFlags&10256)!==0||(n.flags&10256)!==0?cn=5:(cn=0,Yr=Ea=null,mg(t,t.pendingLanes));var u=t.pendingLanes;if(u===0&&(Ma=null),Mr(a),n=n.stateNode,Rt&&typeof Rt.onCommitFiberRoot=="function")try{Rt.onCommitFiberRoot(vt,n,void 0,(n.current.flags&128)===128)}catch{}if(s!==null){n=z.T,u=K.p,K.p=2,z.T=null;try{for(var f=t.onRecoverableError,_=0;_<s.length;_++){var T=s[_];f(T.value,{componentStack:T.stack})}}finally{z.T=n,K.p=u}}(Ki&3)!==0&&Ul(),Ci(t),u=t.pendingLanes,(a&261930)!==0&&(u&42)!==0?t===hf?uo++:(uo=0,hf=t):uo=0,co(0)}}function mg(t,n){(t.pooledCacheLanes&=n)===0&&(n=t.pooledCache,n!=null&&(t.pooledCache=null,ks(n)))}function Ul(){return hg(),dg(),pg(),gg()}function gg(){if(cn!==5)return!1;var t=Ea,n=cf;cf=0;var a=Mr(Ki),s=z.T,u=K.p;try{K.p=32>a?32:a,z.T=null,a=ff,ff=null;var f=Ea,_=Ki;if(cn=0,Yr=Ea=null,Ki=0,(we&6)!==0)throw Error(r(331));var T=we;if(we|=4,Qm(f.current),jm(f,f.current,_,a),we=T,co(0,!1),Rt&&typeof Rt.onPostCommitFiberRoot=="function")try{Rt.onPostCommitFiberRoot(vt,f)}catch{}return!0}finally{K.p=u,z.T=s,mg(t,n)}}function _g(t,n,a){n=ei(a,n),n=Xc(t.stateNode,n,2),t=ga(t,n,2),t!==null&&(gn(t,2),Ci(t))}function Ue(t,n,a){if(t.tag===3)_g(t,t,a);else for(;n!==null;){if(n.tag===3){_g(n,t,a);break}else if(n.tag===1){var s=n.stateNode;if(typeof n.type.getDerivedStateFromError=="function"||typeof s.componentDidCatch=="function"&&(Ma===null||!Ma.has(s))){t=ei(a,t),a=vm(2),s=ga(n,a,2),s!==null&&(Sm(a,s,n,t),gn(s,2),Ci(s));break}}n=n.return}}function mf(t,n,a){var s=t.pingCache;if(s===null){s=t.pingCache=new _S;var u=new Set;s.set(n,u)}else u=s.get(n),u===void 0&&(u=new Set,s.set(n,u));u.has(a)||(of=!0,u.add(a),t=MS.bind(null,t,n,a),n.then(t,t))}function MS(t,n,a){var s=t.pingCache;s!==null&&s.delete(n),t.pingedLanes|=t.suspendedLanes&a,t.warmLanes&=~a,Ve===t&&(me&a)===a&&(Je===4||Je===3&&(me&62914560)===me&&300>E()-bl?(we&2)===0&&jr(t,0):lf|=a,qr===me&&(qr=0)),Ci(t)}function vg(t,n){n===0&&(n=Oe()),t=Za(t,n),t!==null&&(gn(t,n),Ci(t))}function ES(t){var n=t.memoizedState,a=0;n!==null&&(a=n.retryLane),vg(t,a)}function TS(t,n){var a=0;switch(t.tag){case 31:case 13:var s=t.stateNode,u=t.memoizedState;u!==null&&(a=u.retryLane);break;case 19:s=t.stateNode;break;case 22:s=t.stateNode._retryCache;break;default:throw Error(r(314))}s!==null&&s.delete(n),vg(t,a)}function bS(t,n){return Yt(t,n)}var Ll=null,Kr=null,gf=!1,Nl=!1,_f=!1,ba=0;function Ci(t){t!==Kr&&t.next===null&&(Kr===null?Ll=Kr=t:Kr=Kr.next=t),Nl=!0,gf||(gf=!0,RS())}function co(t,n){if(!_f&&Nl){_f=!0;do for(var a=!1,s=Ll;s!==null;){if(t!==0){var u=s.pendingLanes;if(u===0)var f=0;else{var _=s.suspendedLanes,T=s.pingedLanes;f=(1<<31-Ft(42|t)+1)-1,f&=u&~(_&~T),f=f&201326741?f&201326741|1:f?f|2:0}f!==0&&(a=!0,Mg(s,f))}else f=me,f=gt(s,s===Ve?f:0,s.cancelPendingCommit!==null||s.timeoutHandle!==-1),(f&3)===0||Bt(s,f)||(a=!0,Mg(s,f));s=s.next}while(a);_f=!1}}function AS(){Sg()}function Sg(){Nl=gf=!1;var t=0;ba!==0&&BS()&&(t=ba);for(var n=E(),a=null,s=Ll;s!==null;){var u=s.next,f=xg(s,n);f===0?(s.next=null,a===null?Ll=u:a.next=u,u===null&&(Kr=a)):(a=s,(t!==0||(f&3)!==0)&&(Nl=!0)),s=u}cn!==0&&cn!==5||co(t),ba!==0&&(ba=0)}function xg(t,n){for(var a=t.suspendedLanes,s=t.pingedLanes,u=t.expirationTimes,f=t.pendingLanes&-62914561;0<f;){var _=31-Ft(f),T=1<<_,P=u[_];P===-1?((T&a)===0||(T&s)!==0)&&(u[_]=ne(T,n)):P<=n&&(t.expiredLanes|=T),f&=~T}if(n=Ve,a=me,a=gt(t,t===n?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),s=t.callbackNode,a===0||t===n&&(De===2||De===9)||t.cancelPendingCommit!==null)return s!==null&&s!==null&&ie(s),t.callbackNode=null,t.callbackPriority=0;if((a&3)===0||Bt(t,a)){if(n=a&-a,n===t.callbackPriority)return n;switch(s!==null&&ie(s),Mr(a)){case 2:case 8:a=_t;break;case 32:a=lt;break;case 268435456:a=Ct;break;default:a=lt}return s=yg.bind(null,t),a=Yt(a,s),t.callbackPriority=n,t.callbackNode=a,n}return s!==null&&s!==null&&ie(s),t.callbackPriority=2,t.callbackNode=null,2}function yg(t,n){if(cn!==0&&cn!==5)return t.callbackNode=null,t.callbackPriority=0,null;var a=t.callbackNode;if(Ul()&&t.callbackNode!==a)return null;var s=me;return s=gt(t,t===Ve?s:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),s===0?null:(ng(t,s,n),xg(t,E()),t.callbackNode!=null&&t.callbackNode===a?yg.bind(null,t):null)}function Mg(t,n){if(Ul())return null;ng(t,n,!0)}function RS(){FS(function(){(we&6)!==0?Yt(pt,AS):Sg()})}function vf(){if(ba===0){var t=zr;t===0&&(t=Dt,Dt<<=1,(Dt&261888)===0&&(Dt=256)),ba=t}return ba}function Eg(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Go(""+t)}function Tg(t,n){var a=n.ownerDocument.createElement("input");return a.name=n.name,a.value=n.value,t.id&&a.setAttribute("form",t.id),n.parentNode.insertBefore(a,n),t=new FormData(t),a.parentNode.removeChild(a),t}function CS(t,n,a,s,u){if(n==="submit"&&a&&a.stateNode===u){var f=Eg((u[_n]||null).action),_=s.submitter;_&&(n=(n=_[_n]||null)?Eg(n.formAction):_.getAttribute("formAction"),n!==null&&(f=n,_=null));var T=new Wo("action","action",null,s,u);t.push({event:T,listeners:[{instance:null,listener:function(){if(s.defaultPrevented){if(ba!==0){var P=_?Tg(u,_):new FormData(u);Bc(a,{pending:!0,data:P,method:u.method,action:f},null,P)}}else typeof f=="function"&&(T.preventDefault(),P=_?Tg(u,_):new FormData(u),Bc(a,{pending:!0,data:P,method:u.method,action:f},f,P))},currentTarget:u}]})}}for(var Sf=0;Sf<tc.length;Sf++){var xf=tc[Sf],wS=xf.toLowerCase(),DS=xf[0].toUpperCase()+xf.slice(1);di(wS,"on"+DS)}di(ep,"onAnimationEnd"),di(np,"onAnimationIteration"),di(ip,"onAnimationStart"),di("dblclick","onDoubleClick"),di("focusin","onFocus"),di("focusout","onBlur"),di(q0,"onTransitionRun"),di(Y0,"onTransitionStart"),di(j0,"onTransitionCancel"),di(ap,"onTransitionEnd"),Nt("onMouseEnter",["mouseout","mouseover"]),Nt("onMouseLeave",["mouseout","mouseover"]),Nt("onPointerEnter",["pointerout","pointerover"]),Nt("onPointerLeave",["pointerout","pointerover"]),zt("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),zt("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),zt("onBeforeInput",["compositionend","keypress","textInput","paste"]),zt("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),zt("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),zt("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var fo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),US=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(fo));function bg(t,n){n=(n&4)!==0;for(var a=0;a<t.length;a++){var s=t[a],u=s.event;s=s.listeners;t:{var f=void 0;if(n)for(var _=s.length-1;0<=_;_--){var T=s[_],P=T.instance,J=T.currentTarget;if(T=T.listener,P!==f&&u.isPropagationStopped())break t;f=T,u.currentTarget=J;try{f(u)}catch(ut){jo(ut)}u.currentTarget=null,f=P}else for(_=0;_<s.length;_++){if(T=s[_],P=T.instance,J=T.currentTarget,T=T.listener,P!==f&&u.isPropagationStopped())break t;f=T,u.currentTarget=J;try{f(u)}catch(ut){jo(ut)}u.currentTarget=null,f=P}}}}function he(t,n){var a=n[Us];a===void 0&&(a=n[Us]=new Set);var s=t+"__bubble";a.has(s)||(Ag(n,t,2,!1),a.add(s))}function yf(t,n,a){var s=0;n&&(s|=4),Ag(a,t,s,n)}var Ol="_reactListening"+Math.random().toString(36).slice(2);function Mf(t){if(!t[Ol]){t[Ol]=!0,bt.forEach(function(a){a!=="selectionchange"&&(US.has(a)||yf(a,!1,t),yf(a,!0,t))});var n=t.nodeType===9?t:t.ownerDocument;n===null||n[Ol]||(n[Ol]=!0,yf("selectionchange",!1,n))}}function Ag(t,n,a,s){switch(e_(n)){case 2:var u=rx;break;case 8:u=sx;break;default:u=Bf}a=u.bind(null,n,a,t),u=void 0,!Gu||n!=="touchstart"&&n!=="touchmove"&&n!=="wheel"||(u=!0),s?u!==void 0?t.addEventListener(n,a,{capture:!0,passive:u}):t.addEventListener(n,a,!0):u!==void 0?t.addEventListener(n,a,{passive:u}):t.addEventListener(n,a,!1)}function Ef(t,n,a,s,u){var f=s;if((n&1)===0&&(n&2)===0&&s!==null)t:for(;;){if(s===null)return;var _=s.tag;if(_===3||_===4){var T=s.stateNode.containerInfo;if(T===u)break;if(_===4)for(_=s.return;_!==null;){var P=_.tag;if((P===3||P===4)&&_.stateNode.containerInfo===u)return;_=_.return}for(;T!==null;){if(_=A(T),_===null)return;if(P=_.tag,P===5||P===6||P===26||P===27){s=f=_;continue t}T=T.parentNode}}s=s.return}Ud(function(){var J=f,ut=Fu(a),mt=[];t:{var tt=rp.get(t);if(tt!==void 0){var ot=Wo,It=t;switch(t){case"keypress":if(Xo(a)===0)break t;case"keydown":case"keyup":ot=T0;break;case"focusin":It="focus",ot=Wu;break;case"focusout":It="blur",ot=Wu;break;case"beforeblur":case"afterblur":ot=Wu;break;case"click":if(a.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":ot=Od;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":ot=h0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":ot=R0;break;case ep:case np:case ip:ot=m0;break;case ap:ot=w0;break;case"scroll":case"scrollend":ot=c0;break;case"wheel":ot=U0;break;case"copy":case"cut":case"paste":ot=_0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":ot=Pd;break;case"toggle":case"beforetoggle":ot=N0}var Jt=(n&4)!==0,Ie=!Jt&&(t==="scroll"||t==="scrollend"),Y=Jt?tt!==null?tt+"Capture":null:tt;Jt=[];for(var G=J,Q;G!==null;){var ht=G;if(Q=ht.stateNode,ht=ht.tag,ht!==5&&ht!==26&&ht!==27||Q===null||Y===null||(ht=Ns(G,Y),ht!=null&&Jt.push(ho(G,ht,Q))),Ie)break;G=G.return}0<Jt.length&&(tt=new ot(tt,It,null,a,ut),mt.push({event:tt,listeners:Jt}))}}if((n&7)===0){t:{if(tt=t==="mouseover"||t==="pointerover",ot=t==="mouseout"||t==="pointerout",tt&&a!==Iu&&(It=a.relatedTarget||a.fromElement)&&(A(It)||It[Oi]))break t;if((ot||tt)&&(tt=ut.window===ut?ut:(tt=ut.ownerDocument)?tt.defaultView||tt.parentWindow:window,ot?(It=a.relatedTarget||a.toElement,ot=J,It=It?A(It):null,It!==null&&(Ie=c(It),Jt=It.tag,It!==Ie||Jt!==5&&Jt!==27&&Jt!==6)&&(It=null)):(ot=null,It=J),ot!==It)){if(Jt=Od,ht="onMouseLeave",Y="onMouseEnter",G="mouse",(t==="pointerout"||t==="pointerover")&&(Jt=Pd,ht="onPointerLeave",Y="onPointerEnter",G="pointer"),Ie=ot==null?tt:it(ot),Q=It==null?tt:it(It),tt=new Jt(ht,G+"leave",ot,a,ut),tt.target=Ie,tt.relatedTarget=Q,ht=null,A(ut)===J&&(Jt=new Jt(Y,G+"enter",It,a,ut),Jt.target=Q,Jt.relatedTarget=Ie,ht=Jt),Ie=ht,ot&&It)e:{for(Jt=LS,Y=ot,G=It,Q=0,ht=Y;ht;ht=Jt(ht))Q++;ht=0;for(var jt=G;jt;jt=Jt(jt))ht++;for(;0<Q-ht;)Y=Jt(Y),Q--;for(;0<ht-Q;)G=Jt(G),ht--;for(;Q--;){if(Y===G||G!==null&&Y===G.alternate){Jt=Y;break e}Y=Jt(Y),G=Jt(G)}Jt=null}else Jt=null;ot!==null&&Rg(mt,tt,ot,Jt,!1),It!==null&&Ie!==null&&Rg(mt,Ie,It,Jt,!0)}}t:{if(tt=J?it(J):window,ot=tt.nodeName&&tt.nodeName.toLowerCase(),ot==="select"||ot==="input"&&tt.type==="file")var be=kd;else if(Vd(tt))if(Wd)be=X0;else{be=G0;var Gt=H0}else ot=tt.nodeName,!ot||ot.toLowerCase()!=="input"||tt.type!=="checkbox"&&tt.type!=="radio"?J&&Bu(J.elementType)&&(be=kd):be=V0;if(be&&(be=be(t,J))){Xd(mt,be,a,ut);break t}Gt&&Gt(t,tt,J),t==="focusout"&&J&&tt.type==="number"&&J.memoizedProps.value!=null&&An(tt,"number",tt.value)}switch(Gt=J?it(J):window,t){case"focusin":(Vd(Gt)||Gt.contentEditable==="true")&&(Rr=Gt,Qu=J,Gs=null);break;case"focusout":Gs=Qu=Rr=null;break;case"mousedown":Ju=!0;break;case"contextmenu":case"mouseup":case"dragend":Ju=!1,$d(mt,a,ut);break;case"selectionchange":if(W0)break;case"keydown":case"keyup":$d(mt,a,ut)}var se;if(Yu)t:{switch(t){case"compositionstart":var ge="onCompositionStart";break t;case"compositionend":ge="onCompositionEnd";break t;case"compositionupdate":ge="onCompositionUpdate";break t}ge=void 0}else Ar?Hd(t,a)&&(ge="onCompositionEnd"):t==="keydown"&&a.keyCode===229&&(ge="onCompositionStart");ge&&(Bd&&a.locale!=="ko"&&(Ar||ge!=="onCompositionStart"?ge==="onCompositionEnd"&&Ar&&(se=Ld()):(ua=ut,Vu="value"in ua?ua.value:ua.textContent,Ar=!0)),Gt=zl(J,ge),0<Gt.length&&(ge=new zd(ge,t,null,a,ut),mt.push({event:ge,listeners:Gt}),se?ge.data=se:(se=Gd(a),se!==null&&(ge.data=se)))),(se=z0?P0(t,a):B0(t,a))&&(ge=zl(J,"onBeforeInput"),0<ge.length&&(Gt=new zd("onBeforeInput","beforeinput",null,a,ut),mt.push({event:Gt,listeners:ge}),Gt.data=se)),CS(mt,t,J,a,ut)}bg(mt,n)})}function ho(t,n,a){return{instance:t,listener:n,currentTarget:a}}function zl(t,n){for(var a=n+"Capture",s=[];t!==null;){var u=t,f=u.stateNode;if(u=u.tag,u!==5&&u!==26&&u!==27||f===null||(u=Ns(t,a),u!=null&&s.unshift(ho(t,u,f)),u=Ns(t,n),u!=null&&s.push(ho(t,u,f))),t.tag===3)return s;t=t.return}return[]}function LS(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function Rg(t,n,a,s,u){for(var f=n._reactName,_=[];a!==null&&a!==s;){var T=a,P=T.alternate,J=T.stateNode;if(T=T.tag,P!==null&&P===s)break;T!==5&&T!==26&&T!==27||J===null||(P=J,u?(J=Ns(a,f),J!=null&&_.unshift(ho(a,J,P))):u||(J=Ns(a,f),J!=null&&_.push(ho(a,J,P)))),a=a.return}_.length!==0&&t.push({event:n,listeners:_})}var NS=/\r\n?/g,OS=/\u0000|\uFFFD/g;function Cg(t){return(typeof t=="string"?t:""+t).replace(NS,`
`).replace(OS,"")}function wg(t,n){return n=Cg(n),Cg(t)===n}function Be(t,n,a,s,u,f){switch(a){case"children":typeof s=="string"?n==="body"||n==="textarea"&&s===""||On(t,s):(typeof s=="number"||typeof s=="bigint")&&n!=="body"&&On(t,""+s);break;case"className":Ge(t,"class",s);break;case"tabIndex":Ge(t,"tabindex",s);break;case"dir":case"role":case"viewBox":case"width":case"height":Ge(t,a,s);break;case"style":wd(t,s,f);break;case"data":if(n!=="object"){Ge(t,"data",s);break}case"src":case"href":if(s===""&&(n!=="a"||a!=="href")){t.removeAttribute(a);break}if(s==null||typeof s=="function"||typeof s=="symbol"||typeof s=="boolean"){t.removeAttribute(a);break}s=Go(""+s),t.setAttribute(a,s);break;case"action":case"formAction":if(typeof s=="function"){t.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof f=="function"&&(a==="formAction"?(n!=="input"&&Be(t,n,"name",u.name,u,null),Be(t,n,"formEncType",u.formEncType,u,null),Be(t,n,"formMethod",u.formMethod,u,null),Be(t,n,"formTarget",u.formTarget,u,null)):(Be(t,n,"encType",u.encType,u,null),Be(t,n,"method",u.method,u,null),Be(t,n,"target",u.target,u,null)));if(s==null||typeof s=="symbol"||typeof s=="boolean"){t.removeAttribute(a);break}s=Go(""+s),t.setAttribute(a,s);break;case"onClick":s!=null&&(t.onclick=zi);break;case"onScroll":s!=null&&he("scroll",t);break;case"onScrollEnd":s!=null&&he("scrollend",t);break;case"dangerouslySetInnerHTML":if(s!=null){if(typeof s!="object"||!("__html"in s))throw Error(r(61));if(a=s.__html,a!=null){if(u.children!=null)throw Error(r(60));t.innerHTML=a}}break;case"multiple":t.multiple=s&&typeof s!="function"&&typeof s!="symbol";break;case"muted":t.muted=s&&typeof s!="function"&&typeof s!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(s==null||typeof s=="function"||typeof s=="boolean"||typeof s=="symbol"){t.removeAttribute("xlink:href");break}a=Go(""+s),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":s!=null&&typeof s!="function"&&typeof s!="symbol"?t.setAttribute(a,""+s):t.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":s&&typeof s!="function"&&typeof s!="symbol"?t.setAttribute(a,""):t.removeAttribute(a);break;case"capture":case"download":s===!0?t.setAttribute(a,""):s!==!1&&s!=null&&typeof s!="function"&&typeof s!="symbol"?t.setAttribute(a,s):t.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":s!=null&&typeof s!="function"&&typeof s!="symbol"&&!isNaN(s)&&1<=s?t.setAttribute(a,s):t.removeAttribute(a);break;case"rowSpan":case"start":s==null||typeof s=="function"||typeof s=="symbol"||isNaN(s)?t.removeAttribute(a):t.setAttribute(a,s);break;case"popover":he("beforetoggle",t),he("toggle",t),Te(t,"popover",s);break;case"xlinkActuate":ve(t,"http://www.w3.org/1999/xlink","xlink:actuate",s);break;case"xlinkArcrole":ve(t,"http://www.w3.org/1999/xlink","xlink:arcrole",s);break;case"xlinkRole":ve(t,"http://www.w3.org/1999/xlink","xlink:role",s);break;case"xlinkShow":ve(t,"http://www.w3.org/1999/xlink","xlink:show",s);break;case"xlinkTitle":ve(t,"http://www.w3.org/1999/xlink","xlink:title",s);break;case"xlinkType":ve(t,"http://www.w3.org/1999/xlink","xlink:type",s);break;case"xmlBase":ve(t,"http://www.w3.org/XML/1998/namespace","xml:base",s);break;case"xmlLang":ve(t,"http://www.w3.org/XML/1998/namespace","xml:lang",s);break;case"xmlSpace":ve(t,"http://www.w3.org/XML/1998/namespace","xml:space",s);break;case"is":Te(t,"is",s);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=l0.get(a)||a,Te(t,a,s))}}function Tf(t,n,a,s,u,f){switch(a){case"style":wd(t,s,f);break;case"dangerouslySetInnerHTML":if(s!=null){if(typeof s!="object"||!("__html"in s))throw Error(r(61));if(a=s.__html,a!=null){if(u.children!=null)throw Error(r(60));t.innerHTML=a}}break;case"children":typeof s=="string"?On(t,s):(typeof s=="number"||typeof s=="bigint")&&On(t,""+s);break;case"onScroll":s!=null&&he("scroll",t);break;case"onScrollEnd":s!=null&&he("scrollend",t);break;case"onClick":s!=null&&(t.onclick=zi);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Ut.hasOwnProperty(a))t:{if(a[0]==="o"&&a[1]==="n"&&(u=a.endsWith("Capture"),n=a.slice(2,u?a.length-7:void 0),f=t[_n]||null,f=f!=null?f[a]:null,typeof f=="function"&&t.removeEventListener(n,f,u),typeof s=="function")){typeof f!="function"&&f!==null&&(a in t?t[a]=null:t.hasAttribute(a)&&t.removeAttribute(a)),t.addEventListener(n,s,u);break t}a in t?t[a]=s:s===!0?t.setAttribute(a,""):Te(t,a,s)}}}function Mn(t,n,a){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":he("error",t),he("load",t);var s=!1,u=!1,f;for(f in a)if(a.hasOwnProperty(f)){var _=a[f];if(_!=null)switch(f){case"src":s=!0;break;case"srcSet":u=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(r(137,n));default:Be(t,n,f,_,a,null)}}u&&Be(t,n,"srcSet",a.srcSet,a,null),s&&Be(t,n,"src",a.src,a,null);return;case"input":he("invalid",t);var T=f=_=u=null,P=null,J=null;for(s in a)if(a.hasOwnProperty(s)){var ut=a[s];if(ut!=null)switch(s){case"name":u=ut;break;case"type":_=ut;break;case"checked":P=ut;break;case"defaultChecked":J=ut;break;case"value":f=ut;break;case"defaultValue":T=ut;break;case"children":case"dangerouslySetInnerHTML":if(ut!=null)throw Error(r(137,n));break;default:Be(t,n,s,ut,a,null)}}Un(t,f,T,P,J,_,u,!1);return;case"select":he("invalid",t),s=_=f=null;for(u in a)if(a.hasOwnProperty(u)&&(T=a[u],T!=null))switch(u){case"value":f=T;break;case"defaultValue":_=T;break;case"multiple":s=T;default:Be(t,n,u,T,a,null)}n=f,a=_,t.multiple=!!s,n!=null?Ke(t,!!s,n,!1):a!=null&&Ke(t,!!s,a,!0);return;case"textarea":he("invalid",t),f=u=s=null;for(_ in a)if(a.hasOwnProperty(_)&&(T=a[_],T!=null))switch(_){case"value":s=T;break;case"defaultValue":u=T;break;case"children":f=T;break;case"dangerouslySetInnerHTML":if(T!=null)throw Error(r(91));break;default:Be(t,n,_,T,a,null)}Er(t,s,u,f);return;case"option":for(P in a)a.hasOwnProperty(P)&&(s=a[P],s!=null)&&(P==="selected"?t.selected=s&&typeof s!="function"&&typeof s!="symbol":Be(t,n,P,s,a,null));return;case"dialog":he("beforetoggle",t),he("toggle",t),he("cancel",t),he("close",t);break;case"iframe":case"object":he("load",t);break;case"video":case"audio":for(s=0;s<fo.length;s++)he(fo[s],t);break;case"image":he("error",t),he("load",t);break;case"details":he("toggle",t);break;case"embed":case"source":case"link":he("error",t),he("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(J in a)if(a.hasOwnProperty(J)&&(s=a[J],s!=null))switch(J){case"children":case"dangerouslySetInnerHTML":throw Error(r(137,n));default:Be(t,n,J,s,a,null)}return;default:if(Bu(n)){for(ut in a)a.hasOwnProperty(ut)&&(s=a[ut],s!==void 0&&Tf(t,n,ut,s,a,void 0));return}}for(T in a)a.hasOwnProperty(T)&&(s=a[T],s!=null&&Be(t,n,T,s,a,null))}function zS(t,n,a,s){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var u=null,f=null,_=null,T=null,P=null,J=null,ut=null;for(ot in a){var mt=a[ot];if(a.hasOwnProperty(ot)&&mt!=null)switch(ot){case"checked":break;case"value":break;case"defaultValue":P=mt;default:s.hasOwnProperty(ot)||Be(t,n,ot,null,s,mt)}}for(var tt in s){var ot=s[tt];if(mt=a[tt],s.hasOwnProperty(tt)&&(ot!=null||mt!=null))switch(tt){case"type":f=ot;break;case"name":u=ot;break;case"checked":J=ot;break;case"defaultChecked":ut=ot;break;case"value":_=ot;break;case"defaultValue":T=ot;break;case"children":case"dangerouslySetInnerHTML":if(ot!=null)throw Error(r(137,n));break;default:ot!==mt&&Be(t,n,tt,ot,s,mt)}}ze(t,_,T,P,J,ut,f,u);return;case"select":ot=_=T=tt=null;for(f in a)if(P=a[f],a.hasOwnProperty(f)&&P!=null)switch(f){case"value":break;case"multiple":ot=P;default:s.hasOwnProperty(f)||Be(t,n,f,null,s,P)}for(u in s)if(f=s[u],P=a[u],s.hasOwnProperty(u)&&(f!=null||P!=null))switch(u){case"value":tt=f;break;case"defaultValue":T=f;break;case"multiple":_=f;default:f!==P&&Be(t,n,u,f,s,P)}n=T,a=_,s=ot,tt!=null?Ke(t,!!a,tt,!1):!!s!=!!a&&(n!=null?Ke(t,!!a,n,!0):Ke(t,!!a,a?[]:"",!1));return;case"textarea":ot=tt=null;for(T in a)if(u=a[T],a.hasOwnProperty(T)&&u!=null&&!s.hasOwnProperty(T))switch(T){case"value":break;case"children":break;default:Be(t,n,T,null,s,u)}for(_ in s)if(u=s[_],f=a[_],s.hasOwnProperty(_)&&(u!=null||f!=null))switch(_){case"value":tt=u;break;case"defaultValue":ot=u;break;case"children":break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(r(91));break;default:u!==f&&Be(t,n,_,u,s,f)}vn(t,tt,ot);return;case"option":for(var It in a)tt=a[It],a.hasOwnProperty(It)&&tt!=null&&!s.hasOwnProperty(It)&&(It==="selected"?t.selected=!1:Be(t,n,It,null,s,tt));for(P in s)tt=s[P],ot=a[P],s.hasOwnProperty(P)&&tt!==ot&&(tt!=null||ot!=null)&&(P==="selected"?t.selected=tt&&typeof tt!="function"&&typeof tt!="symbol":Be(t,n,P,tt,s,ot));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var Jt in a)tt=a[Jt],a.hasOwnProperty(Jt)&&tt!=null&&!s.hasOwnProperty(Jt)&&Be(t,n,Jt,null,s,tt);for(J in s)if(tt=s[J],ot=a[J],s.hasOwnProperty(J)&&tt!==ot&&(tt!=null||ot!=null))switch(J){case"children":case"dangerouslySetInnerHTML":if(tt!=null)throw Error(r(137,n));break;default:Be(t,n,J,tt,s,ot)}return;default:if(Bu(n)){for(var Ie in a)tt=a[Ie],a.hasOwnProperty(Ie)&&tt!==void 0&&!s.hasOwnProperty(Ie)&&Tf(t,n,Ie,void 0,s,tt);for(ut in s)tt=s[ut],ot=a[ut],!s.hasOwnProperty(ut)||tt===ot||tt===void 0&&ot===void 0||Tf(t,n,ut,tt,s,ot);return}}for(var Y in a)tt=a[Y],a.hasOwnProperty(Y)&&tt!=null&&!s.hasOwnProperty(Y)&&Be(t,n,Y,null,s,tt);for(mt in s)tt=s[mt],ot=a[mt],!s.hasOwnProperty(mt)||tt===ot||tt==null&&ot==null||Be(t,n,mt,tt,s,ot)}function Dg(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function PS(){if(typeof performance.getEntriesByType=="function"){for(var t=0,n=0,a=performance.getEntriesByType("resource"),s=0;s<a.length;s++){var u=a[s],f=u.transferSize,_=u.initiatorType,T=u.duration;if(f&&T&&Dg(_)){for(_=0,T=u.responseEnd,s+=1;s<a.length;s++){var P=a[s],J=P.startTime;if(J>T)break;var ut=P.transferSize,mt=P.initiatorType;ut&&Dg(mt)&&(P=P.responseEnd,_+=ut*(P<T?1:(T-J)/(P-J)))}if(--s,n+=8*(f+_)/(u.duration/1e3),t++,10<t)break}}if(0<t)return n/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var bf=null,Af=null;function Pl(t){return t.nodeType===9?t:t.ownerDocument}function Ug(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Lg(t,n){if(t===0)switch(n){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&n==="foreignObject"?0:t}function Rf(t,n){return t==="textarea"||t==="noscript"||typeof n.children=="string"||typeof n.children=="number"||typeof n.children=="bigint"||typeof n.dangerouslySetInnerHTML=="object"&&n.dangerouslySetInnerHTML!==null&&n.dangerouslySetInnerHTML.__html!=null}var Cf=null;function BS(){var t=window.event;return t&&t.type==="popstate"?t===Cf?!1:(Cf=t,!0):(Cf=null,!1)}var Ng=typeof setTimeout=="function"?setTimeout:void 0,IS=typeof clearTimeout=="function"?clearTimeout:void 0,Og=typeof Promise=="function"?Promise:void 0,FS=typeof queueMicrotask=="function"?queueMicrotask:typeof Og<"u"?function(t){return Og.resolve(null).then(t).catch(HS)}:Ng;function HS(t){setTimeout(function(){throw t})}function Aa(t){return t==="head"}function zg(t,n){var a=n,s=0;do{var u=a.nextSibling;if(t.removeChild(a),u&&u.nodeType===8)if(a=u.data,a==="/$"||a==="/&"){if(s===0){t.removeChild(u),ts(n);return}s--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")s++;else if(a==="html")po(t.ownerDocument.documentElement);else if(a==="head"){a=t.ownerDocument.head,po(a);for(var f=a.firstChild;f;){var _=f.nextSibling,T=f.nodeName;f[Wa]||T==="SCRIPT"||T==="STYLE"||T==="LINK"&&f.rel.toLowerCase()==="stylesheet"||a.removeChild(f),f=_}}else a==="body"&&po(t.ownerDocument.body);a=u}while(a);ts(n)}function Pg(t,n){var a=t;t=0;do{var s=a.nextSibling;if(a.nodeType===1?n?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(n?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),s&&s.nodeType===8)if(a=s.data,a==="/$"){if(t===0)break;t--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||t++;a=s}while(a)}function wf(t){var n=t.firstChild;for(n&&n.nodeType===10&&(n=n.nextSibling);n;){var a=n;switch(n=n.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":wf(a),Ls(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}t.removeChild(a)}}function GS(t,n,a,s){for(;t.nodeType===1;){var u=a;if(t.nodeName.toLowerCase()!==n.toLowerCase()){if(!s&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(s){if(!t[Wa])switch(n){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(f=t.getAttribute("rel"),f==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(f!==u.rel||t.getAttribute("href")!==(u.href==null||u.href===""?null:u.href)||t.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin)||t.getAttribute("title")!==(u.title==null?null:u.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(f=t.getAttribute("src"),(f!==(u.src==null?null:u.src)||t.getAttribute("type")!==(u.type==null?null:u.type)||t.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin))&&f&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(n==="input"&&t.type==="hidden"){var f=u.name==null?null:""+u.name;if(u.type==="hidden"&&t.getAttribute("name")===f)return t}else return t;if(t=si(t.nextSibling),t===null)break}return null}function VS(t,n,a){if(n==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!a||(t=si(t.nextSibling),t===null))return null;return t}function Bg(t,n){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=si(t.nextSibling),t===null))return null;return t}function Df(t){return t.data==="$?"||t.data==="$~"}function Uf(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function XS(t,n){var a=t.ownerDocument;if(t.data==="$~")t._reactRetry=n;else if(t.data!=="$?"||a.readyState!=="loading")n();else{var s=function(){n(),a.removeEventListener("DOMContentLoaded",s)};a.addEventListener("DOMContentLoaded",s),t._reactRetry=s}}function si(t){for(;t!=null;t=t.nextSibling){var n=t.nodeType;if(n===1||n===3)break;if(n===8){if(n=t.data,n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"||n==="F!"||n==="F")break;if(n==="/$"||n==="/&")return null}}return t}var Lf=null;function Ig(t){t=t.nextSibling;for(var n=0;t;){if(t.nodeType===8){var a=t.data;if(a==="/$"||a==="/&"){if(n===0)return si(t.nextSibling);n--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||n++}t=t.nextSibling}return null}function Fg(t){t=t.previousSibling;for(var n=0;t;){if(t.nodeType===8){var a=t.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(n===0)return t;n--}else a!=="/$"&&a!=="/&"||n++}t=t.previousSibling}return null}function Hg(t,n,a){switch(n=Pl(a),t){case"html":if(t=n.documentElement,!t)throw Error(r(452));return t;case"head":if(t=n.head,!t)throw Error(r(453));return t;case"body":if(t=n.body,!t)throw Error(r(454));return t;default:throw Error(r(451))}}function po(t){for(var n=t.attributes;n.length;)t.removeAttributeNode(n[0]);Ls(t)}var oi=new Map,Gg=new Set;function Bl(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var Qi=K.d;K.d={f:kS,r:WS,D:qS,C:YS,L:jS,m:ZS,X:QS,S:KS,M:JS};function kS(){var t=Qi.f(),n=Cl();return t||n}function WS(t){var n=q(t);n!==null&&n.tag===5&&n.type==="form"?am(n):Qi.r(t)}var Qr=typeof document>"u"?null:document;function Vg(t,n,a){var s=Qr;if(s&&typeof n=="string"&&n){var u=dn(n);u='link[rel="'+t+'"][href="'+u+'"]',typeof a=="string"&&(u+='[crossorigin="'+a+'"]'),Gg.has(u)||(Gg.add(u),t={rel:t,crossOrigin:a,href:n},s.querySelector(u)===null&&(n=s.createElement("link"),Mn(n,"link",t),X(n),s.head.appendChild(n)))}}function qS(t){Qi.D(t),Vg("dns-prefetch",t,null)}function YS(t,n){Qi.C(t,n),Vg("preconnect",t,n)}function jS(t,n,a){Qi.L(t,n,a);var s=Qr;if(s&&t&&n){var u='link[rel="preload"][as="'+dn(n)+'"]';n==="image"&&a&&a.imageSrcSet?(u+='[imagesrcset="'+dn(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(u+='[imagesizes="'+dn(a.imageSizes)+'"]')):u+='[href="'+dn(t)+'"]';var f=u;switch(n){case"style":f=Jr(t);break;case"script":f=$r(t)}oi.has(f)||(t=S({rel:"preload",href:n==="image"&&a&&a.imageSrcSet?void 0:t,as:n},a),oi.set(f,t),s.querySelector(u)!==null||n==="style"&&s.querySelector(mo(f))||n==="script"&&s.querySelector(go(f))||(n=s.createElement("link"),Mn(n,"link",t),X(n),s.head.appendChild(n)))}}function ZS(t,n){Qi.m(t,n);var a=Qr;if(a&&t){var s=n&&typeof n.as=="string"?n.as:"script",u='link[rel="modulepreload"][as="'+dn(s)+'"][href="'+dn(t)+'"]',f=u;switch(s){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":f=$r(t)}if(!oi.has(f)&&(t=S({rel:"modulepreload",href:t},n),oi.set(f,t),a.querySelector(u)===null)){switch(s){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(go(f)))return}s=a.createElement("link"),Mn(s,"link",t),X(s),a.head.appendChild(s)}}}function KS(t,n,a){Qi.S(t,n,a);var s=Qr;if(s&&t){var u=rt(s).hoistableStyles,f=Jr(t);n=n||"default";var _=u.get(f);if(!_){var T={loading:0,preload:null};if(_=s.querySelector(mo(f)))T.loading=5;else{t=S({rel:"stylesheet",href:t,"data-precedence":n},a),(a=oi.get(f))&&Nf(t,a);var P=_=s.createElement("link");X(P),Mn(P,"link",t),P._p=new Promise(function(J,ut){P.onload=J,P.onerror=ut}),P.addEventListener("load",function(){T.loading|=1}),P.addEventListener("error",function(){T.loading|=2}),T.loading|=4,Il(_,n,s)}_={type:"stylesheet",instance:_,count:1,state:T},u.set(f,_)}}}function QS(t,n){Qi.X(t,n);var a=Qr;if(a&&t){var s=rt(a).hoistableScripts,u=$r(t),f=s.get(u);f||(f=a.querySelector(go(u)),f||(t=S({src:t,async:!0},n),(n=oi.get(u))&&Of(t,n),f=a.createElement("script"),X(f),Mn(f,"link",t),a.head.appendChild(f)),f={type:"script",instance:f,count:1,state:null},s.set(u,f))}}function JS(t,n){Qi.M(t,n);var a=Qr;if(a&&t){var s=rt(a).hoistableScripts,u=$r(t),f=s.get(u);f||(f=a.querySelector(go(u)),f||(t=S({src:t,async:!0,type:"module"},n),(n=oi.get(u))&&Of(t,n),f=a.createElement("script"),X(f),Mn(f,"link",t),a.head.appendChild(f)),f={type:"script",instance:f,count:1,state:null},s.set(u,f))}}function Xg(t,n,a,s){var u=(u=Tt.current)?Bl(u):null;if(!u)throw Error(r(446));switch(t){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(n=Jr(a.href),a=rt(u).hoistableStyles,s=a.get(n),s||(s={type:"style",instance:null,count:0,state:null},a.set(n,s)),s):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){t=Jr(a.href);var f=rt(u).hoistableStyles,_=f.get(t);if(_||(u=u.ownerDocument||u,_={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},f.set(t,_),(f=u.querySelector(mo(t)))&&!f._p&&(_.instance=f,_.state.loading=5),oi.has(t)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},oi.set(t,a),f||$S(u,t,a,_.state))),n&&s===null)throw Error(r(528,""));return _}if(n&&s!==null)throw Error(r(529,""));return null;case"script":return n=a.async,a=a.src,typeof a=="string"&&n&&typeof n!="function"&&typeof n!="symbol"?(n=$r(a),a=rt(u).hoistableScripts,s=a.get(n),s||(s={type:"script",instance:null,count:0,state:null},a.set(n,s)),s):{type:"void",instance:null,count:0,state:null};default:throw Error(r(444,t))}}function Jr(t){return'href="'+dn(t)+'"'}function mo(t){return'link[rel="stylesheet"]['+t+"]"}function kg(t){return S({},t,{"data-precedence":t.precedence,precedence:null})}function $S(t,n,a,s){t.querySelector('link[rel="preload"][as="style"]['+n+"]")?s.loading=1:(n=t.createElement("link"),s.preload=n,n.addEventListener("load",function(){return s.loading|=1}),n.addEventListener("error",function(){return s.loading|=2}),Mn(n,"link",a),X(n),t.head.appendChild(n))}function $r(t){return'[src="'+dn(t)+'"]'}function go(t){return"script[async]"+t}function Wg(t,n,a){if(n.count++,n.instance===null)switch(n.type){case"style":var s=t.querySelector('style[data-href~="'+dn(a.href)+'"]');if(s)return n.instance=s,X(s),s;var u=S({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return s=(t.ownerDocument||t).createElement("style"),X(s),Mn(s,"style",u),Il(s,a.precedence,t),n.instance=s;case"stylesheet":u=Jr(a.href);var f=t.querySelector(mo(u));if(f)return n.state.loading|=4,n.instance=f,X(f),f;s=kg(a),(u=oi.get(u))&&Nf(s,u),f=(t.ownerDocument||t).createElement("link"),X(f);var _=f;return _._p=new Promise(function(T,P){_.onload=T,_.onerror=P}),Mn(f,"link",s),n.state.loading|=4,Il(f,a.precedence,t),n.instance=f;case"script":return f=$r(a.src),(u=t.querySelector(go(f)))?(n.instance=u,X(u),u):(s=a,(u=oi.get(f))&&(s=S({},a),Of(s,u)),t=t.ownerDocument||t,u=t.createElement("script"),X(u),Mn(u,"link",s),t.head.appendChild(u),n.instance=u);case"void":return null;default:throw Error(r(443,n.type))}else n.type==="stylesheet"&&(n.state.loading&4)===0&&(s=n.instance,n.state.loading|=4,Il(s,a.precedence,t));return n.instance}function Il(t,n,a){for(var s=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),u=s.length?s[s.length-1]:null,f=u,_=0;_<s.length;_++){var T=s[_];if(T.dataset.precedence===n)f=T;else if(f!==u)break}f?f.parentNode.insertBefore(t,f.nextSibling):(n=a.nodeType===9?a.head:a,n.insertBefore(t,n.firstChild))}function Nf(t,n){t.crossOrigin==null&&(t.crossOrigin=n.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=n.referrerPolicy),t.title==null&&(t.title=n.title)}function Of(t,n){t.crossOrigin==null&&(t.crossOrigin=n.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=n.referrerPolicy),t.integrity==null&&(t.integrity=n.integrity)}var Fl=null;function qg(t,n,a){if(Fl===null){var s=new Map,u=Fl=new Map;u.set(a,s)}else u=Fl,s=u.get(a),s||(s=new Map,u.set(a,s));if(s.has(t))return s;for(s.set(t,null),a=a.getElementsByTagName(t),u=0;u<a.length;u++){var f=a[u];if(!(f[Wa]||f[Ze]||t==="link"&&f.getAttribute("rel")==="stylesheet")&&f.namespaceURI!=="http://www.w3.org/2000/svg"){var _=f.getAttribute(n)||"";_=t+_;var T=s.get(_);T?T.push(f):s.set(_,[f])}}return s}function Yg(t,n,a){t=t.ownerDocument||t,t.head.insertBefore(a,n==="title"?t.querySelector("head > title"):null)}function tx(t,n,a){if(a===1||n.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof n.precedence!="string"||typeof n.href!="string"||n.href==="")break;return!0;case"link":if(typeof n.rel!="string"||typeof n.href!="string"||n.href===""||n.onLoad||n.onError)break;return n.rel==="stylesheet"?(t=n.disabled,typeof n.precedence=="string"&&t==null):!0;case"script":if(n.async&&typeof n.async!="function"&&typeof n.async!="symbol"&&!n.onLoad&&!n.onError&&n.src&&typeof n.src=="string")return!0}return!1}function jg(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function ex(t,n,a,s){if(a.type==="stylesheet"&&(typeof s.media!="string"||matchMedia(s.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var u=Jr(s.href),f=n.querySelector(mo(u));if(f){n=f._p,n!==null&&typeof n=="object"&&typeof n.then=="function"&&(t.count++,t=Hl.bind(t),n.then(t,t)),a.state.loading|=4,a.instance=f,X(f);return}f=n.ownerDocument||n,s=kg(s),(u=oi.get(u))&&Nf(s,u),f=f.createElement("link"),X(f);var _=f;_._p=new Promise(function(T,P){_.onload=T,_.onerror=P}),Mn(f,"link",s),a.instance=f}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(a,n),(n=a.state.preload)&&(a.state.loading&3)===0&&(t.count++,a=Hl.bind(t),n.addEventListener("load",a),n.addEventListener("error",a))}}var zf=0;function nx(t,n){return t.stylesheets&&t.count===0&&Vl(t,t.stylesheets),0<t.count||0<t.imgCount?function(a){var s=setTimeout(function(){if(t.stylesheets&&Vl(t,t.stylesheets),t.unsuspend){var f=t.unsuspend;t.unsuspend=null,f()}},6e4+n);0<t.imgBytes&&zf===0&&(zf=62500*PS());var u=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Vl(t,t.stylesheets),t.unsuspend)){var f=t.unsuspend;t.unsuspend=null,f()}},(t.imgBytes>zf?50:800)+n);return t.unsuspend=a,function(){t.unsuspend=null,clearTimeout(s),clearTimeout(u)}}:null}function Hl(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Vl(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Gl=null;function Vl(t,n){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Gl=new Map,n.forEach(ix,t),Gl=null,Hl.call(t))}function ix(t,n){if(!(n.state.loading&4)){var a=Gl.get(t);if(a)var s=a.get(null);else{a=new Map,Gl.set(t,a);for(var u=t.querySelectorAll("link[data-precedence],style[data-precedence]"),f=0;f<u.length;f++){var _=u[f];(_.nodeName==="LINK"||_.getAttribute("media")!=="not all")&&(a.set(_.dataset.precedence,_),s=_)}s&&a.set(null,s)}u=n.instance,_=u.getAttribute("data-precedence"),f=a.get(_)||s,f===s&&a.set(null,u),a.set(_,u),this.count++,s=Hl.bind(this),u.addEventListener("load",s),u.addEventListener("error",s),f?f.parentNode.insertBefore(u,f.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(u,t.firstChild)),n.state.loading|=4}}var _o={$$typeof:N,Provider:null,Consumer:null,_currentValue:Z,_currentValue2:Z,_threadCount:0};function ax(t,n,a,s,u,f,_,T,P){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Ee(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ee(0),this.hiddenUpdates=Ee(null),this.identifierPrefix=s,this.onUncaughtError=u,this.onCaughtError=f,this.onRecoverableError=_,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=P,this.incompleteTransitions=new Map}function Zg(t,n,a,s,u,f,_,T,P,J,ut,mt){return t=new ax(t,n,a,_,P,J,ut,mt,T),n=1,f===!0&&(n|=24),f=Wn(3,null,null,n),t.current=f,f.stateNode=t,n=dc(),n.refCount++,t.pooledCache=n,n.refCount++,f.memoizedState={element:s,isDehydrated:a,cache:n},_c(f),t}function Kg(t){return t?(t=Dr,t):Dr}function Qg(t,n,a,s,u,f){u=Kg(u),s.context===null?s.context=u:s.pendingContext=u,s=ma(n),s.payload={element:a},f=f===void 0?null:f,f!==null&&(s.callback=f),a=ga(t,s,n),a!==null&&(Hn(a,t,n),js(a,t,n))}function Jg(t,n){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var a=t.retryLane;t.retryLane=a!==0&&a<n?a:n}}function Pf(t,n){Jg(t,n),(t=t.alternate)&&Jg(t,n)}function $g(t){if(t.tag===13||t.tag===31){var n=Za(t,67108864);n!==null&&Hn(n,t,67108864),Pf(t,67108864)}}function t_(t){if(t.tag===13||t.tag===31){var n=Kn();n=Xa(n);var a=Za(t,n);a!==null&&Hn(a,t,n),Pf(t,n)}}var Xl=!0;function rx(t,n,a,s){var u=z.T;z.T=null;var f=K.p;try{K.p=2,Bf(t,n,a,s)}finally{K.p=f,z.T=u}}function sx(t,n,a,s){var u=z.T;z.T=null;var f=K.p;try{K.p=8,Bf(t,n,a,s)}finally{K.p=f,z.T=u}}function Bf(t,n,a,s){if(Xl){var u=If(s);if(u===null)Ef(t,n,s,kl,a),n_(t,s);else if(lx(u,t,n,a,s))s.stopPropagation();else if(n_(t,s),n&4&&-1<ox.indexOf(t)){for(;u!==null;){var f=q(u);if(f!==null)switch(f.tag){case 3:if(f=f.stateNode,f.current.memoizedState.isDehydrated){var _=Et(f.pendingLanes);if(_!==0){var T=f;for(T.pendingLanes|=2,T.entangledLanes|=2;_;){var P=1<<31-Ft(_);T.entanglements[1]|=P,_&=~P}Ci(f),(we&6)===0&&(Al=E()+500,co(0))}}break;case 31:case 13:T=Za(f,2),T!==null&&Hn(T,f,2),Cl(),Pf(f,2)}if(f=If(s),f===null&&Ef(t,n,s,kl,a),f===u)break;u=f}u!==null&&s.stopPropagation()}else Ef(t,n,s,null,a)}}function If(t){return t=Fu(t),Ff(t)}var kl=null;function Ff(t){if(kl=null,t=A(t),t!==null){var n=c(t);if(n===null)t=null;else{var a=n.tag;if(a===13){if(t=h(n),t!==null)return t;t=null}else if(a===31){if(t=d(n),t!==null)return t;t=null}else if(a===3){if(n.stateNode.current.memoizedState.isDehydrated)return n.tag===3?n.stateNode.containerInfo:null;t=null}else n!==t&&(t=null)}}return kl=t,null}function e_(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch($()){case pt:return 2;case _t:return 8;case lt:case Xt:return 32;case Ct:return 268435456;default:return 32}default:return 32}}var Hf=!1,Ra=null,Ca=null,wa=null,vo=new Map,So=new Map,Da=[],ox="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function n_(t,n){switch(t){case"focusin":case"focusout":Ra=null;break;case"dragenter":case"dragleave":Ca=null;break;case"mouseover":case"mouseout":wa=null;break;case"pointerover":case"pointerout":vo.delete(n.pointerId);break;case"gotpointercapture":case"lostpointercapture":So.delete(n.pointerId)}}function xo(t,n,a,s,u,f){return t===null||t.nativeEvent!==f?(t={blockedOn:n,domEventName:a,eventSystemFlags:s,nativeEvent:f,targetContainers:[u]},n!==null&&(n=q(n),n!==null&&$g(n)),t):(t.eventSystemFlags|=s,n=t.targetContainers,u!==null&&n.indexOf(u)===-1&&n.push(u),t)}function lx(t,n,a,s,u){switch(n){case"focusin":return Ra=xo(Ra,t,n,a,s,u),!0;case"dragenter":return Ca=xo(Ca,t,n,a,s,u),!0;case"mouseover":return wa=xo(wa,t,n,a,s,u),!0;case"pointerover":var f=u.pointerId;return vo.set(f,xo(vo.get(f)||null,t,n,a,s,u)),!0;case"gotpointercapture":return f=u.pointerId,So.set(f,xo(So.get(f)||null,t,n,a,s,u)),!0}return!1}function i_(t){var n=A(t.target);if(n!==null){var a=c(n);if(a!==null){if(n=a.tag,n===13){if(n=h(a),n!==null){t.blockedOn=n,ka(t.priority,function(){t_(a)});return}}else if(n===31){if(n=d(a),n!==null){t.blockedOn=n,ka(t.priority,function(){t_(a)});return}}else if(n===3&&a.stateNode.current.memoizedState.isDehydrated){t.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Wl(t){if(t.blockedOn!==null)return!1;for(var n=t.targetContainers;0<n.length;){var a=If(t.nativeEvent);if(a===null){a=t.nativeEvent;var s=new a.constructor(a.type,a);Iu=s,a.target.dispatchEvent(s),Iu=null}else return n=q(a),n!==null&&$g(n),t.blockedOn=a,!1;n.shift()}return!0}function a_(t,n,a){Wl(t)&&a.delete(n)}function ux(){Hf=!1,Ra!==null&&Wl(Ra)&&(Ra=null),Ca!==null&&Wl(Ca)&&(Ca=null),wa!==null&&Wl(wa)&&(wa=null),vo.forEach(a_),So.forEach(a_)}function ql(t,n){t.blockedOn===n&&(t.blockedOn=null,Hf||(Hf=!0,o.unstable_scheduleCallback(o.unstable_NormalPriority,ux)))}var Yl=null;function r_(t){Yl!==t&&(Yl=t,o.unstable_scheduleCallback(o.unstable_NormalPriority,function(){Yl===t&&(Yl=null);for(var n=0;n<t.length;n+=3){var a=t[n],s=t[n+1],u=t[n+2];if(typeof s!="function"){if(Ff(s||a)===null)continue;break}var f=q(a);f!==null&&(t.splice(n,3),n-=3,Bc(f,{pending:!0,data:u,method:a.method,action:s},s,u))}}))}function ts(t){function n(P){return ql(P,t)}Ra!==null&&ql(Ra,t),Ca!==null&&ql(Ca,t),wa!==null&&ql(wa,t),vo.forEach(n),So.forEach(n);for(var a=0;a<Da.length;a++){var s=Da[a];s.blockedOn===t&&(s.blockedOn=null)}for(;0<Da.length&&(a=Da[0],a.blockedOn===null);)i_(a),a.blockedOn===null&&Da.shift();if(a=(t.ownerDocument||t).$$reactFormReplay,a!=null)for(s=0;s<a.length;s+=3){var u=a[s],f=a[s+1],_=u[_n]||null;if(typeof f=="function")_||r_(a);else if(_){var T=null;if(f&&f.hasAttribute("formAction")){if(u=f,_=f[_n]||null)T=_.formAction;else if(Ff(u)!==null)continue}else T=_.action;typeof T=="function"?a[s+1]=T:(a.splice(s,3),s-=3),r_(a)}}}function s_(){function t(f){f.canIntercept&&f.info==="react-transition"&&f.intercept({handler:function(){return new Promise(function(_){return u=_})},focusReset:"manual",scroll:"manual"})}function n(){u!==null&&(u(),u=null),s||setTimeout(a,20)}function a(){if(!s&&!navigation.transition){var f=navigation.currentEntry;f&&f.url!=null&&navigation.navigate(f.url,{state:f.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var s=!1,u=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",n),navigation.addEventListener("navigateerror",n),setTimeout(a,100),function(){s=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",n),navigation.removeEventListener("navigateerror",n),u!==null&&(u(),u=null)}}}function Gf(t){this._internalRoot=t}jl.prototype.render=Gf.prototype.render=function(t){var n=this._internalRoot;if(n===null)throw Error(r(409));var a=n.current,s=Kn();Qg(a,s,t,n,null,null)},jl.prototype.unmount=Gf.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var n=t.containerInfo;Qg(t.current,2,null,t,null,null),Cl(),n[Oi]=null}};function jl(t){this._internalRoot=t}jl.prototype.unstable_scheduleHydration=function(t){if(t){var n=Ds();t={blockedOn:null,target:t,priority:n};for(var a=0;a<Da.length&&n!==0&&n<Da[a].priority;a++);Da.splice(a,0,t),a===0&&i_(t)}};var o_=e.version;if(o_!=="19.2.7")throw Error(r(527,o_,"19.2.7"));K.findDOMNode=function(t){var n=t._reactInternals;if(n===void 0)throw typeof t.render=="function"?Error(r(188)):(t=Object.keys(t).join(","),Error(r(268,t)));return t=p(n),t=t!==null?v(t):null,t=t===null?null:t.stateNode,t};var cx={bundleType:0,version:"19.2.7",rendererPackageName:"react-dom",currentDispatcherRef:z,reconcilerVersion:"19.2.7"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Zl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Zl.isDisabled&&Zl.supportsFiber)try{vt=Zl.inject(cx),Rt=Zl}catch{}}return Mo.createRoot=function(t,n){if(!l(t))throw Error(r(299));var a=!1,s="",u=pm,f=mm,_=gm;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onUncaughtError!==void 0&&(u=n.onUncaughtError),n.onCaughtError!==void 0&&(f=n.onCaughtError),n.onRecoverableError!==void 0&&(_=n.onRecoverableError)),n=Zg(t,1,!1,null,null,a,s,null,u,f,_,s_),t[Oi]=n.current,Mf(t),new Gf(n)},Mo.hydrateRoot=function(t,n,a){if(!l(t))throw Error(r(299));var s=!1,u="",f=pm,_=mm,T=gm,P=null;return a!=null&&(a.unstable_strictMode===!0&&(s=!0),a.identifierPrefix!==void 0&&(u=a.identifierPrefix),a.onUncaughtError!==void 0&&(f=a.onUncaughtError),a.onCaughtError!==void 0&&(_=a.onCaughtError),a.onRecoverableError!==void 0&&(T=a.onRecoverableError),a.formState!==void 0&&(P=a.formState)),n=Zg(t,1,!0,n,a??null,s,u,P,f,_,T,s_),n.context=Kg(null),a=n.current,s=Kn(),s=Xa(s),u=ma(s),u.callback=null,ga(a,u,s),a=s,n.current.lanes=a,gn(n,a),Ci(n),t[Oi]=n.current,Mf(t),new jl(n)},Mo.version="19.2.7",Mo}var __;function xx(){if(__)return kf.exports;__=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(e){console.error(e)}}return o(),kf.exports=Sx(),kf.exports}var yx=xx();const Mx=bv(yx);function v_({title:o,description:e,children:i}){return Xe.jsxs("section",{style:{display:"grid",gap:"0.75rem",padding:"1rem",borderRadius:"16px",background:"rgba(15, 23, 42, 0.72)",border:"1px solid rgba(148, 163, 184, 0.16)"},children:[Xe.jsxs("div",{style:{display:"grid",gap:"0.25rem"},children:[Xe.jsx("h3",{style:{margin:0,fontSize:"0.95rem",fontWeight:600},children:o}),Xe.jsx("p",{style:{margin:0,fontSize:"0.85rem",lineHeight:1.5,color:"rgba(226, 232, 240, 0.72)"},children:e})]}),i]})}function Ex({title:o="Scene",subtitle:e="Add primitives, edit transforms, and pick materials.",children:i}){return Xe.jsxs("aside",{style:{width:"320px",minWidth:"280px",maxWidth:"360px",height:"100%",display:"grid",gridTemplateRows:"auto 1fr",gap:"1rem",padding:"1.25rem",color:"#e2e8f0",background:"linear-gradient(180deg, rgba(2, 6, 23, 0.98) 0%, rgba(15, 23, 42, 0.94) 100%)",borderRight:"1px solid rgba(148, 163, 184, 0.14)"},children:[Xe.jsxs("header",{style:{display:"grid",gap:"0.35rem"},children:[Xe.jsx("span",{style:{fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#94a3b8"},children:"Libre3D"}),Xe.jsx("h2",{style:{margin:0,fontSize:"1.3rem",fontWeight:700},children:o}),Xe.jsx("p",{style:{margin:0,fontSize:"0.9rem",lineHeight:1.5,color:"rgba(226, 232, 240, 0.72)"},children:e})]}),Xe.jsxs("div",{style:{display:"grid",alignContent:"start",gap:"0.85rem"},children:[Xe.jsx(v_,{title:"Objects",description:"Start with primitive shapes and keep the list easy to scan.",children:i}),Xe.jsx(v_,{title:"Appearance",description:"Reserve this area for color, material, and light controls."})]})]})}const gd="178",Tx=0,S_=1,bx=2,Av=1,Ax=2,aa=3,Ga=0,Vn=1,ra=2,Fa=0,gs=1,x_=2,y_=3,M_=4,Rx=5,gr=100,Cx=101,wx=102,Dx=103,Ux=104,Lx=200,Nx=201,Ox=202,zx=203,Ch=204,wh=205,Px=206,Bx=207,Ix=208,Fx=209,Hx=210,Gx=211,Vx=212,Xx=213,kx=214,Dh=0,Uh=1,Lh=2,Ss=3,Nh=4,Oh=5,zh=6,Ph=7,Rv=0,Wx=1,qx=2,Ha=0,Yx=1,jx=2,Zx=3,Kx=4,Qx=5,Jx=6,$x=7,Cv=300,xs=301,ys=302,Bh=303,Ih=304,Uu=306,Fh=1e3,vr=1001,Hh=1002,Mi=1003,ty=1004,Kl=1005,Di=1006,jf=1007,Sr=1008,Li=1009,wv=1010,Dv=1011,Lo=1012,_d=1013,xr=1014,sa=1015,Po=1016,vd=1017,Sd=1018,No=1020,Uv=35902,Lv=1021,Nv=1022,xi=1023,Oo=1026,zo=1027,Ov=1028,xd=1029,zv=1030,yd=1031,Md=1033,Su=33776,xu=33777,yu=33778,Mu=33779,Gh=35840,Vh=35841,Xh=35842,kh=35843,Wh=36196,qh=37492,Yh=37496,jh=37808,Zh=37809,Kh=37810,Qh=37811,Jh=37812,$h=37813,td=37814,ed=37815,nd=37816,id=37817,ad=37818,rd=37819,sd=37820,od=37821,Eu=36492,ld=36494,ud=36495,Pv=36283,cd=36284,fd=36285,hd=36286,ey=3200,ny=3201,Bv=0,iy=1,Ia="",$n="srgb",Ms="srgb-linear",Au="linear",Fe="srgb",es=7680,E_=519,ay=512,ry=513,sy=514,Iv=515,oy=516,ly=517,uy=518,cy=519,T_=35044,b_="300 es",oa=2e3,Ru=2001;class Ts{addEventListener(e,i){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(i)===-1&&r[e].push(i)}hasEventListener(e,i){const r=this._listeners;return r===void 0?!1:r[e]!==void 0&&r[e].indexOf(i)!==-1}removeEventListener(e,i){const r=this._listeners;if(r===void 0)return;const l=r[e];if(l!==void 0){const c=l.indexOf(i);c!==-1&&l.splice(c,1)}}dispatchEvent(e){const i=this._listeners;if(i===void 0)return;const r=i[e.type];if(r!==void 0){e.target=this;const l=r.slice(0);for(let c=0,h=l.length;c<h;c++)l[c].call(this,e);e.target=null}}}const Cn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Zf=Math.PI/180,dd=180/Math.PI;function Bo(){const o=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Cn[o&255]+Cn[o>>8&255]+Cn[o>>16&255]+Cn[o>>24&255]+"-"+Cn[e&255]+Cn[e>>8&255]+"-"+Cn[e>>16&15|64]+Cn[e>>24&255]+"-"+Cn[i&63|128]+Cn[i>>8&255]+"-"+Cn[i>>16&255]+Cn[i>>24&255]+Cn[r&255]+Cn[r>>8&255]+Cn[r>>16&255]+Cn[r>>24&255]).toLowerCase()}function xe(o,e,i){return Math.max(e,Math.min(i,o))}function fy(o,e){return(o%e+e)%e}function Kf(o,e,i){return(1-i)*o+i*e}function Eo(o,e){switch(e.constructor){case Float32Array:return o;case Uint32Array:return o/4294967295;case Uint16Array:return o/65535;case Uint8Array:return o/255;case Int32Array:return Math.max(o/2147483647,-1);case Int16Array:return Math.max(o/32767,-1);case Int8Array:return Math.max(o/127,-1);default:throw new Error("Invalid component type.")}}function Gn(o,e){switch(e.constructor){case Float32Array:return o;case Uint32Array:return Math.round(o*4294967295);case Uint16Array:return Math.round(o*65535);case Uint8Array:return Math.round(o*255);case Int32Array:return Math.round(o*2147483647);case Int16Array:return Math.round(o*32767);case Int8Array:return Math.round(o*127);default:throw new Error("Invalid component type.")}}class Ce{constructor(e=0,i=0){Ce.prototype.isVector2=!0,this.x=e,this.y=i}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,i){return this.x=e,this.y=i,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,i){switch(e){case 0:this.x=i;break;case 1:this.y=i;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,i){return this.x=e.x+i.x,this.y=e.y+i.y,this}addScaledVector(e,i){return this.x+=e.x*i,this.y+=e.y*i,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,i){return this.x=e.x-i.x,this.y=e.y-i.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const i=this.x,r=this.y,l=e.elements;return this.x=l[0]*i+l[3]*r+l[6],this.y=l[1]*i+l[4]*r+l[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,i){return this.x=xe(this.x,e.x,i.x),this.y=xe(this.y,e.y,i.y),this}clampScalar(e,i){return this.x=xe(this.x,e,i),this.y=xe(this.y,e,i),this}clampLength(e,i){const r=this.length();return this.divideScalar(r||1).multiplyScalar(xe(r,e,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const i=Math.sqrt(this.lengthSq()*e.lengthSq());if(i===0)return Math.PI/2;const r=this.dot(e)/i;return Math.acos(xe(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const i=this.x-e.x,r=this.y-e.y;return i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,i){return this.x+=(e.x-this.x)*i,this.y+=(e.y-this.y)*i,this}lerpVectors(e,i,r){return this.x=e.x+(i.x-e.x)*r,this.y=e.y+(i.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,i=0){return this.x=e[i],this.y=e[i+1],this}toArray(e=[],i=0){return e[i]=this.x,e[i+1]=this.y,e}fromBufferAttribute(e,i){return this.x=e.getX(i),this.y=e.getY(i),this}rotateAround(e,i){const r=Math.cos(i),l=Math.sin(i),c=this.x-e.x,h=this.y-e.y;return this.x=c*r-h*l+e.x,this.y=c*l+h*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Io{constructor(e=0,i=0,r=0,l=1){this.isQuaternion=!0,this._x=e,this._y=i,this._z=r,this._w=l}static slerpFlat(e,i,r,l,c,h,d){let m=r[l+0],p=r[l+1],v=r[l+2],S=r[l+3];const x=c[h+0],M=c[h+1],b=c[h+2],R=c[h+3];if(d===0){e[i+0]=m,e[i+1]=p,e[i+2]=v,e[i+3]=S;return}if(d===1){e[i+0]=x,e[i+1]=M,e[i+2]=b,e[i+3]=R;return}if(S!==R||m!==x||p!==M||v!==b){let y=1-d;const g=m*x+p*M+v*b+S*R,B=g>=0?1:-1,N=1-g*g;if(N>Number.EPSILON){const W=Math.sqrt(N),F=Math.atan2(W,g*B);y=Math.sin(y*F)/W,d=Math.sin(d*F)/W}const D=d*B;if(m=m*y+x*D,p=p*y+M*D,v=v*y+b*D,S=S*y+R*D,y===1-d){const W=1/Math.sqrt(m*m+p*p+v*v+S*S);m*=W,p*=W,v*=W,S*=W}}e[i]=m,e[i+1]=p,e[i+2]=v,e[i+3]=S}static multiplyQuaternionsFlat(e,i,r,l,c,h){const d=r[l],m=r[l+1],p=r[l+2],v=r[l+3],S=c[h],x=c[h+1],M=c[h+2],b=c[h+3];return e[i]=d*b+v*S+m*M-p*x,e[i+1]=m*b+v*x+p*S-d*M,e[i+2]=p*b+v*M+d*x-m*S,e[i+3]=v*b-d*S-m*x-p*M,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,i,r,l){return this._x=e,this._y=i,this._z=r,this._w=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,i=!0){const r=e._x,l=e._y,c=e._z,h=e._order,d=Math.cos,m=Math.sin,p=d(r/2),v=d(l/2),S=d(c/2),x=m(r/2),M=m(l/2),b=m(c/2);switch(h){case"XYZ":this._x=x*v*S+p*M*b,this._y=p*M*S-x*v*b,this._z=p*v*b+x*M*S,this._w=p*v*S-x*M*b;break;case"YXZ":this._x=x*v*S+p*M*b,this._y=p*M*S-x*v*b,this._z=p*v*b-x*M*S,this._w=p*v*S+x*M*b;break;case"ZXY":this._x=x*v*S-p*M*b,this._y=p*M*S+x*v*b,this._z=p*v*b+x*M*S,this._w=p*v*S-x*M*b;break;case"ZYX":this._x=x*v*S-p*M*b,this._y=p*M*S+x*v*b,this._z=p*v*b-x*M*S,this._w=p*v*S+x*M*b;break;case"YZX":this._x=x*v*S+p*M*b,this._y=p*M*S+x*v*b,this._z=p*v*b-x*M*S,this._w=p*v*S-x*M*b;break;case"XZY":this._x=x*v*S-p*M*b,this._y=p*M*S-x*v*b,this._z=p*v*b+x*M*S,this._w=p*v*S+x*M*b;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+h)}return i===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,i){const r=i/2,l=Math.sin(r);return this._x=e.x*l,this._y=e.y*l,this._z=e.z*l,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const i=e.elements,r=i[0],l=i[4],c=i[8],h=i[1],d=i[5],m=i[9],p=i[2],v=i[6],S=i[10],x=r+d+S;if(x>0){const M=.5/Math.sqrt(x+1);this._w=.25/M,this._x=(v-m)*M,this._y=(c-p)*M,this._z=(h-l)*M}else if(r>d&&r>S){const M=2*Math.sqrt(1+r-d-S);this._w=(v-m)/M,this._x=.25*M,this._y=(l+h)/M,this._z=(c+p)/M}else if(d>S){const M=2*Math.sqrt(1+d-r-S);this._w=(c-p)/M,this._x=(l+h)/M,this._y=.25*M,this._z=(m+v)/M}else{const M=2*Math.sqrt(1+S-r-d);this._w=(h-l)/M,this._x=(c+p)/M,this._y=(m+v)/M,this._z=.25*M}return this._onChangeCallback(),this}setFromUnitVectors(e,i){let r=e.dot(i)+1;return r<1e-8?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*i.z-e.z*i.y,this._y=e.z*i.x-e.x*i.z,this._z=e.x*i.y-e.y*i.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(xe(this.dot(e),-1,1)))}rotateTowards(e,i){const r=this.angleTo(e);if(r===0)return this;const l=Math.min(1,i/r);return this.slerp(e,l),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,i){const r=e._x,l=e._y,c=e._z,h=e._w,d=i._x,m=i._y,p=i._z,v=i._w;return this._x=r*v+h*d+l*p-c*m,this._y=l*v+h*m+c*d-r*p,this._z=c*v+h*p+r*m-l*d,this._w=h*v-r*d-l*m-c*p,this._onChangeCallback(),this}slerp(e,i){if(i===0)return this;if(i===1)return this.copy(e);const r=this._x,l=this._y,c=this._z,h=this._w;let d=h*e._w+r*e._x+l*e._y+c*e._z;if(d<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,d=-d):this.copy(e),d>=1)return this._w=h,this._x=r,this._y=l,this._z=c,this;const m=1-d*d;if(m<=Number.EPSILON){const M=1-i;return this._w=M*h+i*this._w,this._x=M*r+i*this._x,this._y=M*l+i*this._y,this._z=M*c+i*this._z,this.normalize(),this}const p=Math.sqrt(m),v=Math.atan2(p,d),S=Math.sin((1-i)*v)/p,x=Math.sin(i*v)/p;return this._w=h*S+this._w*x,this._x=r*S+this._x*x,this._y=l*S+this._y*x,this._z=c*S+this._z*x,this._onChangeCallback(),this}slerpQuaternions(e,i,r){return this.copy(e).slerp(i,r)}random(){const e=2*Math.PI*Math.random(),i=2*Math.PI*Math.random(),r=Math.random(),l=Math.sqrt(1-r),c=Math.sqrt(r);return this.set(l*Math.sin(e),l*Math.cos(e),c*Math.sin(i),c*Math.cos(i))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,i=0){return this._x=e[i],this._y=e[i+1],this._z=e[i+2],this._w=e[i+3],this._onChangeCallback(),this}toArray(e=[],i=0){return e[i]=this._x,e[i+1]=this._y,e[i+2]=this._z,e[i+3]=this._w,e}fromBufferAttribute(e,i){return this._x=e.getX(i),this._y=e.getY(i),this._z=e.getZ(i),this._w=e.getW(i),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class et{constructor(e=0,i=0,r=0){et.prototype.isVector3=!0,this.x=e,this.y=i,this.z=r}set(e,i,r){return r===void 0&&(r=this.z),this.x=e,this.y=i,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,i){switch(e){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,i){return this.x=e.x+i.x,this.y=e.y+i.y,this.z=e.z+i.z,this}addScaledVector(e,i){return this.x+=e.x*i,this.y+=e.y*i,this.z+=e.z*i,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,i){return this.x=e.x-i.x,this.y=e.y-i.y,this.z=e.z-i.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,i){return this.x=e.x*i.x,this.y=e.y*i.y,this.z=e.z*i.z,this}applyEuler(e){return this.applyQuaternion(A_.setFromEuler(e))}applyAxisAngle(e,i){return this.applyQuaternion(A_.setFromAxisAngle(e,i))}applyMatrix3(e){const i=this.x,r=this.y,l=this.z,c=e.elements;return this.x=c[0]*i+c[3]*r+c[6]*l,this.y=c[1]*i+c[4]*r+c[7]*l,this.z=c[2]*i+c[5]*r+c[8]*l,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const i=this.x,r=this.y,l=this.z,c=e.elements,h=1/(c[3]*i+c[7]*r+c[11]*l+c[15]);return this.x=(c[0]*i+c[4]*r+c[8]*l+c[12])*h,this.y=(c[1]*i+c[5]*r+c[9]*l+c[13])*h,this.z=(c[2]*i+c[6]*r+c[10]*l+c[14])*h,this}applyQuaternion(e){const i=this.x,r=this.y,l=this.z,c=e.x,h=e.y,d=e.z,m=e.w,p=2*(h*l-d*r),v=2*(d*i-c*l),S=2*(c*r-h*i);return this.x=i+m*p+h*S-d*v,this.y=r+m*v+d*p-c*S,this.z=l+m*S+c*v-h*p,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const i=this.x,r=this.y,l=this.z,c=e.elements;return this.x=c[0]*i+c[4]*r+c[8]*l,this.y=c[1]*i+c[5]*r+c[9]*l,this.z=c[2]*i+c[6]*r+c[10]*l,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,i){return this.x=xe(this.x,e.x,i.x),this.y=xe(this.y,e.y,i.y),this.z=xe(this.z,e.z,i.z),this}clampScalar(e,i){return this.x=xe(this.x,e,i),this.y=xe(this.y,e,i),this.z=xe(this.z,e,i),this}clampLength(e,i){const r=this.length();return this.divideScalar(r||1).multiplyScalar(xe(r,e,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,i){return this.x+=(e.x-this.x)*i,this.y+=(e.y-this.y)*i,this.z+=(e.z-this.z)*i,this}lerpVectors(e,i,r){return this.x=e.x+(i.x-e.x)*r,this.y=e.y+(i.y-e.y)*r,this.z=e.z+(i.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,i){const r=e.x,l=e.y,c=e.z,h=i.x,d=i.y,m=i.z;return this.x=l*m-c*d,this.y=c*h-r*m,this.z=r*d-l*h,this}projectOnVector(e){const i=e.lengthSq();if(i===0)return this.set(0,0,0);const r=e.dot(this)/i;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return Qf.copy(this).projectOnVector(e),this.sub(Qf)}reflect(e){return this.sub(Qf.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const i=Math.sqrt(this.lengthSq()*e.lengthSq());if(i===0)return Math.PI/2;const r=this.dot(e)/i;return Math.acos(xe(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const i=this.x-e.x,r=this.y-e.y,l=this.z-e.z;return i*i+r*r+l*l}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,i,r){const l=Math.sin(i)*e;return this.x=l*Math.sin(r),this.y=Math.cos(i)*e,this.z=l*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,i,r){return this.x=e*Math.sin(i),this.y=r,this.z=e*Math.cos(i),this}setFromMatrixPosition(e){const i=e.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this}setFromMatrixScale(e){const i=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),l=this.setFromMatrixColumn(e,2).length();return this.x=i,this.y=r,this.z=l,this}setFromMatrixColumn(e,i){return this.fromArray(e.elements,i*4)}setFromMatrix3Column(e,i){return this.fromArray(e.elements,i*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,i=0){return this.x=e[i],this.y=e[i+1],this.z=e[i+2],this}toArray(e=[],i=0){return e[i]=this.x,e[i+1]=this.y,e[i+2]=this.z,e}fromBufferAttribute(e,i){return this.x=e.getX(i),this.y=e.getY(i),this.z=e.getZ(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,i=Math.random()*2-1,r=Math.sqrt(1-i*i);return this.x=r*Math.cos(e),this.y=i,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Qf=new et,A_=new Io;class oe{constructor(e,i,r,l,c,h,d,m,p){oe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,i,r,l,c,h,d,m,p)}set(e,i,r,l,c,h,d,m,p){const v=this.elements;return v[0]=e,v[1]=l,v[2]=d,v[3]=i,v[4]=c,v[5]=m,v[6]=r,v[7]=h,v[8]=p,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const i=this.elements,r=e.elements;return i[0]=r[0],i[1]=r[1],i[2]=r[2],i[3]=r[3],i[4]=r[4],i[5]=r[5],i[6]=r[6],i[7]=r[7],i[8]=r[8],this}extractBasis(e,i,r){return e.setFromMatrix3Column(this,0),i.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const i=e.elements;return this.set(i[0],i[4],i[8],i[1],i[5],i[9],i[2],i[6],i[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,i){const r=e.elements,l=i.elements,c=this.elements,h=r[0],d=r[3],m=r[6],p=r[1],v=r[4],S=r[7],x=r[2],M=r[5],b=r[8],R=l[0],y=l[3],g=l[6],B=l[1],N=l[4],D=l[7],W=l[2],F=l[5],O=l[8];return c[0]=h*R+d*B+m*W,c[3]=h*y+d*N+m*F,c[6]=h*g+d*D+m*O,c[1]=p*R+v*B+S*W,c[4]=p*y+v*N+S*F,c[7]=p*g+v*D+S*O,c[2]=x*R+M*B+b*W,c[5]=x*y+M*N+b*F,c[8]=x*g+M*D+b*O,this}multiplyScalar(e){const i=this.elements;return i[0]*=e,i[3]*=e,i[6]*=e,i[1]*=e,i[4]*=e,i[7]*=e,i[2]*=e,i[5]*=e,i[8]*=e,this}determinant(){const e=this.elements,i=e[0],r=e[1],l=e[2],c=e[3],h=e[4],d=e[5],m=e[6],p=e[7],v=e[8];return i*h*v-i*d*p-r*c*v+r*d*m+l*c*p-l*h*m}invert(){const e=this.elements,i=e[0],r=e[1],l=e[2],c=e[3],h=e[4],d=e[5],m=e[6],p=e[7],v=e[8],S=v*h-d*p,x=d*m-v*c,M=p*c-h*m,b=i*S+r*x+l*M;if(b===0)return this.set(0,0,0,0,0,0,0,0,0);const R=1/b;return e[0]=S*R,e[1]=(l*p-v*r)*R,e[2]=(d*r-l*h)*R,e[3]=x*R,e[4]=(v*i-l*m)*R,e[5]=(l*c-d*i)*R,e[6]=M*R,e[7]=(r*m-p*i)*R,e[8]=(h*i-r*c)*R,this}transpose(){let e;const i=this.elements;return e=i[1],i[1]=i[3],i[3]=e,e=i[2],i[2]=i[6],i[6]=e,e=i[5],i[5]=i[7],i[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const i=this.elements;return e[0]=i[0],e[1]=i[3],e[2]=i[6],e[3]=i[1],e[4]=i[4],e[5]=i[7],e[6]=i[2],e[7]=i[5],e[8]=i[8],this}setUvTransform(e,i,r,l,c,h,d){const m=Math.cos(c),p=Math.sin(c);return this.set(r*m,r*p,-r*(m*h+p*d)+h+e,-l*p,l*m,-l*(-p*h+m*d)+d+i,0,0,1),this}scale(e,i){return this.premultiply(Jf.makeScale(e,i)),this}rotate(e){return this.premultiply(Jf.makeRotation(-e)),this}translate(e,i){return this.premultiply(Jf.makeTranslation(e,i)),this}makeTranslation(e,i){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,i,0,0,1),this}makeRotation(e){const i=Math.cos(e),r=Math.sin(e);return this.set(i,-r,0,r,i,0,0,0,1),this}makeScale(e,i){return this.set(e,0,0,0,i,0,0,0,1),this}equals(e){const i=this.elements,r=e.elements;for(let l=0;l<9;l++)if(i[l]!==r[l])return!1;return!0}fromArray(e,i=0){for(let r=0;r<9;r++)this.elements[r]=e[r+i];return this}toArray(e=[],i=0){const r=this.elements;return e[i]=r[0],e[i+1]=r[1],e[i+2]=r[2],e[i+3]=r[3],e[i+4]=r[4],e[i+5]=r[5],e[i+6]=r[6],e[i+7]=r[7],e[i+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Jf=new oe;function Fv(o){for(let e=o.length-1;e>=0;--e)if(o[e]>=65535)return!0;return!1}function Cu(o){return document.createElementNS("http://www.w3.org/1999/xhtml",o)}function hy(){const o=Cu("canvas");return o.style.display="block",o}const R_={};function _s(o){o in R_||(R_[o]=!0,console.warn(o))}function dy(o,e,i){return new Promise(function(r,l){function c(){switch(o.clientWaitSync(e,o.SYNC_FLUSH_COMMANDS_BIT,0)){case o.WAIT_FAILED:l();break;case o.TIMEOUT_EXPIRED:setTimeout(c,i);break;default:r()}}setTimeout(c,i)})}function py(o){const e=o.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function my(o){const e=o.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const C_=new oe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),w_=new oe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function gy(){const o={enabled:!0,workingColorSpace:Ms,spaces:{},convert:function(l,c,h){return this.enabled===!1||c===h||!c||!h||(this.spaces[c].transfer===Fe&&(l.r=la(l.r),l.g=la(l.g),l.b=la(l.b)),this.spaces[c].primaries!==this.spaces[h].primaries&&(l.applyMatrix3(this.spaces[c].toXYZ),l.applyMatrix3(this.spaces[h].fromXYZ)),this.spaces[h].transfer===Fe&&(l.r=vs(l.r),l.g=vs(l.g),l.b=vs(l.b))),l},workingToColorSpace:function(l,c){return this.convert(l,this.workingColorSpace,c)},colorSpaceToWorking:function(l,c){return this.convert(l,c,this.workingColorSpace)},getPrimaries:function(l){return this.spaces[l].primaries},getTransfer:function(l){return l===Ia?Au:this.spaces[l].transfer},getLuminanceCoefficients:function(l,c=this.workingColorSpace){return l.fromArray(this.spaces[c].luminanceCoefficients)},define:function(l){Object.assign(this.spaces,l)},_getMatrix:function(l,c,h){return l.copy(this.spaces[c].toXYZ).multiply(this.spaces[h].fromXYZ)},_getDrawingBufferColorSpace:function(l){return this.spaces[l].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(l=this.workingColorSpace){return this.spaces[l].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(l,c){return _s("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),o.workingToColorSpace(l,c)},toWorkingColorSpace:function(l,c){return _s("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),o.colorSpaceToWorking(l,c)}},e=[.64,.33,.3,.6,.15,.06],i=[.2126,.7152,.0722],r=[.3127,.329];return o.define({[Ms]:{primaries:e,whitePoint:r,transfer:Au,toXYZ:C_,fromXYZ:w_,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:$n},outputColorSpaceConfig:{drawingBufferColorSpace:$n}},[$n]:{primaries:e,whitePoint:r,transfer:Fe,toXYZ:C_,fromXYZ:w_,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:$n}}}),o}const Re=gy();function la(o){return o<.04045?o*.0773993808:Math.pow(o*.9478672986+.0521327014,2.4)}function vs(o){return o<.0031308?o*12.92:1.055*Math.pow(o,.41666)-.055}let ns;class _y{static getDataURL(e,i="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let r;if(e instanceof HTMLCanvasElement)r=e;else{ns===void 0&&(ns=Cu("canvas")),ns.width=e.width,ns.height=e.height;const l=ns.getContext("2d");e instanceof ImageData?l.putImageData(e,0,0):l.drawImage(e,0,0,e.width,e.height),r=ns}return r.toDataURL(i)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const i=Cu("canvas");i.width=e.width,i.height=e.height;const r=i.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const l=r.getImageData(0,0,e.width,e.height),c=l.data;for(let h=0;h<c.length;h++)c[h]=la(c[h]/255)*255;return r.putImageData(l,0,0),i}else if(e.data){const i=e.data.slice(0);for(let r=0;r<i.length;r++)i instanceof Uint8Array||i instanceof Uint8ClampedArray?i[r]=Math.floor(la(i[r]/255)*255):i[r]=la(i[r]);return{data:i,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let vy=0;class Ed{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:vy++}),this.uuid=Bo(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const i=this.data;return i instanceof HTMLVideoElement?e.set(i.videoWidth,i.videoHeight):i!==null?e.set(i.width,i.height,i.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const i=e===void 0||typeof e=="string";if(!i&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},l=this.data;if(l!==null){let c;if(Array.isArray(l)){c=[];for(let h=0,d=l.length;h<d;h++)l[h].isDataTexture?c.push($f(l[h].image)):c.push($f(l[h]))}else c=$f(l);r.url=c}return i||(e.images[this.uuid]=r),r}}function $f(o){return typeof HTMLImageElement<"u"&&o instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&o instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&o instanceof ImageBitmap?_y.getDataURL(o):o.data?{data:Array.from(o.data),width:o.width,height:o.height,type:o.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Sy=0;const th=new et;class Xn extends Ts{constructor(e=Xn.DEFAULT_IMAGE,i=Xn.DEFAULT_MAPPING,r=vr,l=vr,c=Di,h=Sr,d=xi,m=Li,p=Xn.DEFAULT_ANISOTROPY,v=Ia){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Sy++}),this.uuid=Bo(),this.name="",this.source=new Ed(e),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=r,this.wrapT=l,this.magFilter=c,this.minFilter=h,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=m,this.offset=new Ce(0,0),this.repeat=new Ce(1,1),this.center=new Ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new oe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=v,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(th).x}get height(){return this.source.getSize(th).y}get depth(){return this.source.getSize(th).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,i){this.updateRanges.push({start:e,count:i})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const i in e){const r=e[i];if(r===void 0){console.warn(`THREE.Texture.setValues(): parameter '${i}' has value of undefined.`);continue}const l=this[i];if(l===void 0){console.warn(`THREE.Texture.setValues(): property '${i}' does not exist.`);continue}l&&r&&l.isVector2&&r.isVector2||l&&r&&l.isVector3&&r.isVector3||l&&r&&l.isMatrix3&&r.isMatrix3?l.copy(r):this[i]=r}}toJSON(e){const i=e===void 0||typeof e=="string";if(!i&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),i||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Cv)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Fh:e.x=e.x-Math.floor(e.x);break;case vr:e.x=e.x<0?0:1;break;case Hh:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Fh:e.y=e.y-Math.floor(e.y);break;case vr:e.y=e.y<0?0:1;break;case Hh:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Xn.DEFAULT_IMAGE=null;Xn.DEFAULT_MAPPING=Cv;Xn.DEFAULT_ANISOTROPY=1;class $e{constructor(e=0,i=0,r=0,l=1){$e.prototype.isVector4=!0,this.x=e,this.y=i,this.z=r,this.w=l}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,i,r,l){return this.x=e,this.y=i,this.z=r,this.w=l,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,i){switch(e){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;case 3:this.w=i;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,i){return this.x=e.x+i.x,this.y=e.y+i.y,this.z=e.z+i.z,this.w=e.w+i.w,this}addScaledVector(e,i){return this.x+=e.x*i,this.y+=e.y*i,this.z+=e.z*i,this.w+=e.w*i,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,i){return this.x=e.x-i.x,this.y=e.y-i.y,this.z=e.z-i.z,this.w=e.w-i.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const i=this.x,r=this.y,l=this.z,c=this.w,h=e.elements;return this.x=h[0]*i+h[4]*r+h[8]*l+h[12]*c,this.y=h[1]*i+h[5]*r+h[9]*l+h[13]*c,this.z=h[2]*i+h[6]*r+h[10]*l+h[14]*c,this.w=h[3]*i+h[7]*r+h[11]*l+h[15]*c,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const i=Math.sqrt(1-e.w*e.w);return i<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/i,this.y=e.y/i,this.z=e.z/i),this}setAxisAngleFromRotationMatrix(e){let i,r,l,c;const m=e.elements,p=m[0],v=m[4],S=m[8],x=m[1],M=m[5],b=m[9],R=m[2],y=m[6],g=m[10];if(Math.abs(v-x)<.01&&Math.abs(S-R)<.01&&Math.abs(b-y)<.01){if(Math.abs(v+x)<.1&&Math.abs(S+R)<.1&&Math.abs(b+y)<.1&&Math.abs(p+M+g-3)<.1)return this.set(1,0,0,0),this;i=Math.PI;const N=(p+1)/2,D=(M+1)/2,W=(g+1)/2,F=(v+x)/4,O=(S+R)/4,k=(b+y)/4;return N>D&&N>W?N<.01?(r=0,l=.707106781,c=.707106781):(r=Math.sqrt(N),l=F/r,c=O/r):D>W?D<.01?(r=.707106781,l=0,c=.707106781):(l=Math.sqrt(D),r=F/l,c=k/l):W<.01?(r=.707106781,l=.707106781,c=0):(c=Math.sqrt(W),r=O/c,l=k/c),this.set(r,l,c,i),this}let B=Math.sqrt((y-b)*(y-b)+(S-R)*(S-R)+(x-v)*(x-v));return Math.abs(B)<.001&&(B=1),this.x=(y-b)/B,this.y=(S-R)/B,this.z=(x-v)/B,this.w=Math.acos((p+M+g-1)/2),this}setFromMatrixPosition(e){const i=e.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this.w=i[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,i){return this.x=xe(this.x,e.x,i.x),this.y=xe(this.y,e.y,i.y),this.z=xe(this.z,e.z,i.z),this.w=xe(this.w,e.w,i.w),this}clampScalar(e,i){return this.x=xe(this.x,e,i),this.y=xe(this.y,e,i),this.z=xe(this.z,e,i),this.w=xe(this.w,e,i),this}clampLength(e,i){const r=this.length();return this.divideScalar(r||1).multiplyScalar(xe(r,e,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,i){return this.x+=(e.x-this.x)*i,this.y+=(e.y-this.y)*i,this.z+=(e.z-this.z)*i,this.w+=(e.w-this.w)*i,this}lerpVectors(e,i,r){return this.x=e.x+(i.x-e.x)*r,this.y=e.y+(i.y-e.y)*r,this.z=e.z+(i.z-e.z)*r,this.w=e.w+(i.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,i=0){return this.x=e[i],this.y=e[i+1],this.z=e[i+2],this.w=e[i+3],this}toArray(e=[],i=0){return e[i]=this.x,e[i+1]=this.y,e[i+2]=this.z,e[i+3]=this.w,e}fromBufferAttribute(e,i){return this.x=e.getX(i),this.y=e.getY(i),this.z=e.getZ(i),this.w=e.getW(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class xy extends Ts{constructor(e=1,i=1,r={}){super(),r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Di,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},r),this.isRenderTarget=!0,this.width=e,this.height=i,this.depth=r.depth,this.scissor=new $e(0,0,e,i),this.scissorTest=!1,this.viewport=new $e(0,0,e,i);const l={width:e,height:i,depth:r.depth},c=new Xn(l);this.textures=[];const h=r.count;for(let d=0;d<h;d++)this.textures[d]=c.clone(),this.textures[d].isRenderTargetTexture=!0,this.textures[d].renderTarget=this;this._setTextureOptions(r),this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=r.depthTexture,this.samples=r.samples,this.multiview=r.multiview}_setTextureOptions(e={}){const i={minFilter:Di,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(i.mapping=e.mapping),e.wrapS!==void 0&&(i.wrapS=e.wrapS),e.wrapT!==void 0&&(i.wrapT=e.wrapT),e.wrapR!==void 0&&(i.wrapR=e.wrapR),e.magFilter!==void 0&&(i.magFilter=e.magFilter),e.minFilter!==void 0&&(i.minFilter=e.minFilter),e.format!==void 0&&(i.format=e.format),e.type!==void 0&&(i.type=e.type),e.anisotropy!==void 0&&(i.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(i.colorSpace=e.colorSpace),e.flipY!==void 0&&(i.flipY=e.flipY),e.generateMipmaps!==void 0&&(i.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(i.internalFormat=e.internalFormat);for(let r=0;r<this.textures.length;r++)this.textures[r].setValues(i)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,i,r=1){if(this.width!==e||this.height!==i||this.depth!==r){this.width=e,this.height=i,this.depth=r;for(let l=0,c=this.textures.length;l<c;l++)this.textures[l].image.width=e,this.textures[l].image.height=i,this.textures[l].image.depth=r,this.textures[l].isArrayTexture=this.textures[l].image.depth>1;this.dispose()}this.viewport.set(0,0,e,i),this.scissor.set(0,0,e,i)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++){this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;const l=Object.assign({},e.textures[i].image);this.textures[i].source=new Ed(l)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class yr extends xy{constructor(e=1,i=1,r={}){super(e,i,r),this.isWebGLRenderTarget=!0}}class Hv extends Xn{constructor(e=null,i=1,r=1,l=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:i,height:r,depth:l},this.magFilter=Mi,this.minFilter=Mi,this.wrapR=vr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class yy extends Xn{constructor(e=null,i=1,r=1,l=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:i,height:r,depth:l},this.magFilter=Mi,this.minFilter=Mi,this.wrapR=vr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Fo{constructor(e=new et(1/0,1/0,1/0),i=new et(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=i}set(e,i){return this.min.copy(e),this.max.copy(i),this}setFromArray(e){this.makeEmpty();for(let i=0,r=e.length;i<r;i+=3)this.expandByPoint(gi.fromArray(e,i));return this}setFromBufferAttribute(e){this.makeEmpty();for(let i=0,r=e.count;i<r;i++)this.expandByPoint(gi.fromBufferAttribute(e,i));return this}setFromPoints(e){this.makeEmpty();for(let i=0,r=e.length;i<r;i++)this.expandByPoint(e[i]);return this}setFromCenterAndSize(e,i){const r=gi.copy(i).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,i=!1){return this.makeEmpty(),this.expandByObject(e,i)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,i=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const c=r.getAttribute("position");if(i===!0&&c!==void 0&&e.isInstancedMesh!==!0)for(let h=0,d=c.count;h<d;h++)e.isMesh===!0?e.getVertexPosition(h,gi):gi.fromBufferAttribute(c,h),gi.applyMatrix4(e.matrixWorld),this.expandByPoint(gi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ql.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),Ql.copy(r.boundingBox)),Ql.applyMatrix4(e.matrixWorld),this.union(Ql)}const l=e.children;for(let c=0,h=l.length;c<h;c++)this.expandByObject(l[c],i);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,i){return i.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,gi),gi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let i,r;return e.normal.x>0?(i=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(i=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(i+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(i+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(i+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(i+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),i<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(To),Jl.subVectors(this.max,To),is.subVectors(e.a,To),as.subVectors(e.b,To),rs.subVectors(e.c,To),La.subVectors(as,is),Na.subVectors(rs,as),lr.subVectors(is,rs);let i=[0,-La.z,La.y,0,-Na.z,Na.y,0,-lr.z,lr.y,La.z,0,-La.x,Na.z,0,-Na.x,lr.z,0,-lr.x,-La.y,La.x,0,-Na.y,Na.x,0,-lr.y,lr.x,0];return!eh(i,is,as,rs,Jl)||(i=[1,0,0,0,1,0,0,0,1],!eh(i,is,as,rs,Jl))?!1:($l.crossVectors(La,Na),i=[$l.x,$l.y,$l.z],eh(i,is,as,rs,Jl))}clampPoint(e,i){return i.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,gi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(gi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ji[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ji[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ji[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ji[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ji[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ji[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ji[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ji[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ji),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Ji=[new et,new et,new et,new et,new et,new et,new et,new et],gi=new et,Ql=new Fo,is=new et,as=new et,rs=new et,La=new et,Na=new et,lr=new et,To=new et,Jl=new et,$l=new et,ur=new et;function eh(o,e,i,r,l){for(let c=0,h=o.length-3;c<=h;c+=3){ur.fromArray(o,c);const d=l.x*Math.abs(ur.x)+l.y*Math.abs(ur.y)+l.z*Math.abs(ur.z),m=e.dot(ur),p=i.dot(ur),v=r.dot(ur);if(Math.max(-Math.max(m,p,v),Math.min(m,p,v))>d)return!1}return!0}const My=new Fo,bo=new et,nh=new et;class Lu{constructor(e=new et,i=-1){this.isSphere=!0,this.center=e,this.radius=i}set(e,i){return this.center.copy(e),this.radius=i,this}setFromPoints(e,i){const r=this.center;i!==void 0?r.copy(i):My.setFromPoints(e).getCenter(r);let l=0;for(let c=0,h=e.length;c<h;c++)l=Math.max(l,r.distanceToSquared(e[c]));return this.radius=Math.sqrt(l),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const i=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=i*i}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,i){const r=this.center.distanceToSquared(e);return i.copy(e),r>this.radius*this.radius&&(i.sub(this.center).normalize(),i.multiplyScalar(this.radius).add(this.center)),i}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;bo.subVectors(e,this.center);const i=bo.lengthSq();if(i>this.radius*this.radius){const r=Math.sqrt(i),l=(r-this.radius)*.5;this.center.addScaledVector(bo,l/r),this.radius+=l}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(nh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(bo.copy(e.center).add(nh)),this.expandByPoint(bo.copy(e.center).sub(nh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const $i=new et,ih=new et,tu=new et,Oa=new et,ah=new et,eu=new et,rh=new et;class Gv{constructor(e=new et,i=new et(0,0,-1)){this.origin=e,this.direction=i}set(e,i){return this.origin.copy(e),this.direction.copy(i),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,i){return i.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,$i)),this}closestPointToPoint(e,i){i.subVectors(e,this.origin);const r=i.dot(this.direction);return r<0?i.copy(this.origin):i.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const i=$i.subVectors(e,this.origin).dot(this.direction);return i<0?this.origin.distanceToSquared(e):($i.copy(this.origin).addScaledVector(this.direction,i),$i.distanceToSquared(e))}distanceSqToSegment(e,i,r,l){ih.copy(e).add(i).multiplyScalar(.5),tu.copy(i).sub(e).normalize(),Oa.copy(this.origin).sub(ih);const c=e.distanceTo(i)*.5,h=-this.direction.dot(tu),d=Oa.dot(this.direction),m=-Oa.dot(tu),p=Oa.lengthSq(),v=Math.abs(1-h*h);let S,x,M,b;if(v>0)if(S=h*m-d,x=h*d-m,b=c*v,S>=0)if(x>=-b)if(x<=b){const R=1/v;S*=R,x*=R,M=S*(S+h*x+2*d)+x*(h*S+x+2*m)+p}else x=c,S=Math.max(0,-(h*x+d)),M=-S*S+x*(x+2*m)+p;else x=-c,S=Math.max(0,-(h*x+d)),M=-S*S+x*(x+2*m)+p;else x<=-b?(S=Math.max(0,-(-h*c+d)),x=S>0?-c:Math.min(Math.max(-c,-m),c),M=-S*S+x*(x+2*m)+p):x<=b?(S=0,x=Math.min(Math.max(-c,-m),c),M=x*(x+2*m)+p):(S=Math.max(0,-(h*c+d)),x=S>0?c:Math.min(Math.max(-c,-m),c),M=-S*S+x*(x+2*m)+p);else x=h>0?-c:c,S=Math.max(0,-(h*x+d)),M=-S*S+x*(x+2*m)+p;return r&&r.copy(this.origin).addScaledVector(this.direction,S),l&&l.copy(ih).addScaledVector(tu,x),M}intersectSphere(e,i){$i.subVectors(e.center,this.origin);const r=$i.dot(this.direction),l=$i.dot($i)-r*r,c=e.radius*e.radius;if(l>c)return null;const h=Math.sqrt(c-l),d=r-h,m=r+h;return m<0?null:d<0?this.at(m,i):this.at(d,i)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const i=e.normal.dot(this.direction);if(i===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/i;return r>=0?r:null}intersectPlane(e,i){const r=this.distanceToPlane(e);return r===null?null:this.at(r,i)}intersectsPlane(e){const i=e.distanceToPoint(this.origin);return i===0||e.normal.dot(this.direction)*i<0}intersectBox(e,i){let r,l,c,h,d,m;const p=1/this.direction.x,v=1/this.direction.y,S=1/this.direction.z,x=this.origin;return p>=0?(r=(e.min.x-x.x)*p,l=(e.max.x-x.x)*p):(r=(e.max.x-x.x)*p,l=(e.min.x-x.x)*p),v>=0?(c=(e.min.y-x.y)*v,h=(e.max.y-x.y)*v):(c=(e.max.y-x.y)*v,h=(e.min.y-x.y)*v),r>h||c>l||((c>r||isNaN(r))&&(r=c),(h<l||isNaN(l))&&(l=h),S>=0?(d=(e.min.z-x.z)*S,m=(e.max.z-x.z)*S):(d=(e.max.z-x.z)*S,m=(e.min.z-x.z)*S),r>m||d>l)||((d>r||r!==r)&&(r=d),(m<l||l!==l)&&(l=m),l<0)?null:this.at(r>=0?r:l,i)}intersectsBox(e){return this.intersectBox(e,$i)!==null}intersectTriangle(e,i,r,l,c){ah.subVectors(i,e),eu.subVectors(r,e),rh.crossVectors(ah,eu);let h=this.direction.dot(rh),d;if(h>0){if(l)return null;d=1}else if(h<0)d=-1,h=-h;else return null;Oa.subVectors(this.origin,e);const m=d*this.direction.dot(eu.crossVectors(Oa,eu));if(m<0)return null;const p=d*this.direction.dot(ah.cross(Oa));if(p<0||m+p>h)return null;const v=-d*Oa.dot(rh);return v<0?null:this.at(v/h,c)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class je{constructor(e,i,r,l,c,h,d,m,p,v,S,x,M,b,R,y){je.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,i,r,l,c,h,d,m,p,v,S,x,M,b,R,y)}set(e,i,r,l,c,h,d,m,p,v,S,x,M,b,R,y){const g=this.elements;return g[0]=e,g[4]=i,g[8]=r,g[12]=l,g[1]=c,g[5]=h,g[9]=d,g[13]=m,g[2]=p,g[6]=v,g[10]=S,g[14]=x,g[3]=M,g[7]=b,g[11]=R,g[15]=y,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new je().fromArray(this.elements)}copy(e){const i=this.elements,r=e.elements;return i[0]=r[0],i[1]=r[1],i[2]=r[2],i[3]=r[3],i[4]=r[4],i[5]=r[5],i[6]=r[6],i[7]=r[7],i[8]=r[8],i[9]=r[9],i[10]=r[10],i[11]=r[11],i[12]=r[12],i[13]=r[13],i[14]=r[14],i[15]=r[15],this}copyPosition(e){const i=this.elements,r=e.elements;return i[12]=r[12],i[13]=r[13],i[14]=r[14],this}setFromMatrix3(e){const i=e.elements;return this.set(i[0],i[3],i[6],0,i[1],i[4],i[7],0,i[2],i[5],i[8],0,0,0,0,1),this}extractBasis(e,i,r){return e.setFromMatrixColumn(this,0),i.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,i,r){return this.set(e.x,i.x,r.x,0,e.y,i.y,r.y,0,e.z,i.z,r.z,0,0,0,0,1),this}extractRotation(e){const i=this.elements,r=e.elements,l=1/ss.setFromMatrixColumn(e,0).length(),c=1/ss.setFromMatrixColumn(e,1).length(),h=1/ss.setFromMatrixColumn(e,2).length();return i[0]=r[0]*l,i[1]=r[1]*l,i[2]=r[2]*l,i[3]=0,i[4]=r[4]*c,i[5]=r[5]*c,i[6]=r[6]*c,i[7]=0,i[8]=r[8]*h,i[9]=r[9]*h,i[10]=r[10]*h,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromEuler(e){const i=this.elements,r=e.x,l=e.y,c=e.z,h=Math.cos(r),d=Math.sin(r),m=Math.cos(l),p=Math.sin(l),v=Math.cos(c),S=Math.sin(c);if(e.order==="XYZ"){const x=h*v,M=h*S,b=d*v,R=d*S;i[0]=m*v,i[4]=-m*S,i[8]=p,i[1]=M+b*p,i[5]=x-R*p,i[9]=-d*m,i[2]=R-x*p,i[6]=b+M*p,i[10]=h*m}else if(e.order==="YXZ"){const x=m*v,M=m*S,b=p*v,R=p*S;i[0]=x+R*d,i[4]=b*d-M,i[8]=h*p,i[1]=h*S,i[5]=h*v,i[9]=-d,i[2]=M*d-b,i[6]=R+x*d,i[10]=h*m}else if(e.order==="ZXY"){const x=m*v,M=m*S,b=p*v,R=p*S;i[0]=x-R*d,i[4]=-h*S,i[8]=b+M*d,i[1]=M+b*d,i[5]=h*v,i[9]=R-x*d,i[2]=-h*p,i[6]=d,i[10]=h*m}else if(e.order==="ZYX"){const x=h*v,M=h*S,b=d*v,R=d*S;i[0]=m*v,i[4]=b*p-M,i[8]=x*p+R,i[1]=m*S,i[5]=R*p+x,i[9]=M*p-b,i[2]=-p,i[6]=d*m,i[10]=h*m}else if(e.order==="YZX"){const x=h*m,M=h*p,b=d*m,R=d*p;i[0]=m*v,i[4]=R-x*S,i[8]=b*S+M,i[1]=S,i[5]=h*v,i[9]=-d*v,i[2]=-p*v,i[6]=M*S+b,i[10]=x-R*S}else if(e.order==="XZY"){const x=h*m,M=h*p,b=d*m,R=d*p;i[0]=m*v,i[4]=-S,i[8]=p*v,i[1]=x*S+R,i[5]=h*v,i[9]=M*S-b,i[2]=b*S-M,i[6]=d*v,i[10]=R*S+x}return i[3]=0,i[7]=0,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ey,e,Ty)}lookAt(e,i,r){const l=this.elements;return Qn.subVectors(e,i),Qn.lengthSq()===0&&(Qn.z=1),Qn.normalize(),za.crossVectors(r,Qn),za.lengthSq()===0&&(Math.abs(r.z)===1?Qn.x+=1e-4:Qn.z+=1e-4,Qn.normalize(),za.crossVectors(r,Qn)),za.normalize(),nu.crossVectors(Qn,za),l[0]=za.x,l[4]=nu.x,l[8]=Qn.x,l[1]=za.y,l[5]=nu.y,l[9]=Qn.y,l[2]=za.z,l[6]=nu.z,l[10]=Qn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,i){const r=e.elements,l=i.elements,c=this.elements,h=r[0],d=r[4],m=r[8],p=r[12],v=r[1],S=r[5],x=r[9],M=r[13],b=r[2],R=r[6],y=r[10],g=r[14],B=r[3],N=r[7],D=r[11],W=r[15],F=l[0],O=l[4],k=l[8],w=l[12],C=l[1],H=l[5],st=l[9],at=l[13],ct=l[2],dt=l[6],z=l[10],K=l[14],Z=l[3],xt=l[7],At=l[11],U=l[15];return c[0]=h*F+d*C+m*ct+p*Z,c[4]=h*O+d*H+m*dt+p*xt,c[8]=h*k+d*st+m*z+p*At,c[12]=h*w+d*at+m*K+p*U,c[1]=v*F+S*C+x*ct+M*Z,c[5]=v*O+S*H+x*dt+M*xt,c[9]=v*k+S*st+x*z+M*At,c[13]=v*w+S*at+x*K+M*U,c[2]=b*F+R*C+y*ct+g*Z,c[6]=b*O+R*H+y*dt+g*xt,c[10]=b*k+R*st+y*z+g*At,c[14]=b*w+R*at+y*K+g*U,c[3]=B*F+N*C+D*ct+W*Z,c[7]=B*O+N*H+D*dt+W*xt,c[11]=B*k+N*st+D*z+W*At,c[15]=B*w+N*at+D*K+W*U,this}multiplyScalar(e){const i=this.elements;return i[0]*=e,i[4]*=e,i[8]*=e,i[12]*=e,i[1]*=e,i[5]*=e,i[9]*=e,i[13]*=e,i[2]*=e,i[6]*=e,i[10]*=e,i[14]*=e,i[3]*=e,i[7]*=e,i[11]*=e,i[15]*=e,this}determinant(){const e=this.elements,i=e[0],r=e[4],l=e[8],c=e[12],h=e[1],d=e[5],m=e[9],p=e[13],v=e[2],S=e[6],x=e[10],M=e[14],b=e[3],R=e[7],y=e[11],g=e[15];return b*(+c*m*S-l*p*S-c*d*x+r*p*x+l*d*M-r*m*M)+R*(+i*m*M-i*p*x+c*h*x-l*h*M+l*p*v-c*m*v)+y*(+i*p*S-i*d*M-c*h*S+r*h*M+c*d*v-r*p*v)+g*(-l*d*v-i*m*S+i*d*x+l*h*S-r*h*x+r*m*v)}transpose(){const e=this.elements;let i;return i=e[1],e[1]=e[4],e[4]=i,i=e[2],e[2]=e[8],e[8]=i,i=e[6],e[6]=e[9],e[9]=i,i=e[3],e[3]=e[12],e[12]=i,i=e[7],e[7]=e[13],e[13]=i,i=e[11],e[11]=e[14],e[14]=i,this}setPosition(e,i,r){const l=this.elements;return e.isVector3?(l[12]=e.x,l[13]=e.y,l[14]=e.z):(l[12]=e,l[13]=i,l[14]=r),this}invert(){const e=this.elements,i=e[0],r=e[1],l=e[2],c=e[3],h=e[4],d=e[5],m=e[6],p=e[7],v=e[8],S=e[9],x=e[10],M=e[11],b=e[12],R=e[13],y=e[14],g=e[15],B=S*y*p-R*x*p+R*m*M-d*y*M-S*m*g+d*x*g,N=b*x*p-v*y*p-b*m*M+h*y*M+v*m*g-h*x*g,D=v*R*p-b*S*p+b*d*M-h*R*M-v*d*g+h*S*g,W=b*S*m-v*R*m-b*d*x+h*R*x+v*d*y-h*S*y,F=i*B+r*N+l*D+c*W;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/F;return e[0]=B*O,e[1]=(R*x*c-S*y*c-R*l*M+r*y*M+S*l*g-r*x*g)*O,e[2]=(d*y*c-R*m*c+R*l*p-r*y*p-d*l*g+r*m*g)*O,e[3]=(S*m*c-d*x*c-S*l*p+r*x*p+d*l*M-r*m*M)*O,e[4]=N*O,e[5]=(v*y*c-b*x*c+b*l*M-i*y*M-v*l*g+i*x*g)*O,e[6]=(b*m*c-h*y*c-b*l*p+i*y*p+h*l*g-i*m*g)*O,e[7]=(h*x*c-v*m*c+v*l*p-i*x*p-h*l*M+i*m*M)*O,e[8]=D*O,e[9]=(b*S*c-v*R*c-b*r*M+i*R*M+v*r*g-i*S*g)*O,e[10]=(h*R*c-b*d*c+b*r*p-i*R*p-h*r*g+i*d*g)*O,e[11]=(v*d*c-h*S*c-v*r*p+i*S*p+h*r*M-i*d*M)*O,e[12]=W*O,e[13]=(v*R*l-b*S*l+b*r*x-i*R*x-v*r*y+i*S*y)*O,e[14]=(b*d*l-h*R*l-b*r*m+i*R*m+h*r*y-i*d*y)*O,e[15]=(h*S*l-v*d*l+v*r*m-i*S*m-h*r*x+i*d*x)*O,this}scale(e){const i=this.elements,r=e.x,l=e.y,c=e.z;return i[0]*=r,i[4]*=l,i[8]*=c,i[1]*=r,i[5]*=l,i[9]*=c,i[2]*=r,i[6]*=l,i[10]*=c,i[3]*=r,i[7]*=l,i[11]*=c,this}getMaxScaleOnAxis(){const e=this.elements,i=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],l=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(i,r,l))}makeTranslation(e,i,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,i,0,0,1,r,0,0,0,1),this}makeRotationX(e){const i=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,i,-r,0,0,r,i,0,0,0,0,1),this}makeRotationY(e){const i=Math.cos(e),r=Math.sin(e);return this.set(i,0,r,0,0,1,0,0,-r,0,i,0,0,0,0,1),this}makeRotationZ(e){const i=Math.cos(e),r=Math.sin(e);return this.set(i,-r,0,0,r,i,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,i){const r=Math.cos(i),l=Math.sin(i),c=1-r,h=e.x,d=e.y,m=e.z,p=c*h,v=c*d;return this.set(p*h+r,p*d-l*m,p*m+l*d,0,p*d+l*m,v*d+r,v*m-l*h,0,p*m-l*d,v*m+l*h,c*m*m+r,0,0,0,0,1),this}makeScale(e,i,r){return this.set(e,0,0,0,0,i,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,i,r,l,c,h){return this.set(1,r,c,0,e,1,h,0,i,l,1,0,0,0,0,1),this}compose(e,i,r){const l=this.elements,c=i._x,h=i._y,d=i._z,m=i._w,p=c+c,v=h+h,S=d+d,x=c*p,M=c*v,b=c*S,R=h*v,y=h*S,g=d*S,B=m*p,N=m*v,D=m*S,W=r.x,F=r.y,O=r.z;return l[0]=(1-(R+g))*W,l[1]=(M+D)*W,l[2]=(b-N)*W,l[3]=0,l[4]=(M-D)*F,l[5]=(1-(x+g))*F,l[6]=(y+B)*F,l[7]=0,l[8]=(b+N)*O,l[9]=(y-B)*O,l[10]=(1-(x+R))*O,l[11]=0,l[12]=e.x,l[13]=e.y,l[14]=e.z,l[15]=1,this}decompose(e,i,r){const l=this.elements;let c=ss.set(l[0],l[1],l[2]).length();const h=ss.set(l[4],l[5],l[6]).length(),d=ss.set(l[8],l[9],l[10]).length();this.determinant()<0&&(c=-c),e.x=l[12],e.y=l[13],e.z=l[14],_i.copy(this);const p=1/c,v=1/h,S=1/d;return _i.elements[0]*=p,_i.elements[1]*=p,_i.elements[2]*=p,_i.elements[4]*=v,_i.elements[5]*=v,_i.elements[6]*=v,_i.elements[8]*=S,_i.elements[9]*=S,_i.elements[10]*=S,i.setFromRotationMatrix(_i),r.x=c,r.y=h,r.z=d,this}makePerspective(e,i,r,l,c,h,d=oa){const m=this.elements,p=2*c/(i-e),v=2*c/(r-l),S=(i+e)/(i-e),x=(r+l)/(r-l);let M,b;if(d===oa)M=-(h+c)/(h-c),b=-2*h*c/(h-c);else if(d===Ru)M=-h/(h-c),b=-h*c/(h-c);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return m[0]=p,m[4]=0,m[8]=S,m[12]=0,m[1]=0,m[5]=v,m[9]=x,m[13]=0,m[2]=0,m[6]=0,m[10]=M,m[14]=b,m[3]=0,m[7]=0,m[11]=-1,m[15]=0,this}makeOrthographic(e,i,r,l,c,h,d=oa){const m=this.elements,p=1/(i-e),v=1/(r-l),S=1/(h-c),x=(i+e)*p,M=(r+l)*v;let b,R;if(d===oa)b=(h+c)*S,R=-2*S;else if(d===Ru)b=c*S,R=-1*S;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return m[0]=2*p,m[4]=0,m[8]=0,m[12]=-x,m[1]=0,m[5]=2*v,m[9]=0,m[13]=-M,m[2]=0,m[6]=0,m[10]=R,m[14]=-b,m[3]=0,m[7]=0,m[11]=0,m[15]=1,this}equals(e){const i=this.elements,r=e.elements;for(let l=0;l<16;l++)if(i[l]!==r[l])return!1;return!0}fromArray(e,i=0){for(let r=0;r<16;r++)this.elements[r]=e[r+i];return this}toArray(e=[],i=0){const r=this.elements;return e[i]=r[0],e[i+1]=r[1],e[i+2]=r[2],e[i+3]=r[3],e[i+4]=r[4],e[i+5]=r[5],e[i+6]=r[6],e[i+7]=r[7],e[i+8]=r[8],e[i+9]=r[9],e[i+10]=r[10],e[i+11]=r[11],e[i+12]=r[12],e[i+13]=r[13],e[i+14]=r[14],e[i+15]=r[15],e}}const ss=new et,_i=new je,Ey=new et(0,0,0),Ty=new et(1,1,1),za=new et,nu=new et,Qn=new et,D_=new je,U_=new Io;class Ni{constructor(e=0,i=0,r=0,l=Ni.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=i,this._z=r,this._order=l}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,i,r,l=this._order){return this._x=e,this._y=i,this._z=r,this._order=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,i=this._order,r=!0){const l=e.elements,c=l[0],h=l[4],d=l[8],m=l[1],p=l[5],v=l[9],S=l[2],x=l[6],M=l[10];switch(i){case"XYZ":this._y=Math.asin(xe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-v,M),this._z=Math.atan2(-h,c)):(this._x=Math.atan2(x,p),this._z=0);break;case"YXZ":this._x=Math.asin(-xe(v,-1,1)),Math.abs(v)<.9999999?(this._y=Math.atan2(d,M),this._z=Math.atan2(m,p)):(this._y=Math.atan2(-S,c),this._z=0);break;case"ZXY":this._x=Math.asin(xe(x,-1,1)),Math.abs(x)<.9999999?(this._y=Math.atan2(-S,M),this._z=Math.atan2(-h,p)):(this._y=0,this._z=Math.atan2(m,c));break;case"ZYX":this._y=Math.asin(-xe(S,-1,1)),Math.abs(S)<.9999999?(this._x=Math.atan2(x,M),this._z=Math.atan2(m,c)):(this._x=0,this._z=Math.atan2(-h,p));break;case"YZX":this._z=Math.asin(xe(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(-v,p),this._y=Math.atan2(-S,c)):(this._x=0,this._y=Math.atan2(d,M));break;case"XZY":this._z=Math.asin(-xe(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(x,p),this._y=Math.atan2(d,c)):(this._x=Math.atan2(-v,M),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,i,r){return D_.makeRotationFromQuaternion(e),this.setFromRotationMatrix(D_,i,r)}setFromVector3(e,i=this._order){return this.set(e.x,e.y,e.z,i)}reorder(e){return U_.setFromEuler(this),this.setFromQuaternion(U_,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],i=0){return e[i]=this._x,e[i+1]=this._y,e[i+2]=this._z,e[i+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ni.DEFAULT_ORDER="XYZ";class Vv{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let by=0;const L_=new et,os=new Io,ta=new je,iu=new et,Ao=new et,Ay=new et,Ry=new Io,N_=new et(1,0,0),O_=new et(0,1,0),z_=new et(0,0,1),P_={type:"added"},Cy={type:"removed"},ls={type:"childadded",child:null},sh={type:"childremoved",child:null};class En extends Ts{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:by++}),this.uuid=Bo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=En.DEFAULT_UP.clone();const e=new et,i=new Ni,r=new Io,l=new et(1,1,1);function c(){r.setFromEuler(i,!1)}function h(){i.setFromQuaternion(r,void 0,!1)}i._onChange(c),r._onChange(h),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:l},modelViewMatrix:{value:new je},normalMatrix:{value:new oe}}),this.matrix=new je,this.matrixWorld=new je,this.matrixAutoUpdate=En.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=En.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Vv,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,i){this.quaternion.setFromAxisAngle(e,i)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,i){return os.setFromAxisAngle(e,i),this.quaternion.multiply(os),this}rotateOnWorldAxis(e,i){return os.setFromAxisAngle(e,i),this.quaternion.premultiply(os),this}rotateX(e){return this.rotateOnAxis(N_,e)}rotateY(e){return this.rotateOnAxis(O_,e)}rotateZ(e){return this.rotateOnAxis(z_,e)}translateOnAxis(e,i){return L_.copy(e).applyQuaternion(this.quaternion),this.position.add(L_.multiplyScalar(i)),this}translateX(e){return this.translateOnAxis(N_,e)}translateY(e){return this.translateOnAxis(O_,e)}translateZ(e){return this.translateOnAxis(z_,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ta.copy(this.matrixWorld).invert())}lookAt(e,i,r){e.isVector3?iu.copy(e):iu.set(e,i,r);const l=this.parent;this.updateWorldMatrix(!0,!1),Ao.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ta.lookAt(Ao,iu,this.up):ta.lookAt(iu,Ao,this.up),this.quaternion.setFromRotationMatrix(ta),l&&(ta.extractRotation(l.matrixWorld),os.setFromRotationMatrix(ta),this.quaternion.premultiply(os.invert()))}add(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(P_),ls.child=e,this.dispatchEvent(ls),ls.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const i=this.children.indexOf(e);return i!==-1&&(e.parent=null,this.children.splice(i,1),e.dispatchEvent(Cy),sh.child=e,this.dispatchEvent(sh),sh.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ta.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ta.multiply(e.parent.matrixWorld)),e.applyMatrix4(ta),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(P_),ls.child=e,this.dispatchEvent(ls),ls.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,i){if(this[e]===i)return this;for(let r=0,l=this.children.length;r<l;r++){const h=this.children[r].getObjectByProperty(e,i);if(h!==void 0)return h}}getObjectsByProperty(e,i,r=[]){this[e]===i&&r.push(this);const l=this.children;for(let c=0,h=l.length;c<h;c++)l[c].getObjectsByProperty(e,i,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ao,e,Ay),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ao,Ry,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const i=this.matrixWorld.elements;return e.set(i[8],i[9],i[10]).normalize()}raycast(){}traverse(e){e(this);const i=this.children;for(let r=0,l=i.length;r<l;r++)i[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const i=this.children;for(let r=0,l=i.length;r<l;r++)i[r].traverseVisible(e)}traverseAncestors(e){const i=this.parent;i!==null&&(e(i),i.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const i=this.children;for(let r=0,l=i.length;r<l;r++)i[r].updateMatrixWorld(e)}updateWorldMatrix(e,i){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),i===!0){const l=this.children;for(let c=0,h=l.length;c<h;c++)l[c].updateWorldMatrix(!1,!0)}}toJSON(e){const i=e===void 0||typeof e=="string",r={};i&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const l={};l.uuid=this.uuid,l.type=this.type,this.name!==""&&(l.name=this.name),this.castShadow===!0&&(l.castShadow=!0),this.receiveShadow===!0&&(l.receiveShadow=!0),this.visible===!1&&(l.visible=!1),this.frustumCulled===!1&&(l.frustumCulled=!1),this.renderOrder!==0&&(l.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(l.userData=this.userData),l.layers=this.layers.mask,l.matrix=this.matrix.toArray(),l.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(l.matrixAutoUpdate=!1),this.isInstancedMesh&&(l.type="InstancedMesh",l.count=this.count,l.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(l.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(l.type="BatchedMesh",l.perObjectFrustumCulled=this.perObjectFrustumCulled,l.sortObjects=this.sortObjects,l.drawRanges=this._drawRanges,l.reservedRanges=this._reservedRanges,l.geometryInfo=this._geometryInfo.map(d=>({...d,boundingBox:d.boundingBox?d.boundingBox.toJSON():void 0,boundingSphere:d.boundingSphere?d.boundingSphere.toJSON():void 0})),l.instanceInfo=this._instanceInfo.map(d=>({...d})),l.availableInstanceIds=this._availableInstanceIds.slice(),l.availableGeometryIds=this._availableGeometryIds.slice(),l.nextIndexStart=this._nextIndexStart,l.nextVertexStart=this._nextVertexStart,l.geometryCount=this._geometryCount,l.maxInstanceCount=this._maxInstanceCount,l.maxVertexCount=this._maxVertexCount,l.maxIndexCount=this._maxIndexCount,l.geometryInitialized=this._geometryInitialized,l.matricesTexture=this._matricesTexture.toJSON(e),l.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(l.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(l.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(l.boundingBox=this.boundingBox.toJSON()));function c(d,m){return d[m.uuid]===void 0&&(d[m.uuid]=m.toJSON(e)),m.uuid}if(this.isScene)this.background&&(this.background.isColor?l.background=this.background.toJSON():this.background.isTexture&&(l.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(l.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){l.geometry=c(e.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const m=d.shapes;if(Array.isArray(m))for(let p=0,v=m.length;p<v;p++){const S=m[p];c(e.shapes,S)}else c(e.shapes,m)}}if(this.isSkinnedMesh&&(l.bindMode=this.bindMode,l.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(c(e.skeletons,this.skeleton),l.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let m=0,p=this.material.length;m<p;m++)d.push(c(e.materials,this.material[m]));l.material=d}else l.material=c(e.materials,this.material);if(this.children.length>0){l.children=[];for(let d=0;d<this.children.length;d++)l.children.push(this.children[d].toJSON(e).object)}if(this.animations.length>0){l.animations=[];for(let d=0;d<this.animations.length;d++){const m=this.animations[d];l.animations.push(c(e.animations,m))}}if(i){const d=h(e.geometries),m=h(e.materials),p=h(e.textures),v=h(e.images),S=h(e.shapes),x=h(e.skeletons),M=h(e.animations),b=h(e.nodes);d.length>0&&(r.geometries=d),m.length>0&&(r.materials=m),p.length>0&&(r.textures=p),v.length>0&&(r.images=v),S.length>0&&(r.shapes=S),x.length>0&&(r.skeletons=x),M.length>0&&(r.animations=M),b.length>0&&(r.nodes=b)}return r.object=l,r;function h(d){const m=[];for(const p in d){const v=d[p];delete v.metadata,m.push(v)}return m}}clone(e){return new this.constructor().copy(this,e)}copy(e,i=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),i===!0)for(let r=0;r<e.children.length;r++){const l=e.children[r];this.add(l.clone())}return this}}En.DEFAULT_UP=new et(0,1,0);En.DEFAULT_MATRIX_AUTO_UPDATE=!0;En.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const vi=new et,ea=new et,oh=new et,na=new et,us=new et,cs=new et,B_=new et,lh=new et,uh=new et,ch=new et,fh=new $e,hh=new $e,dh=new $e;class Si{constructor(e=new et,i=new et,r=new et){this.a=e,this.b=i,this.c=r}static getNormal(e,i,r,l){l.subVectors(r,i),vi.subVectors(e,i),l.cross(vi);const c=l.lengthSq();return c>0?l.multiplyScalar(1/Math.sqrt(c)):l.set(0,0,0)}static getBarycoord(e,i,r,l,c){vi.subVectors(l,i),ea.subVectors(r,i),oh.subVectors(e,i);const h=vi.dot(vi),d=vi.dot(ea),m=vi.dot(oh),p=ea.dot(ea),v=ea.dot(oh),S=h*p-d*d;if(S===0)return c.set(0,0,0),null;const x=1/S,M=(p*m-d*v)*x,b=(h*v-d*m)*x;return c.set(1-M-b,b,M)}static containsPoint(e,i,r,l){return this.getBarycoord(e,i,r,l,na)===null?!1:na.x>=0&&na.y>=0&&na.x+na.y<=1}static getInterpolation(e,i,r,l,c,h,d,m){return this.getBarycoord(e,i,r,l,na)===null?(m.x=0,m.y=0,"z"in m&&(m.z=0),"w"in m&&(m.w=0),null):(m.setScalar(0),m.addScaledVector(c,na.x),m.addScaledVector(h,na.y),m.addScaledVector(d,na.z),m)}static getInterpolatedAttribute(e,i,r,l,c,h){return fh.setScalar(0),hh.setScalar(0),dh.setScalar(0),fh.fromBufferAttribute(e,i),hh.fromBufferAttribute(e,r),dh.fromBufferAttribute(e,l),h.setScalar(0),h.addScaledVector(fh,c.x),h.addScaledVector(hh,c.y),h.addScaledVector(dh,c.z),h}static isFrontFacing(e,i,r,l){return vi.subVectors(r,i),ea.subVectors(e,i),vi.cross(ea).dot(l)<0}set(e,i,r){return this.a.copy(e),this.b.copy(i),this.c.copy(r),this}setFromPointsAndIndices(e,i,r,l){return this.a.copy(e[i]),this.b.copy(e[r]),this.c.copy(e[l]),this}setFromAttributeAndIndices(e,i,r,l){return this.a.fromBufferAttribute(e,i),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,l),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return vi.subVectors(this.c,this.b),ea.subVectors(this.a,this.b),vi.cross(ea).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Si.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,i){return Si.getBarycoord(e,this.a,this.b,this.c,i)}getInterpolation(e,i,r,l,c){return Si.getInterpolation(e,this.a,this.b,this.c,i,r,l,c)}containsPoint(e){return Si.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Si.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,i){const r=this.a,l=this.b,c=this.c;let h,d;us.subVectors(l,r),cs.subVectors(c,r),lh.subVectors(e,r);const m=us.dot(lh),p=cs.dot(lh);if(m<=0&&p<=0)return i.copy(r);uh.subVectors(e,l);const v=us.dot(uh),S=cs.dot(uh);if(v>=0&&S<=v)return i.copy(l);const x=m*S-v*p;if(x<=0&&m>=0&&v<=0)return h=m/(m-v),i.copy(r).addScaledVector(us,h);ch.subVectors(e,c);const M=us.dot(ch),b=cs.dot(ch);if(b>=0&&M<=b)return i.copy(c);const R=M*p-m*b;if(R<=0&&p>=0&&b<=0)return d=p/(p-b),i.copy(r).addScaledVector(cs,d);const y=v*b-M*S;if(y<=0&&S-v>=0&&M-b>=0)return B_.subVectors(c,l),d=(S-v)/(S-v+(M-b)),i.copy(l).addScaledVector(B_,d);const g=1/(y+R+x);return h=R*g,d=x*g,i.copy(r).addScaledVector(us,h).addScaledVector(cs,d)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Xv={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Pa={h:0,s:0,l:0},au={h:0,s:0,l:0};function ph(o,e,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?o+(e-o)*6*i:i<1/2?e:i<2/3?o+(e-o)*6*(2/3-i):o}class ye{constructor(e,i,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,i,r)}set(e,i,r){if(i===void 0&&r===void 0){const l=e;l&&l.isColor?this.copy(l):typeof l=="number"?this.setHex(l):typeof l=="string"&&this.setStyle(l)}else this.setRGB(e,i,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,i=$n){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Re.colorSpaceToWorking(this,i),this}setRGB(e,i,r,l=Re.workingColorSpace){return this.r=e,this.g=i,this.b=r,Re.colorSpaceToWorking(this,l),this}setHSL(e,i,r,l=Re.workingColorSpace){if(e=fy(e,1),i=xe(i,0,1),r=xe(r,0,1),i===0)this.r=this.g=this.b=r;else{const c=r<=.5?r*(1+i):r+i-r*i,h=2*r-c;this.r=ph(h,c,e+1/3),this.g=ph(h,c,e),this.b=ph(h,c,e-1/3)}return Re.colorSpaceToWorking(this,l),this}setStyle(e,i=$n){function r(c){c!==void 0&&parseFloat(c)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let l;if(l=/^(\w+)\(([^\)]*)\)/.exec(e)){let c;const h=l[1],d=l[2];switch(h){case"rgb":case"rgba":if(c=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(c[4]),this.setRGB(Math.min(255,parseInt(c[1],10))/255,Math.min(255,parseInt(c[2],10))/255,Math.min(255,parseInt(c[3],10))/255,i);if(c=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(c[4]),this.setRGB(Math.min(100,parseInt(c[1],10))/100,Math.min(100,parseInt(c[2],10))/100,Math.min(100,parseInt(c[3],10))/100,i);break;case"hsl":case"hsla":if(c=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(c[4]),this.setHSL(parseFloat(c[1])/360,parseFloat(c[2])/100,parseFloat(c[3])/100,i);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(l=/^\#([A-Fa-f\d]+)$/.exec(e)){const c=l[1],h=c.length;if(h===3)return this.setRGB(parseInt(c.charAt(0),16)/15,parseInt(c.charAt(1),16)/15,parseInt(c.charAt(2),16)/15,i);if(h===6)return this.setHex(parseInt(c,16),i);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,i);return this}setColorName(e,i=$n){const r=Xv[e.toLowerCase()];return r!==void 0?this.setHex(r,i):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=la(e.r),this.g=la(e.g),this.b=la(e.b),this}copyLinearToSRGB(e){return this.r=vs(e.r),this.g=vs(e.g),this.b=vs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=$n){return Re.workingToColorSpace(wn.copy(this),e),Math.round(xe(wn.r*255,0,255))*65536+Math.round(xe(wn.g*255,0,255))*256+Math.round(xe(wn.b*255,0,255))}getHexString(e=$n){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,i=Re.workingColorSpace){Re.workingToColorSpace(wn.copy(this),i);const r=wn.r,l=wn.g,c=wn.b,h=Math.max(r,l,c),d=Math.min(r,l,c);let m,p;const v=(d+h)/2;if(d===h)m=0,p=0;else{const S=h-d;switch(p=v<=.5?S/(h+d):S/(2-h-d),h){case r:m=(l-c)/S+(l<c?6:0);break;case l:m=(c-r)/S+2;break;case c:m=(r-l)/S+4;break}m/=6}return e.h=m,e.s=p,e.l=v,e}getRGB(e,i=Re.workingColorSpace){return Re.workingToColorSpace(wn.copy(this),i),e.r=wn.r,e.g=wn.g,e.b=wn.b,e}getStyle(e=$n){Re.workingToColorSpace(wn.copy(this),e);const i=wn.r,r=wn.g,l=wn.b;return e!==$n?`color(${e} ${i.toFixed(3)} ${r.toFixed(3)} ${l.toFixed(3)})`:`rgb(${Math.round(i*255)},${Math.round(r*255)},${Math.round(l*255)})`}offsetHSL(e,i,r){return this.getHSL(Pa),this.setHSL(Pa.h+e,Pa.s+i,Pa.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,i){return this.r=e.r+i.r,this.g=e.g+i.g,this.b=e.b+i.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,i){return this.r+=(e.r-this.r)*i,this.g+=(e.g-this.g)*i,this.b+=(e.b-this.b)*i,this}lerpColors(e,i,r){return this.r=e.r+(i.r-e.r)*r,this.g=e.g+(i.g-e.g)*r,this.b=e.b+(i.b-e.b)*r,this}lerpHSL(e,i){this.getHSL(Pa),e.getHSL(au);const r=Kf(Pa.h,au.h,i),l=Kf(Pa.s,au.s,i),c=Kf(Pa.l,au.l,i);return this.setHSL(r,l,c),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const i=this.r,r=this.g,l=this.b,c=e.elements;return this.r=c[0]*i+c[3]*r+c[6]*l,this.g=c[1]*i+c[4]*r+c[7]*l,this.b=c[2]*i+c[5]*r+c[8]*l,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,i=0){return this.r=e[i],this.g=e[i+1],this.b=e[i+2],this}toArray(e=[],i=0){return e[i]=this.r,e[i+1]=this.g,e[i+2]=this.b,e}fromBufferAttribute(e,i){return this.r=e.getX(i),this.g=e.getY(i),this.b=e.getZ(i),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const wn=new ye;ye.NAMES=Xv;let wy=0;class bs extends Ts{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wy++}),this.uuid=Bo(),this.name="",this.type="Material",this.blending=gs,this.side=Ga,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ch,this.blendDst=wh,this.blendEquation=gr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ye(0,0,0),this.blendAlpha=0,this.depthFunc=Ss,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=E_,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=es,this.stencilZFail=es,this.stencilZPass=es,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const i in e){const r=e[i];if(r===void 0){console.warn(`THREE.Material: parameter '${i}' has value of undefined.`);continue}const l=this[i];if(l===void 0){console.warn(`THREE.Material: '${i}' is not a property of THREE.${this.type}.`);continue}l&&l.isColor?l.set(r):l&&l.isVector3&&r&&r.isVector3?l.copy(r):this[i]=r}}toJSON(e){const i=e===void 0||typeof e=="string";i&&(e={textures:{},images:{}});const r={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==gs&&(r.blending=this.blending),this.side!==Ga&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==Ch&&(r.blendSrc=this.blendSrc),this.blendDst!==wh&&(r.blendDst=this.blendDst),this.blendEquation!==gr&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==Ss&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==E_&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==es&&(r.stencilFail=this.stencilFail),this.stencilZFail!==es&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==es&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function l(c){const h=[];for(const d in c){const m=c[d];delete m.metadata,h.push(m)}return h}if(i){const c=l(e.textures),h=l(e.images);c.length>0&&(r.textures=c),h.length>0&&(r.images=h)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const i=e.clippingPlanes;let r=null;if(i!==null){const l=i.length;r=new Array(l);for(let c=0;c!==l;++c)r[c]=i[c].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class kv extends bs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ni,this.combine=Rv,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ln=new et,ru=new Ce;let Dy=0;class Ui{constructor(e,i,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Dy++}),this.name="",this.array=e,this.itemSize=i,this.count=e!==void 0?e.length/i:0,this.normalized=r,this.usage=T_,this.updateRanges=[],this.gpuType=sa,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,i){this.updateRanges.push({start:e,count:i})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,i,r){e*=this.itemSize,r*=i.itemSize;for(let l=0,c=this.itemSize;l<c;l++)this.array[e+l]=i.array[r+l];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let i=0,r=this.count;i<r;i++)ru.fromBufferAttribute(this,i),ru.applyMatrix3(e),this.setXY(i,ru.x,ru.y);else if(this.itemSize===3)for(let i=0,r=this.count;i<r;i++)ln.fromBufferAttribute(this,i),ln.applyMatrix3(e),this.setXYZ(i,ln.x,ln.y,ln.z);return this}applyMatrix4(e){for(let i=0,r=this.count;i<r;i++)ln.fromBufferAttribute(this,i),ln.applyMatrix4(e),this.setXYZ(i,ln.x,ln.y,ln.z);return this}applyNormalMatrix(e){for(let i=0,r=this.count;i<r;i++)ln.fromBufferAttribute(this,i),ln.applyNormalMatrix(e),this.setXYZ(i,ln.x,ln.y,ln.z);return this}transformDirection(e){for(let i=0,r=this.count;i<r;i++)ln.fromBufferAttribute(this,i),ln.transformDirection(e),this.setXYZ(i,ln.x,ln.y,ln.z);return this}set(e,i=0){return this.array.set(e,i),this}getComponent(e,i){let r=this.array[e*this.itemSize+i];return this.normalized&&(r=Eo(r,this.array)),r}setComponent(e,i,r){return this.normalized&&(r=Gn(r,this.array)),this.array[e*this.itemSize+i]=r,this}getX(e){let i=this.array[e*this.itemSize];return this.normalized&&(i=Eo(i,this.array)),i}setX(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize]=i,this}getY(e){let i=this.array[e*this.itemSize+1];return this.normalized&&(i=Eo(i,this.array)),i}setY(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize+1]=i,this}getZ(e){let i=this.array[e*this.itemSize+2];return this.normalized&&(i=Eo(i,this.array)),i}setZ(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize+2]=i,this}getW(e){let i=this.array[e*this.itemSize+3];return this.normalized&&(i=Eo(i,this.array)),i}setW(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize+3]=i,this}setXY(e,i,r){return e*=this.itemSize,this.normalized&&(i=Gn(i,this.array),r=Gn(r,this.array)),this.array[e+0]=i,this.array[e+1]=r,this}setXYZ(e,i,r,l){return e*=this.itemSize,this.normalized&&(i=Gn(i,this.array),r=Gn(r,this.array),l=Gn(l,this.array)),this.array[e+0]=i,this.array[e+1]=r,this.array[e+2]=l,this}setXYZW(e,i,r,l,c){return e*=this.itemSize,this.normalized&&(i=Gn(i,this.array),r=Gn(r,this.array),l=Gn(l,this.array),c=Gn(c,this.array)),this.array[e+0]=i,this.array[e+1]=r,this.array[e+2]=l,this.array[e+3]=c,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==T_&&(e.usage=this.usage),e}}class Wv extends Ui{constructor(e,i,r){super(new Uint16Array(e),i,r)}}class qv extends Ui{constructor(e,i,r){super(new Uint32Array(e),i,r)}}class Tn extends Ui{constructor(e,i,r){super(new Float32Array(e),i,r)}}let Uy=0;const li=new je,mh=new En,fs=new et,Jn=new Fo,Ro=new Fo,mn=new et;class Ei extends Ts{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Uy++}),this.uuid=Bo(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Fv(e)?qv:Wv)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,i){return this.attributes[e]=i,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,i,r=0){this.groups.push({start:e,count:i,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,i){this.drawRange.start=e,this.drawRange.count=i}applyMatrix4(e){const i=this.attributes.position;i!==void 0&&(i.applyMatrix4(e),i.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const c=new oe().getNormalMatrix(e);r.applyNormalMatrix(c),r.needsUpdate=!0}const l=this.attributes.tangent;return l!==void 0&&(l.transformDirection(e),l.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return li.makeRotationFromQuaternion(e),this.applyMatrix4(li),this}rotateX(e){return li.makeRotationX(e),this.applyMatrix4(li),this}rotateY(e){return li.makeRotationY(e),this.applyMatrix4(li),this}rotateZ(e){return li.makeRotationZ(e),this.applyMatrix4(li),this}translate(e,i,r){return li.makeTranslation(e,i,r),this.applyMatrix4(li),this}scale(e,i,r){return li.makeScale(e,i,r),this.applyMatrix4(li),this}lookAt(e){return mh.lookAt(e),mh.updateMatrix(),this.applyMatrix4(mh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(fs).negate(),this.translate(fs.x,fs.y,fs.z),this}setFromPoints(e){const i=this.getAttribute("position");if(i===void 0){const r=[];for(let l=0,c=e.length;l<c;l++){const h=e[l];r.push(h.x,h.y,h.z||0)}this.setAttribute("position",new Tn(r,3))}else{const r=Math.min(e.length,i.count);for(let l=0;l<r;l++){const c=e[l];i.setXYZ(l,c.x,c.y,c.z||0)}e.length>i.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),i.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fo);const e=this.attributes.position,i=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new et(-1/0,-1/0,-1/0),new et(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),i)for(let r=0,l=i.length;r<l;r++){const c=i[r];Jn.setFromBufferAttribute(c),this.morphTargetsRelative?(mn.addVectors(this.boundingBox.min,Jn.min),this.boundingBox.expandByPoint(mn),mn.addVectors(this.boundingBox.max,Jn.max),this.boundingBox.expandByPoint(mn)):(this.boundingBox.expandByPoint(Jn.min),this.boundingBox.expandByPoint(Jn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Lu);const e=this.attributes.position,i=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new et,1/0);return}if(e){const r=this.boundingSphere.center;if(Jn.setFromBufferAttribute(e),i)for(let c=0,h=i.length;c<h;c++){const d=i[c];Ro.setFromBufferAttribute(d),this.morphTargetsRelative?(mn.addVectors(Jn.min,Ro.min),Jn.expandByPoint(mn),mn.addVectors(Jn.max,Ro.max),Jn.expandByPoint(mn)):(Jn.expandByPoint(Ro.min),Jn.expandByPoint(Ro.max))}Jn.getCenter(r);let l=0;for(let c=0,h=e.count;c<h;c++)mn.fromBufferAttribute(e,c),l=Math.max(l,r.distanceToSquared(mn));if(i)for(let c=0,h=i.length;c<h;c++){const d=i[c],m=this.morphTargetsRelative;for(let p=0,v=d.count;p<v;p++)mn.fromBufferAttribute(d,p),m&&(fs.fromBufferAttribute(e,p),mn.add(fs)),l=Math.max(l,r.distanceToSquared(mn))}this.boundingSphere.radius=Math.sqrt(l),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,i=this.attributes;if(e===null||i.position===void 0||i.normal===void 0||i.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=i.position,l=i.normal,c=i.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ui(new Float32Array(4*r.count),4));const h=this.getAttribute("tangent"),d=[],m=[];for(let k=0;k<r.count;k++)d[k]=new et,m[k]=new et;const p=new et,v=new et,S=new et,x=new Ce,M=new Ce,b=new Ce,R=new et,y=new et;function g(k,w,C){p.fromBufferAttribute(r,k),v.fromBufferAttribute(r,w),S.fromBufferAttribute(r,C),x.fromBufferAttribute(c,k),M.fromBufferAttribute(c,w),b.fromBufferAttribute(c,C),v.sub(p),S.sub(p),M.sub(x),b.sub(x);const H=1/(M.x*b.y-b.x*M.y);isFinite(H)&&(R.copy(v).multiplyScalar(b.y).addScaledVector(S,-M.y).multiplyScalar(H),y.copy(S).multiplyScalar(M.x).addScaledVector(v,-b.x).multiplyScalar(H),d[k].add(R),d[w].add(R),d[C].add(R),m[k].add(y),m[w].add(y),m[C].add(y))}let B=this.groups;B.length===0&&(B=[{start:0,count:e.count}]);for(let k=0,w=B.length;k<w;++k){const C=B[k],H=C.start,st=C.count;for(let at=H,ct=H+st;at<ct;at+=3)g(e.getX(at+0),e.getX(at+1),e.getX(at+2))}const N=new et,D=new et,W=new et,F=new et;function O(k){W.fromBufferAttribute(l,k),F.copy(W);const w=d[k];N.copy(w),N.sub(W.multiplyScalar(W.dot(w))).normalize(),D.crossVectors(F,w);const H=D.dot(m[k])<0?-1:1;h.setXYZW(k,N.x,N.y,N.z,H)}for(let k=0,w=B.length;k<w;++k){const C=B[k],H=C.start,st=C.count;for(let at=H,ct=H+st;at<ct;at+=3)O(e.getX(at+0)),O(e.getX(at+1)),O(e.getX(at+2))}}computeVertexNormals(){const e=this.index,i=this.getAttribute("position");if(i!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new Ui(new Float32Array(i.count*3),3),this.setAttribute("normal",r);else for(let x=0,M=r.count;x<M;x++)r.setXYZ(x,0,0,0);const l=new et,c=new et,h=new et,d=new et,m=new et,p=new et,v=new et,S=new et;if(e)for(let x=0,M=e.count;x<M;x+=3){const b=e.getX(x+0),R=e.getX(x+1),y=e.getX(x+2);l.fromBufferAttribute(i,b),c.fromBufferAttribute(i,R),h.fromBufferAttribute(i,y),v.subVectors(h,c),S.subVectors(l,c),v.cross(S),d.fromBufferAttribute(r,b),m.fromBufferAttribute(r,R),p.fromBufferAttribute(r,y),d.add(v),m.add(v),p.add(v),r.setXYZ(b,d.x,d.y,d.z),r.setXYZ(R,m.x,m.y,m.z),r.setXYZ(y,p.x,p.y,p.z)}else for(let x=0,M=i.count;x<M;x+=3)l.fromBufferAttribute(i,x+0),c.fromBufferAttribute(i,x+1),h.fromBufferAttribute(i,x+2),v.subVectors(h,c),S.subVectors(l,c),v.cross(S),r.setXYZ(x+0,v.x,v.y,v.z),r.setXYZ(x+1,v.x,v.y,v.z),r.setXYZ(x+2,v.x,v.y,v.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let i=0,r=e.count;i<r;i++)mn.fromBufferAttribute(e,i),mn.normalize(),e.setXYZ(i,mn.x,mn.y,mn.z)}toNonIndexed(){function e(d,m){const p=d.array,v=d.itemSize,S=d.normalized,x=new p.constructor(m.length*v);let M=0,b=0;for(let R=0,y=m.length;R<y;R++){d.isInterleavedBufferAttribute?M=m[R]*d.data.stride+d.offset:M=m[R]*v;for(let g=0;g<v;g++)x[b++]=p[M++]}return new Ui(x,v,S)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const i=new Ei,r=this.index.array,l=this.attributes;for(const d in l){const m=l[d],p=e(m,r);i.setAttribute(d,p)}const c=this.morphAttributes;for(const d in c){const m=[],p=c[d];for(let v=0,S=p.length;v<S;v++){const x=p[v],M=e(x,r);m.push(M)}i.morphAttributes[d]=m}i.morphTargetsRelative=this.morphTargetsRelative;const h=this.groups;for(let d=0,m=h.length;d<m;d++){const p=h[d];i.addGroup(p.start,p.count,p.materialIndex)}return i}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const m=this.parameters;for(const p in m)m[p]!==void 0&&(e[p]=m[p]);return e}e.data={attributes:{}};const i=this.index;i!==null&&(e.data.index={type:i.array.constructor.name,array:Array.prototype.slice.call(i.array)});const r=this.attributes;for(const m in r){const p=r[m];e.data.attributes[m]=p.toJSON(e.data)}const l={};let c=!1;for(const m in this.morphAttributes){const p=this.morphAttributes[m],v=[];for(let S=0,x=p.length;S<x;S++){const M=p[S];v.push(M.toJSON(e.data))}v.length>0&&(l[m]=v,c=!0)}c&&(e.data.morphAttributes=l,e.data.morphTargetsRelative=this.morphTargetsRelative);const h=this.groups;h.length>0&&(e.data.groups=JSON.parse(JSON.stringify(h)));const d=this.boundingSphere;return d!==null&&(e.data.boundingSphere=d.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const i={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone());const l=e.attributes;for(const p in l){const v=l[p];this.setAttribute(p,v.clone(i))}const c=e.morphAttributes;for(const p in c){const v=[],S=c[p];for(let x=0,M=S.length;x<M;x++)v.push(S[x].clone(i));this.morphAttributes[p]=v}this.morphTargetsRelative=e.morphTargetsRelative;const h=e.groups;for(let p=0,v=h.length;p<v;p++){const S=h[p];this.addGroup(S.start,S.count,S.materialIndex)}const d=e.boundingBox;d!==null&&(this.boundingBox=d.clone());const m=e.boundingSphere;return m!==null&&(this.boundingSphere=m.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const I_=new je,cr=new Gv,su=new Lu,F_=new et,ou=new et,lu=new et,uu=new et,gh=new et,cu=new et,H_=new et,fu=new et;class yi extends En{constructor(e=new Ei,i=new kv){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=i,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,i){return super.copy(e,i),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const i=this.geometry.morphAttributes,r=Object.keys(i);if(r.length>0){const l=i[r[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,h=l.length;c<h;c++){const d=l[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=c}}}}getVertexPosition(e,i){const r=this.geometry,l=r.attributes.position,c=r.morphAttributes.position,h=r.morphTargetsRelative;i.fromBufferAttribute(l,e);const d=this.morphTargetInfluences;if(c&&d){cu.set(0,0,0);for(let m=0,p=c.length;m<p;m++){const v=d[m],S=c[m];v!==0&&(gh.fromBufferAttribute(S,e),h?cu.addScaledVector(gh,v):cu.addScaledVector(gh.sub(i),v))}i.add(cu)}return i}raycast(e,i){const r=this.geometry,l=this.material,c=this.matrixWorld;l!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),su.copy(r.boundingSphere),su.applyMatrix4(c),cr.copy(e.ray).recast(e.near),!(su.containsPoint(cr.origin)===!1&&(cr.intersectSphere(su,F_)===null||cr.origin.distanceToSquared(F_)>(e.far-e.near)**2))&&(I_.copy(c).invert(),cr.copy(e.ray).applyMatrix4(I_),!(r.boundingBox!==null&&cr.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,i,cr)))}_computeIntersections(e,i,r){let l;const c=this.geometry,h=this.material,d=c.index,m=c.attributes.position,p=c.attributes.uv,v=c.attributes.uv1,S=c.attributes.normal,x=c.groups,M=c.drawRange;if(d!==null)if(Array.isArray(h))for(let b=0,R=x.length;b<R;b++){const y=x[b],g=h[y.materialIndex],B=Math.max(y.start,M.start),N=Math.min(d.count,Math.min(y.start+y.count,M.start+M.count));for(let D=B,W=N;D<W;D+=3){const F=d.getX(D),O=d.getX(D+1),k=d.getX(D+2);l=hu(this,g,e,r,p,v,S,F,O,k),l&&(l.faceIndex=Math.floor(D/3),l.face.materialIndex=y.materialIndex,i.push(l))}}else{const b=Math.max(0,M.start),R=Math.min(d.count,M.start+M.count);for(let y=b,g=R;y<g;y+=3){const B=d.getX(y),N=d.getX(y+1),D=d.getX(y+2);l=hu(this,h,e,r,p,v,S,B,N,D),l&&(l.faceIndex=Math.floor(y/3),i.push(l))}}else if(m!==void 0)if(Array.isArray(h))for(let b=0,R=x.length;b<R;b++){const y=x[b],g=h[y.materialIndex],B=Math.max(y.start,M.start),N=Math.min(m.count,Math.min(y.start+y.count,M.start+M.count));for(let D=B,W=N;D<W;D+=3){const F=D,O=D+1,k=D+2;l=hu(this,g,e,r,p,v,S,F,O,k),l&&(l.faceIndex=Math.floor(D/3),l.face.materialIndex=y.materialIndex,i.push(l))}}else{const b=Math.max(0,M.start),R=Math.min(m.count,M.start+M.count);for(let y=b,g=R;y<g;y+=3){const B=y,N=y+1,D=y+2;l=hu(this,h,e,r,p,v,S,B,N,D),l&&(l.faceIndex=Math.floor(y/3),i.push(l))}}}}function Ly(o,e,i,r,l,c,h,d){let m;if(e.side===Vn?m=r.intersectTriangle(h,c,l,!0,d):m=r.intersectTriangle(l,c,h,e.side===Ga,d),m===null)return null;fu.copy(d),fu.applyMatrix4(o.matrixWorld);const p=i.ray.origin.distanceTo(fu);return p<i.near||p>i.far?null:{distance:p,point:fu.clone(),object:o}}function hu(o,e,i,r,l,c,h,d,m,p){o.getVertexPosition(d,ou),o.getVertexPosition(m,lu),o.getVertexPosition(p,uu);const v=Ly(o,e,i,r,ou,lu,uu,H_);if(v){const S=new et;Si.getBarycoord(H_,ou,lu,uu,S),l&&(v.uv=Si.getInterpolatedAttribute(l,d,m,p,S,new Ce)),c&&(v.uv1=Si.getInterpolatedAttribute(c,d,m,p,S,new Ce)),h&&(v.normal=Si.getInterpolatedAttribute(h,d,m,p,S,new et),v.normal.dot(r.direction)>0&&v.normal.multiplyScalar(-1));const x={a:d,b:m,c:p,normal:new et,materialIndex:0};Si.getNormal(ou,lu,uu,x.normal),v.face=x,v.barycoord=S}return v}class As extends Ei{constructor(e=1,i=1,r=1,l=1,c=1,h=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:i,depth:r,widthSegments:l,heightSegments:c,depthSegments:h};const d=this;l=Math.floor(l),c=Math.floor(c),h=Math.floor(h);const m=[],p=[],v=[],S=[];let x=0,M=0;b("z","y","x",-1,-1,r,i,e,h,c,0),b("z","y","x",1,-1,r,i,-e,h,c,1),b("x","z","y",1,1,e,r,i,l,h,2),b("x","z","y",1,-1,e,r,-i,l,h,3),b("x","y","z",1,-1,e,i,r,l,c,4),b("x","y","z",-1,-1,e,i,-r,l,c,5),this.setIndex(m),this.setAttribute("position",new Tn(p,3)),this.setAttribute("normal",new Tn(v,3)),this.setAttribute("uv",new Tn(S,2));function b(R,y,g,B,N,D,W,F,O,k,w){const C=D/O,H=W/k,st=D/2,at=W/2,ct=F/2,dt=O+1,z=k+1;let K=0,Z=0;const xt=new et;for(let At=0;At<z;At++){const U=At*H-at;for(let nt=0;nt<dt;nt++){const St=nt*C-st;xt[R]=St*B,xt[y]=U*N,xt[g]=ct,p.push(xt.x,xt.y,xt.z),xt[R]=0,xt[y]=0,xt[g]=F>0?1:-1,v.push(xt.x,xt.y,xt.z),S.push(nt/O),S.push(1-At/k),K+=1}}for(let At=0;At<k;At++)for(let U=0;U<O;U++){const nt=x+U+dt*At,St=x+U+dt*(At+1),j=x+(U+1)+dt*(At+1),ft=x+(U+1)+dt*At;m.push(nt,St,ft),m.push(St,j,ft),Z+=6}d.addGroup(M,Z,w),M+=Z,x+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new As(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Es(o){const e={};for(const i in o){e[i]={};for(const r in o[i]){const l=o[i][r];l&&(l.isColor||l.isMatrix3||l.isMatrix4||l.isVector2||l.isVector3||l.isVector4||l.isTexture||l.isQuaternion)?l.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[i][r]=null):e[i][r]=l.clone():Array.isArray(l)?e[i][r]=l.slice():e[i][r]=l}}return e}function Nn(o){const e={};for(let i=0;i<o.length;i++){const r=Es(o[i]);for(const l in r)e[l]=r[l]}return e}function Ny(o){const e=[];for(let i=0;i<o.length;i++)e.push(o[i].clone());return e}function Yv(o){const e=o.getRenderTarget();return e===null?o.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Re.workingColorSpace}const Oy={clone:Es,merge:Nn};var zy=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Py=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Va extends bs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zy,this.fragmentShader=Py,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Es(e.uniforms),this.uniformsGroups=Ny(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const i=super.toJSON(e);i.glslVersion=this.glslVersion,i.uniforms={};for(const l in this.uniforms){const h=this.uniforms[l].value;h&&h.isTexture?i.uniforms[l]={type:"t",value:h.toJSON(e).uuid}:h&&h.isColor?i.uniforms[l]={type:"c",value:h.getHex()}:h&&h.isVector2?i.uniforms[l]={type:"v2",value:h.toArray()}:h&&h.isVector3?i.uniforms[l]={type:"v3",value:h.toArray()}:h&&h.isVector4?i.uniforms[l]={type:"v4",value:h.toArray()}:h&&h.isMatrix3?i.uniforms[l]={type:"m3",value:h.toArray()}:h&&h.isMatrix4?i.uniforms[l]={type:"m4",value:h.toArray()}:i.uniforms[l]={value:h}}Object.keys(this.defines).length>0&&(i.defines=this.defines),i.vertexShader=this.vertexShader,i.fragmentShader=this.fragmentShader,i.lights=this.lights,i.clipping=this.clipping;const r={};for(const l in this.extensions)this.extensions[l]===!0&&(r[l]=!0);return Object.keys(r).length>0&&(i.extensions=r),i}}class jv extends En{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new je,this.projectionMatrix=new je,this.projectionMatrixInverse=new je,this.coordinateSystem=oa}copy(e,i){return super.copy(e,i),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,i){super.updateWorldMatrix(e,i),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ba=new et,G_=new Ce,V_=new Ce;class ui extends jv{constructor(e=50,i=1,r=.1,l=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=l,this.focus=10,this.aspect=i,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,i){return super.copy(e,i),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const i=.5*this.getFilmHeight()/e;this.fov=dd*2*Math.atan(i),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Zf*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return dd*2*Math.atan(Math.tan(Zf*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,i,r){Ba.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ba.x,Ba.y).multiplyScalar(-e/Ba.z),Ba.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(Ba.x,Ba.y).multiplyScalar(-e/Ba.z)}getViewSize(e,i){return this.getViewBounds(e,G_,V_),i.subVectors(V_,G_)}setViewOffset(e,i,r,l,c,h){this.aspect=e/i,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=i,this.view.offsetX=r,this.view.offsetY=l,this.view.width=c,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let i=e*Math.tan(Zf*.5*this.fov)/this.zoom,r=2*i,l=this.aspect*r,c=-.5*l;const h=this.view;if(this.view!==null&&this.view.enabled){const m=h.fullWidth,p=h.fullHeight;c+=h.offsetX*l/m,i-=h.offsetY*r/p,l*=h.width/m,r*=h.height/p}const d=this.filmOffset;d!==0&&(c+=e*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(c,c+l,i,i-r,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const i=super.toJSON(e);return i.object.fov=this.fov,i.object.zoom=this.zoom,i.object.near=this.near,i.object.far=this.far,i.object.focus=this.focus,i.object.aspect=this.aspect,this.view!==null&&(i.object.view=Object.assign({},this.view)),i.object.filmGauge=this.filmGauge,i.object.filmOffset=this.filmOffset,i}}const hs=-90,ds=1;class By extends En{constructor(e,i,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const l=new ui(hs,ds,e,i);l.layers=this.layers,this.add(l);const c=new ui(hs,ds,e,i);c.layers=this.layers,this.add(c);const h=new ui(hs,ds,e,i);h.layers=this.layers,this.add(h);const d=new ui(hs,ds,e,i);d.layers=this.layers,this.add(d);const m=new ui(hs,ds,e,i);m.layers=this.layers,this.add(m);const p=new ui(hs,ds,e,i);p.layers=this.layers,this.add(p)}updateCoordinateSystem(){const e=this.coordinateSystem,i=this.children.concat(),[r,l,c,h,d,m]=i;for(const p of i)this.remove(p);if(e===oa)r.up.set(0,1,0),r.lookAt(1,0,0),l.up.set(0,1,0),l.lookAt(-1,0,0),c.up.set(0,0,-1),c.lookAt(0,1,0),h.up.set(0,0,1),h.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),m.up.set(0,1,0),m.lookAt(0,0,-1);else if(e===Ru)r.up.set(0,-1,0),r.lookAt(-1,0,0),l.up.set(0,-1,0),l.lookAt(1,0,0),c.up.set(0,0,1),c.lookAt(0,1,0),h.up.set(0,0,-1),h.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),m.up.set(0,-1,0),m.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const p of i)this.add(p),p.updateMatrixWorld()}update(e,i){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:l}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[c,h,d,m,p,v]=this.children,S=e.getRenderTarget(),x=e.getActiveCubeFace(),M=e.getActiveMipmapLevel(),b=e.xr.enabled;e.xr.enabled=!1;const R=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,l),e.render(i,c),e.setRenderTarget(r,1,l),e.render(i,h),e.setRenderTarget(r,2,l),e.render(i,d),e.setRenderTarget(r,3,l),e.render(i,m),e.setRenderTarget(r,4,l),e.render(i,p),r.texture.generateMipmaps=R,e.setRenderTarget(r,5,l),e.render(i,v),e.setRenderTarget(S,x,M),e.xr.enabled=b,r.texture.needsPMREMUpdate=!0}}class Zv extends Xn{constructor(e=[],i=xs,r,l,c,h,d,m,p,v){super(e,i,r,l,c,h,d,m,p,v),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Iy extends yr{constructor(e=1,i={}){super(e,e,i),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},l=[r,r,r,r,r,r];this.texture=new Zv(l),this._setTextureOptions(i),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,i){this.texture.type=i.type,this.texture.colorSpace=i.colorSpace,this.texture.generateMipmaps=i.generateMipmaps,this.texture.minFilter=i.minFilter,this.texture.magFilter=i.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},l=new As(5,5,5),c=new Va({name:"CubemapFromEquirect",uniforms:Es(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:Vn,blending:Fa});c.uniforms.tEquirect.value=i;const h=new yi(l,c),d=i.minFilter;return i.minFilter===Sr&&(i.minFilter=Di),new By(1,10,this).update(e,h),i.minFilter=d,h.geometry.dispose(),h.material.dispose(),this}clear(e,i=!0,r=!0,l=!0){const c=e.getRenderTarget();for(let h=0;h<6;h++)e.setRenderTarget(this,h),e.clear(i,r,l);e.setRenderTarget(c)}}class Do extends En{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Fy={type:"move"};class _h{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Do,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Do,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new et,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new et),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Do,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new et,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new et),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const i=this._hand;if(i)for(const r of e.hand.values())this._getHandJoint(i,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,i,r){let l=null,c=null,h=null;const d=this._targetRay,m=this._grip,p=this._hand;if(e&&i.session.visibilityState!=="visible-blurred"){if(p&&e.hand){h=!0;for(const R of e.hand.values()){const y=i.getJointPose(R,r),g=this._getHandJoint(p,R);y!==null&&(g.matrix.fromArray(y.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=y.radius),g.visible=y!==null}const v=p.joints["index-finger-tip"],S=p.joints["thumb-tip"],x=v.position.distanceTo(S.position),M=.02,b=.005;p.inputState.pinching&&x>M+b?(p.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!p.inputState.pinching&&x<=M-b&&(p.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else m!==null&&e.gripSpace&&(c=i.getPose(e.gripSpace,r),c!==null&&(m.matrix.fromArray(c.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,c.linearVelocity?(m.hasLinearVelocity=!0,m.linearVelocity.copy(c.linearVelocity)):m.hasLinearVelocity=!1,c.angularVelocity?(m.hasAngularVelocity=!0,m.angularVelocity.copy(c.angularVelocity)):m.hasAngularVelocity=!1));d!==null&&(l=i.getPose(e.targetRaySpace,r),l===null&&c!==null&&(l=c),l!==null&&(d.matrix.fromArray(l.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,l.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(l.linearVelocity)):d.hasLinearVelocity=!1,l.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(l.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(Fy)))}return d!==null&&(d.visible=l!==null),m!==null&&(m.visible=c!==null),p!==null&&(p.visible=h!==null),this}_getHandJoint(e,i){if(e.joints[i.jointName]===void 0){const r=new Do;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[i.jointName]=r,e.add(r)}return e.joints[i.jointName]}}class Hy extends En{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ni,this.environmentIntensity=1,this.environmentRotation=new Ni,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,i){return super.copy(e,i),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const i=super.toJSON(e);return this.fog!==null&&(i.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(i.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(i.object.backgroundIntensity=this.backgroundIntensity),i.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(i.object.environmentIntensity=this.environmentIntensity),i.object.environmentRotation=this.environmentRotation.toArray(),i}}const vh=new et,Gy=new et,Vy=new oe;class pr{constructor(e=new et(1,0,0),i=0){this.isPlane=!0,this.normal=e,this.constant=i}set(e,i){return this.normal.copy(e),this.constant=i,this}setComponents(e,i,r,l){return this.normal.set(e,i,r),this.constant=l,this}setFromNormalAndCoplanarPoint(e,i){return this.normal.copy(e),this.constant=-i.dot(this.normal),this}setFromCoplanarPoints(e,i,r){const l=vh.subVectors(r,i).cross(Gy.subVectors(e,i)).normalize();return this.setFromNormalAndCoplanarPoint(l,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,i){return i.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,i){const r=e.delta(vh),l=this.normal.dot(r);if(l===0)return this.distanceToPoint(e.start)===0?i.copy(e.start):null;const c=-(e.start.dot(this.normal)+this.constant)/l;return c<0||c>1?null:i.copy(e.start).addScaledVector(r,c)}intersectsLine(e){const i=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return i<0&&r>0||r<0&&i>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,i){const r=i||Vy.getNormalMatrix(e),l=this.coplanarPoint(vh).applyMatrix4(e),c=this.normal.applyMatrix3(r).normalize();return this.constant=-l.dot(c),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const fr=new Lu,Xy=new Ce(.5,.5),du=new et;class Td{constructor(e=new pr,i=new pr,r=new pr,l=new pr,c=new pr,h=new pr){this.planes=[e,i,r,l,c,h]}set(e,i,r,l,c,h){const d=this.planes;return d[0].copy(e),d[1].copy(i),d[2].copy(r),d[3].copy(l),d[4].copy(c),d[5].copy(h),this}copy(e){const i=this.planes;for(let r=0;r<6;r++)i[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,i=oa){const r=this.planes,l=e.elements,c=l[0],h=l[1],d=l[2],m=l[3],p=l[4],v=l[5],S=l[6],x=l[7],M=l[8],b=l[9],R=l[10],y=l[11],g=l[12],B=l[13],N=l[14],D=l[15];if(r[0].setComponents(m-c,x-p,y-M,D-g).normalize(),r[1].setComponents(m+c,x+p,y+M,D+g).normalize(),r[2].setComponents(m+h,x+v,y+b,D+B).normalize(),r[3].setComponents(m-h,x-v,y-b,D-B).normalize(),r[4].setComponents(m-d,x-S,y-R,D-N).normalize(),i===oa)r[5].setComponents(m+d,x+S,y+R,D+N).normalize();else if(i===Ru)r[5].setComponents(d,S,R,N).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+i);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),fr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const i=e.geometry;i.boundingSphere===null&&i.computeBoundingSphere(),fr.copy(i.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(fr)}intersectsSprite(e){fr.center.set(0,0,0);const i=Xy.distanceTo(e.center);return fr.radius=.7071067811865476+i,fr.applyMatrix4(e.matrixWorld),this.intersectsSphere(fr)}intersectsSphere(e){const i=this.planes,r=e.center,l=-e.radius;for(let c=0;c<6;c++)if(i[c].distanceToPoint(r)<l)return!1;return!0}intersectsBox(e){const i=this.planes;for(let r=0;r<6;r++){const l=i[r];if(du.x=l.normal.x>0?e.max.x:e.min.x,du.y=l.normal.y>0?e.max.y:e.min.y,du.z=l.normal.z>0?e.max.z:e.min.z,l.distanceToPoint(du)<0)return!1}return!0}containsPoint(e){const i=this.planes;for(let r=0;r<6;r++)if(i[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Kv extends bs{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ye(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const wu=new et,Du=new et,X_=new je,Co=new Gv,pu=new Lu,Sh=new et,k_=new et;class ky extends En{constructor(e=new Ei,i=new Kv){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=i,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,i){return super.copy(e,i),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const i=e.attributes.position,r=[0];for(let l=1,c=i.count;l<c;l++)wu.fromBufferAttribute(i,l-1),Du.fromBufferAttribute(i,l),r[l]=r[l-1],r[l]+=wu.distanceTo(Du);e.setAttribute("lineDistance",new Tn(r,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,i){const r=this.geometry,l=this.matrixWorld,c=e.params.Line.threshold,h=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),pu.copy(r.boundingSphere),pu.applyMatrix4(l),pu.radius+=c,e.ray.intersectsSphere(pu)===!1)return;X_.copy(l).invert(),Co.copy(e.ray).applyMatrix4(X_);const d=c/((this.scale.x+this.scale.y+this.scale.z)/3),m=d*d,p=this.isLineSegments?2:1,v=r.index,x=r.attributes.position;if(v!==null){const M=Math.max(0,h.start),b=Math.min(v.count,h.start+h.count);for(let R=M,y=b-1;R<y;R+=p){const g=v.getX(R),B=v.getX(R+1),N=mu(this,e,Co,m,g,B,R);N&&i.push(N)}if(this.isLineLoop){const R=v.getX(b-1),y=v.getX(M),g=mu(this,e,Co,m,R,y,b-1);g&&i.push(g)}}else{const M=Math.max(0,h.start),b=Math.min(x.count,h.start+h.count);for(let R=M,y=b-1;R<y;R+=p){const g=mu(this,e,Co,m,R,R+1,R);g&&i.push(g)}if(this.isLineLoop){const R=mu(this,e,Co,m,b-1,M,b-1);R&&i.push(R)}}}updateMorphTargets(){const i=this.geometry.morphAttributes,r=Object.keys(i);if(r.length>0){const l=i[r[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,h=l.length;c<h;c++){const d=l[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=c}}}}}function mu(o,e,i,r,l,c,h){const d=o.geometry.attributes.position;if(wu.fromBufferAttribute(d,l),Du.fromBufferAttribute(d,c),i.distanceSqToSegment(wu,Du,Sh,k_)>r)return;Sh.applyMatrix4(o.matrixWorld);const p=e.ray.origin.distanceTo(Sh);if(!(p<e.near||p>e.far))return{distance:p,point:k_.clone().applyMatrix4(o.matrixWorld),index:h,face:null,faceIndex:null,barycoord:null,object:o}}const W_=new et,q_=new et;class Wy extends ky{constructor(e,i){super(e,i),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const i=e.attributes.position,r=[];for(let l=0,c=i.count;l<c;l+=2)W_.fromBufferAttribute(i,l),q_.fromBufferAttribute(i,l+1),r[l]=l===0?0:r[l-1],r[l+1]=r[l]+W_.distanceTo(q_);e.setAttribute("lineDistance",new Tn(r,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Qv extends Xn{constructor(e,i,r=xr,l,c,h,d=Mi,m=Mi,p,v=Oo,S=1){if(v!==Oo&&v!==zo)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const x={width:e,height:i,depth:S};super(x,l,c,h,d,m,v,r,p),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ed(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const i=super.toJSON(e);return this.compareFunction!==null&&(i.compareFunction=this.compareFunction),i}}class bd extends Ei{constructor(e=1,i=1,r=1,l=32,c=1,h=!1,d=0,m=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:i,height:r,radialSegments:l,heightSegments:c,openEnded:h,thetaStart:d,thetaLength:m};const p=this;l=Math.floor(l),c=Math.floor(c);const v=[],S=[],x=[],M=[];let b=0;const R=[],y=r/2;let g=0;B(),h===!1&&(e>0&&N(!0),i>0&&N(!1)),this.setIndex(v),this.setAttribute("position",new Tn(S,3)),this.setAttribute("normal",new Tn(x,3)),this.setAttribute("uv",new Tn(M,2));function B(){const D=new et,W=new et;let F=0;const O=(i-e)/r;for(let k=0;k<=c;k++){const w=[],C=k/c,H=C*(i-e)+e;for(let st=0;st<=l;st++){const at=st/l,ct=at*m+d,dt=Math.sin(ct),z=Math.cos(ct);W.x=H*dt,W.y=-C*r+y,W.z=H*z,S.push(W.x,W.y,W.z),D.set(dt,O,z).normalize(),x.push(D.x,D.y,D.z),M.push(at,1-C),w.push(b++)}R.push(w)}for(let k=0;k<l;k++)for(let w=0;w<c;w++){const C=R[w][k],H=R[w+1][k],st=R[w+1][k+1],at=R[w][k+1];(e>0||w!==0)&&(v.push(C,H,at),F+=3),(i>0||w!==c-1)&&(v.push(H,st,at),F+=3)}p.addGroup(g,F,0),g+=F}function N(D){const W=b,F=new Ce,O=new et;let k=0;const w=D===!0?e:i,C=D===!0?1:-1;for(let st=1;st<=l;st++)S.push(0,y*C,0),x.push(0,C,0),M.push(.5,.5),b++;const H=b;for(let st=0;st<=l;st++){const ct=st/l*m+d,dt=Math.cos(ct),z=Math.sin(ct);O.x=w*z,O.y=y*C,O.z=w*dt,S.push(O.x,O.y,O.z),x.push(0,C,0),F.x=dt*.5+.5,F.y=z*.5*C+.5,M.push(F.x,F.y),b++}for(let st=0;st<l;st++){const at=W+st,ct=H+st;D===!0?v.push(ct,ct+1,at):v.push(ct+1,ct,at),k+=3}p.addGroup(g,k,D===!0?1:2),g+=k}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bd(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Nu extends Ei{constructor(e=1,i=1,r=1,l=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:i,widthSegments:r,heightSegments:l};const c=e/2,h=i/2,d=Math.floor(r),m=Math.floor(l),p=d+1,v=m+1,S=e/d,x=i/m,M=[],b=[],R=[],y=[];for(let g=0;g<v;g++){const B=g*x-h;for(let N=0;N<p;N++){const D=N*S-c;b.push(D,-B,0),R.push(0,0,1),y.push(N/d),y.push(1-g/m)}}for(let g=0;g<m;g++)for(let B=0;B<d;B++){const N=B+p*g,D=B+p*(g+1),W=B+1+p*(g+1),F=B+1+p*g;M.push(N,D,F),M.push(D,W,F)}this.setIndex(M),this.setAttribute("position",new Tn(b,3)),this.setAttribute("normal",new Tn(R,3)),this.setAttribute("uv",new Tn(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Nu(e.width,e.height,e.widthSegments,e.heightSegments)}}class Ad extends Ei{constructor(e=1,i=32,r=16,l=0,c=Math.PI*2,h=0,d=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:i,heightSegments:r,phiStart:l,phiLength:c,thetaStart:h,thetaLength:d},i=Math.max(3,Math.floor(i)),r=Math.max(2,Math.floor(r));const m=Math.min(h+d,Math.PI);let p=0;const v=[],S=new et,x=new et,M=[],b=[],R=[],y=[];for(let g=0;g<=r;g++){const B=[],N=g/r;let D=0;g===0&&h===0?D=.5/i:g===r&&m===Math.PI&&(D=-.5/i);for(let W=0;W<=i;W++){const F=W/i;S.x=-e*Math.cos(l+F*c)*Math.sin(h+N*d),S.y=e*Math.cos(h+N*d),S.z=e*Math.sin(l+F*c)*Math.sin(h+N*d),b.push(S.x,S.y,S.z),x.copy(S).normalize(),R.push(x.x,x.y,x.z),y.push(F+D,1-N),B.push(p++)}v.push(B)}for(let g=0;g<r;g++)for(let B=0;B<i;B++){const N=v[g][B+1],D=v[g][B],W=v[g+1][B],F=v[g+1][B+1];(g!==0||h>0)&&M.push(N,D,F),(g!==r-1||m<Math.PI)&&M.push(D,W,F)}this.setIndex(M),this.setAttribute("position",new Tn(b,3)),this.setAttribute("normal",new Tn(R,3)),this.setAttribute("uv",new Tn(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ad(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class qy extends bs{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ye(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Bv,this.normalScale=new Ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ni,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Yy extends bs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ey,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class jy extends bs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Jv extends En{constructor(e,i=1){super(),this.isLight=!0,this.type="Light",this.color=new ye(e),this.intensity=i}dispose(){}copy(e,i){return super.copy(e,i),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const i=super.toJSON(e);return i.object.color=this.color.getHex(),i.object.intensity=this.intensity,this.groundColor!==void 0&&(i.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(i.object.distance=this.distance),this.angle!==void 0&&(i.object.angle=this.angle),this.decay!==void 0&&(i.object.decay=this.decay),this.penumbra!==void 0&&(i.object.penumbra=this.penumbra),this.shadow!==void 0&&(i.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(i.object.target=this.target.uuid),i}}const xh=new je,Y_=new et,j_=new et;class Zy{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ce(512,512),this.mapType=Li,this.map=null,this.mapPass=null,this.matrix=new je,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Td,this._frameExtents=new Ce(1,1),this._viewportCount=1,this._viewports=[new $e(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const i=this.camera,r=this.matrix;Y_.setFromMatrixPosition(e.matrixWorld),i.position.copy(Y_),j_.setFromMatrixPosition(e.target.matrixWorld),i.lookAt(j_),i.updateMatrixWorld(),xh.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xh),r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(xh)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class $v extends jv{constructor(e=-1,i=1,r=1,l=-1,c=.1,h=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=i,this.top=r,this.bottom=l,this.near=c,this.far=h,this.updateProjectionMatrix()}copy(e,i){return super.copy(e,i),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,i,r,l,c,h){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=i,this.view.offsetX=r,this.view.offsetY=l,this.view.width=c,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),i=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,l=(this.top+this.bottom)/2;let c=r-e,h=r+e,d=l+i,m=l-i;if(this.view!==null&&this.view.enabled){const p=(this.right-this.left)/this.view.fullWidth/this.zoom,v=(this.top-this.bottom)/this.view.fullHeight/this.zoom;c+=p*this.view.offsetX,h=c+p*this.view.width,d-=v*this.view.offsetY,m=d-v*this.view.height}this.projectionMatrix.makeOrthographic(c,h,d,m,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const i=super.toJSON(e);return i.object.zoom=this.zoom,i.object.left=this.left,i.object.right=this.right,i.object.top=this.top,i.object.bottom=this.bottom,i.object.near=this.near,i.object.far=this.far,this.view!==null&&(i.object.view=Object.assign({},this.view)),i}}class Ky extends Zy{constructor(){super(new $v(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Qy extends Jv{constructor(e,i){super(e,i),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(En.DEFAULT_UP),this.updateMatrix(),this.target=new En,this.shadow=new Ky}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Jy extends Jv{constructor(e,i){super(e,i),this.isAmbientLight=!0,this.type="AmbientLight"}}class $y extends ui{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class tM extends Wy{constructor(e=10,i=10,r=4473924,l=8947848){r=new ye(r),l=new ye(l);const c=i/2,h=e/i,d=e/2,m=[],p=[];for(let x=0,M=0,b=-d;x<=i;x++,b+=h){m.push(-d,0,b,d,0,b),m.push(b,0,-d,b,0,d);const R=x===c?r:l;R.toArray(p,M),M+=3,R.toArray(p,M),M+=3,R.toArray(p,M),M+=3,R.toArray(p,M),M+=3}const v=new Ei;v.setAttribute("position",new Tn(m,3)),v.setAttribute("color",new Tn(p,3));const S=new Kv({vertexColors:!0,toneMapped:!1});super(v,S),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}function Z_(o,e,i,r){const l=eM(r);switch(i){case Lv:return o*e;case Ov:return o*e/l.components*l.byteLength;case xd:return o*e/l.components*l.byteLength;case zv:return o*e*2/l.components*l.byteLength;case yd:return o*e*2/l.components*l.byteLength;case Nv:return o*e*3/l.components*l.byteLength;case xi:return o*e*4/l.components*l.byteLength;case Md:return o*e*4/l.components*l.byteLength;case Su:case xu:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*8;case yu:case Mu:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*16;case Vh:case kh:return Math.max(o,16)*Math.max(e,8)/4;case Gh:case Xh:return Math.max(o,8)*Math.max(e,8)/2;case Wh:case qh:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*8;case Yh:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*16;case jh:return Math.floor((o+3)/4)*Math.floor((e+3)/4)*16;case Zh:return Math.floor((o+4)/5)*Math.floor((e+3)/4)*16;case Kh:return Math.floor((o+4)/5)*Math.floor((e+4)/5)*16;case Qh:return Math.floor((o+5)/6)*Math.floor((e+4)/5)*16;case Jh:return Math.floor((o+5)/6)*Math.floor((e+5)/6)*16;case $h:return Math.floor((o+7)/8)*Math.floor((e+4)/5)*16;case td:return Math.floor((o+7)/8)*Math.floor((e+5)/6)*16;case ed:return Math.floor((o+7)/8)*Math.floor((e+7)/8)*16;case nd:return Math.floor((o+9)/10)*Math.floor((e+4)/5)*16;case id:return Math.floor((o+9)/10)*Math.floor((e+5)/6)*16;case ad:return Math.floor((o+9)/10)*Math.floor((e+7)/8)*16;case rd:return Math.floor((o+9)/10)*Math.floor((e+9)/10)*16;case sd:return Math.floor((o+11)/12)*Math.floor((e+9)/10)*16;case od:return Math.floor((o+11)/12)*Math.floor((e+11)/12)*16;case Eu:case ld:case ud:return Math.ceil(o/4)*Math.ceil(e/4)*16;case Pv:case cd:return Math.ceil(o/4)*Math.ceil(e/4)*8;case fd:case hd:return Math.ceil(o/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${i} format.`)}function eM(o){switch(o){case Li:case wv:return{byteLength:1,components:1};case Lo:case Dv:case Po:return{byteLength:2,components:1};case vd:case Sd:return{byteLength:2,components:4};case xr:case _d:case sa:return{byteLength:4,components:1};case Uv:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${o}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:gd}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=gd);function t0(){let o=null,e=!1,i=null,r=null;function l(c,h){i(c,h),r=o.requestAnimationFrame(l)}return{start:function(){e!==!0&&i!==null&&(r=o.requestAnimationFrame(l),e=!0)},stop:function(){o.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(c){i=c},setContext:function(c){o=c}}}function nM(o){const e=new WeakMap;function i(d,m){const p=d.array,v=d.usage,S=p.byteLength,x=o.createBuffer();o.bindBuffer(m,x),o.bufferData(m,p,v),d.onUploadCallback();let M;if(p instanceof Float32Array)M=o.FLOAT;else if(typeof Float16Array<"u"&&p instanceof Float16Array)M=o.HALF_FLOAT;else if(p instanceof Uint16Array)d.isFloat16BufferAttribute?M=o.HALF_FLOAT:M=o.UNSIGNED_SHORT;else if(p instanceof Int16Array)M=o.SHORT;else if(p instanceof Uint32Array)M=o.UNSIGNED_INT;else if(p instanceof Int32Array)M=o.INT;else if(p instanceof Int8Array)M=o.BYTE;else if(p instanceof Uint8Array)M=o.UNSIGNED_BYTE;else if(p instanceof Uint8ClampedArray)M=o.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+p);return{buffer:x,type:M,bytesPerElement:p.BYTES_PER_ELEMENT,version:d.version,size:S}}function r(d,m,p){const v=m.array,S=m.updateRanges;if(o.bindBuffer(p,d),S.length===0)o.bufferSubData(p,0,v);else{S.sort((M,b)=>M.start-b.start);let x=0;for(let M=1;M<S.length;M++){const b=S[x],R=S[M];R.start<=b.start+b.count+1?b.count=Math.max(b.count,R.start+R.count-b.start):(++x,S[x]=R)}S.length=x+1;for(let M=0,b=S.length;M<b;M++){const R=S[M];o.bufferSubData(p,R.start*v.BYTES_PER_ELEMENT,v,R.start,R.count)}m.clearUpdateRanges()}m.onUploadCallback()}function l(d){return d.isInterleavedBufferAttribute&&(d=d.data),e.get(d)}function c(d){d.isInterleavedBufferAttribute&&(d=d.data);const m=e.get(d);m&&(o.deleteBuffer(m.buffer),e.delete(d))}function h(d,m){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const v=e.get(d);(!v||v.version<d.version)&&e.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const p=e.get(d);if(p===void 0)e.set(d,i(d,m));else if(p.version<d.version){if(p.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(p.buffer,d,m),p.version=d.version}}return{get:l,remove:c,update:h}}var iM=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,aM=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,rM=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,sM=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,oM=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,lM=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,uM=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,cM=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,fM=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,hM=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,dM=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,pM=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,mM=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,gM=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,_M=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,vM=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,SM=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,xM=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,yM=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,MM=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,EM=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,TM=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,bM=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,AM=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,RM=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,CM=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,wM=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,DM=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,UM=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,LM=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,NM="gl_FragColor = linearToOutputTexel( gl_FragColor );",OM=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,zM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,PM=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,BM=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,IM=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,FM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,HM=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,GM=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,VM=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,XM=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,kM=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,WM=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,qM=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,YM=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,jM=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ZM=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,KM=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,QM=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,JM=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$M=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,tE=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,eE=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,nE=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,iE=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,aE=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,rE=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,sE=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,oE=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,lE=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,uE=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,cE=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,fE=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,hE=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,dE=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,pE=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,mE=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,gE=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_E=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,vE=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,SE=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xE=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,yE=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,ME=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,EE=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,TE=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,bE=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,AE=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,RE=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,CE=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,wE=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,DE=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,UE=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,LE=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,NE=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,OE=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,zE=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,PE=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,BE=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,IE=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,FE=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,HE=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,GE=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,VE=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,XE=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,kE=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,WE=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,qE=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,YE=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,jE=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ZE=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,KE=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,QE=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,JE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,$E=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,tT=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,eT=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const nT=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,iT=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,aT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,rT=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,oT=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,lT=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,uT=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,cT=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,fT=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,hT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,dT=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pT=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,mT=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,gT=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,_T=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vT=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ST=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xT=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,yT=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,MT=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ET=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,TT=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bT=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,AT=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,RT=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,CT=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,wT=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,DT=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,UT=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,LT=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,NT=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,OT=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,zT=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ue={alphahash_fragment:iM,alphahash_pars_fragment:aM,alphamap_fragment:rM,alphamap_pars_fragment:sM,alphatest_fragment:oM,alphatest_pars_fragment:lM,aomap_fragment:uM,aomap_pars_fragment:cM,batching_pars_vertex:fM,batching_vertex:hM,begin_vertex:dM,beginnormal_vertex:pM,bsdfs:mM,iridescence_fragment:gM,bumpmap_pars_fragment:_M,clipping_planes_fragment:vM,clipping_planes_pars_fragment:SM,clipping_planes_pars_vertex:xM,clipping_planes_vertex:yM,color_fragment:MM,color_pars_fragment:EM,color_pars_vertex:TM,color_vertex:bM,common:AM,cube_uv_reflection_fragment:RM,defaultnormal_vertex:CM,displacementmap_pars_vertex:wM,displacementmap_vertex:DM,emissivemap_fragment:UM,emissivemap_pars_fragment:LM,colorspace_fragment:NM,colorspace_pars_fragment:OM,envmap_fragment:zM,envmap_common_pars_fragment:PM,envmap_pars_fragment:BM,envmap_pars_vertex:IM,envmap_physical_pars_fragment:ZM,envmap_vertex:FM,fog_vertex:HM,fog_pars_vertex:GM,fog_fragment:VM,fog_pars_fragment:XM,gradientmap_pars_fragment:kM,lightmap_pars_fragment:WM,lights_lambert_fragment:qM,lights_lambert_pars_fragment:YM,lights_pars_begin:jM,lights_toon_fragment:KM,lights_toon_pars_fragment:QM,lights_phong_fragment:JM,lights_phong_pars_fragment:$M,lights_physical_fragment:tE,lights_physical_pars_fragment:eE,lights_fragment_begin:nE,lights_fragment_maps:iE,lights_fragment_end:aE,logdepthbuf_fragment:rE,logdepthbuf_pars_fragment:sE,logdepthbuf_pars_vertex:oE,logdepthbuf_vertex:lE,map_fragment:uE,map_pars_fragment:cE,map_particle_fragment:fE,map_particle_pars_fragment:hE,metalnessmap_fragment:dE,metalnessmap_pars_fragment:pE,morphinstance_vertex:mE,morphcolor_vertex:gE,morphnormal_vertex:_E,morphtarget_pars_vertex:vE,morphtarget_vertex:SE,normal_fragment_begin:xE,normal_fragment_maps:yE,normal_pars_fragment:ME,normal_pars_vertex:EE,normal_vertex:TE,normalmap_pars_fragment:bE,clearcoat_normal_fragment_begin:AE,clearcoat_normal_fragment_maps:RE,clearcoat_pars_fragment:CE,iridescence_pars_fragment:wE,opaque_fragment:DE,packing:UE,premultiplied_alpha_fragment:LE,project_vertex:NE,dithering_fragment:OE,dithering_pars_fragment:zE,roughnessmap_fragment:PE,roughnessmap_pars_fragment:BE,shadowmap_pars_fragment:IE,shadowmap_pars_vertex:FE,shadowmap_vertex:HE,shadowmask_pars_fragment:GE,skinbase_vertex:VE,skinning_pars_vertex:XE,skinning_vertex:kE,skinnormal_vertex:WE,specularmap_fragment:qE,specularmap_pars_fragment:YE,tonemapping_fragment:jE,tonemapping_pars_fragment:ZE,transmission_fragment:KE,transmission_pars_fragment:QE,uv_pars_fragment:JE,uv_pars_vertex:$E,uv_vertex:tT,worldpos_vertex:eT,background_vert:nT,background_frag:iT,backgroundCube_vert:aT,backgroundCube_frag:rT,cube_vert:sT,cube_frag:oT,depth_vert:lT,depth_frag:uT,distanceRGBA_vert:cT,distanceRGBA_frag:fT,equirect_vert:hT,equirect_frag:dT,linedashed_vert:pT,linedashed_frag:mT,meshbasic_vert:gT,meshbasic_frag:_T,meshlambert_vert:vT,meshlambert_frag:ST,meshmatcap_vert:xT,meshmatcap_frag:yT,meshnormal_vert:MT,meshnormal_frag:ET,meshphong_vert:TT,meshphong_frag:bT,meshphysical_vert:AT,meshphysical_frag:RT,meshtoon_vert:CT,meshtoon_frag:wT,points_vert:DT,points_frag:UT,shadow_vert:LT,shadow_frag:NT,sprite_vert:OT,sprite_frag:zT},Lt={common:{diffuse:{value:new ye(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new oe},alphaMap:{value:null},alphaMapTransform:{value:new oe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new oe}},envmap:{envMap:{value:null},envMapRotation:{value:new oe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new oe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new oe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new oe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new oe},normalScale:{value:new Ce(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new oe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new oe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new oe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new oe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ye(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ye(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new oe},alphaTest:{value:0},uvTransform:{value:new oe}},sprite:{diffuse:{value:new ye(16777215)},opacity:{value:1},center:{value:new Ce(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new oe},alphaMap:{value:null},alphaMapTransform:{value:new oe},alphaTest:{value:0}}},wi={basic:{uniforms:Nn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.fog]),vertexShader:ue.meshbasic_vert,fragmentShader:ue.meshbasic_frag},lambert:{uniforms:Nn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new ye(0)}}]),vertexShader:ue.meshlambert_vert,fragmentShader:ue.meshlambert_frag},phong:{uniforms:Nn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new ye(0)},specular:{value:new ye(1118481)},shininess:{value:30}}]),vertexShader:ue.meshphong_vert,fragmentShader:ue.meshphong_frag},standard:{uniforms:Nn([Lt.common,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.roughnessmap,Lt.metalnessmap,Lt.fog,Lt.lights,{emissive:{value:new ye(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ue.meshphysical_vert,fragmentShader:ue.meshphysical_frag},toon:{uniforms:Nn([Lt.common,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.gradientmap,Lt.fog,Lt.lights,{emissive:{value:new ye(0)}}]),vertexShader:ue.meshtoon_vert,fragmentShader:ue.meshtoon_frag},matcap:{uniforms:Nn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,{matcap:{value:null}}]),vertexShader:ue.meshmatcap_vert,fragmentShader:ue.meshmatcap_frag},points:{uniforms:Nn([Lt.points,Lt.fog]),vertexShader:ue.points_vert,fragmentShader:ue.points_frag},dashed:{uniforms:Nn([Lt.common,Lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ue.linedashed_vert,fragmentShader:ue.linedashed_frag},depth:{uniforms:Nn([Lt.common,Lt.displacementmap]),vertexShader:ue.depth_vert,fragmentShader:ue.depth_frag},normal:{uniforms:Nn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,{opacity:{value:1}}]),vertexShader:ue.meshnormal_vert,fragmentShader:ue.meshnormal_frag},sprite:{uniforms:Nn([Lt.sprite,Lt.fog]),vertexShader:ue.sprite_vert,fragmentShader:ue.sprite_frag},background:{uniforms:{uvTransform:{value:new oe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ue.background_vert,fragmentShader:ue.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new oe}},vertexShader:ue.backgroundCube_vert,fragmentShader:ue.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ue.cube_vert,fragmentShader:ue.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ue.equirect_vert,fragmentShader:ue.equirect_frag},distanceRGBA:{uniforms:Nn([Lt.common,Lt.displacementmap,{referencePosition:{value:new et},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ue.distanceRGBA_vert,fragmentShader:ue.distanceRGBA_frag},shadow:{uniforms:Nn([Lt.lights,Lt.fog,{color:{value:new ye(0)},opacity:{value:1}}]),vertexShader:ue.shadow_vert,fragmentShader:ue.shadow_frag}};wi.physical={uniforms:Nn([wi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new oe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new oe},clearcoatNormalScale:{value:new Ce(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new oe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new oe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new oe},sheen:{value:0},sheenColor:{value:new ye(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new oe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new oe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new oe},transmissionSamplerSize:{value:new Ce},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new oe},attenuationDistance:{value:0},attenuationColor:{value:new ye(0)},specularColor:{value:new ye(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new oe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new oe},anisotropyVector:{value:new Ce},anisotropyMap:{value:null},anisotropyMapTransform:{value:new oe}}]),vertexShader:ue.meshphysical_vert,fragmentShader:ue.meshphysical_frag};const gu={r:0,b:0,g:0},hr=new Ni,PT=new je;function BT(o,e,i,r,l,c,h){const d=new ye(0);let m=c===!0?0:1,p,v,S=null,x=0,M=null;function b(N){let D=N.isScene===!0?N.background:null;return D&&D.isTexture&&(D=(N.backgroundBlurriness>0?i:e).get(D)),D}function R(N){let D=!1;const W=b(N);W===null?g(d,m):W&&W.isColor&&(g(W,1),D=!0);const F=o.xr.getEnvironmentBlendMode();F==="additive"?r.buffers.color.setClear(0,0,0,1,h):F==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,h),(o.autoClear||D)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),o.clear(o.autoClearColor,o.autoClearDepth,o.autoClearStencil))}function y(N,D){const W=b(D);W&&(W.isCubeTexture||W.mapping===Uu)?(v===void 0&&(v=new yi(new As(1,1,1),new Va({name:"BackgroundCubeMaterial",uniforms:Es(wi.backgroundCube.uniforms),vertexShader:wi.backgroundCube.vertexShader,fragmentShader:wi.backgroundCube.fragmentShader,side:Vn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),v.geometry.deleteAttribute("normal"),v.geometry.deleteAttribute("uv"),v.onBeforeRender=function(F,O,k){this.matrixWorld.copyPosition(k.matrixWorld)},Object.defineProperty(v.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),l.update(v)),hr.copy(D.backgroundRotation),hr.x*=-1,hr.y*=-1,hr.z*=-1,W.isCubeTexture&&W.isRenderTargetTexture===!1&&(hr.y*=-1,hr.z*=-1),v.material.uniforms.envMap.value=W,v.material.uniforms.flipEnvMap.value=W.isCubeTexture&&W.isRenderTargetTexture===!1?-1:1,v.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,v.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,v.material.uniforms.backgroundRotation.value.setFromMatrix4(PT.makeRotationFromEuler(hr)),v.material.toneMapped=Re.getTransfer(W.colorSpace)!==Fe,(S!==W||x!==W.version||M!==o.toneMapping)&&(v.material.needsUpdate=!0,S=W,x=W.version,M=o.toneMapping),v.layers.enableAll(),N.unshift(v,v.geometry,v.material,0,0,null)):W&&W.isTexture&&(p===void 0&&(p=new yi(new Nu(2,2),new Va({name:"BackgroundMaterial",uniforms:Es(wi.background.uniforms),vertexShader:wi.background.vertexShader,fragmentShader:wi.background.fragmentShader,side:Ga,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),p.geometry.deleteAttribute("normal"),Object.defineProperty(p.material,"map",{get:function(){return this.uniforms.t2D.value}}),l.update(p)),p.material.uniforms.t2D.value=W,p.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,p.material.toneMapped=Re.getTransfer(W.colorSpace)!==Fe,W.matrixAutoUpdate===!0&&W.updateMatrix(),p.material.uniforms.uvTransform.value.copy(W.matrix),(S!==W||x!==W.version||M!==o.toneMapping)&&(p.material.needsUpdate=!0,S=W,x=W.version,M=o.toneMapping),p.layers.enableAll(),N.unshift(p,p.geometry,p.material,0,0,null))}function g(N,D){N.getRGB(gu,Yv(o)),r.buffers.color.setClear(gu.r,gu.g,gu.b,D,h)}function B(){v!==void 0&&(v.geometry.dispose(),v.material.dispose(),v=void 0),p!==void 0&&(p.geometry.dispose(),p.material.dispose(),p=void 0)}return{getClearColor:function(){return d},setClearColor:function(N,D=1){d.set(N),m=D,g(d,m)},getClearAlpha:function(){return m},setClearAlpha:function(N){m=N,g(d,m)},render:R,addToRenderList:y,dispose:B}}function IT(o,e){const i=o.getParameter(o.MAX_VERTEX_ATTRIBS),r={},l=x(null);let c=l,h=!1;function d(C,H,st,at,ct){let dt=!1;const z=S(at,st,H);c!==z&&(c=z,p(c.object)),dt=M(C,at,st,ct),dt&&b(C,at,st,ct),ct!==null&&e.update(ct,o.ELEMENT_ARRAY_BUFFER),(dt||h)&&(h=!1,D(C,H,st,at),ct!==null&&o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,e.get(ct).buffer))}function m(){return o.createVertexArray()}function p(C){return o.bindVertexArray(C)}function v(C){return o.deleteVertexArray(C)}function S(C,H,st){const at=st.wireframe===!0;let ct=r[C.id];ct===void 0&&(ct={},r[C.id]=ct);let dt=ct[H.id];dt===void 0&&(dt={},ct[H.id]=dt);let z=dt[at];return z===void 0&&(z=x(m()),dt[at]=z),z}function x(C){const H=[],st=[],at=[];for(let ct=0;ct<i;ct++)H[ct]=0,st[ct]=0,at[ct]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:H,enabledAttributes:st,attributeDivisors:at,object:C,attributes:{},index:null}}function M(C,H,st,at){const ct=c.attributes,dt=H.attributes;let z=0;const K=st.getAttributes();for(const Z in K)if(K[Z].location>=0){const At=ct[Z];let U=dt[Z];if(U===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(U=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(U=C.instanceColor)),At===void 0||At.attribute!==U||U&&At.data!==U.data)return!0;z++}return c.attributesNum!==z||c.index!==at}function b(C,H,st,at){const ct={},dt=H.attributes;let z=0;const K=st.getAttributes();for(const Z in K)if(K[Z].location>=0){let At=dt[Z];At===void 0&&(Z==="instanceMatrix"&&C.instanceMatrix&&(At=C.instanceMatrix),Z==="instanceColor"&&C.instanceColor&&(At=C.instanceColor));const U={};U.attribute=At,At&&At.data&&(U.data=At.data),ct[Z]=U,z++}c.attributes=ct,c.attributesNum=z,c.index=at}function R(){const C=c.newAttributes;for(let H=0,st=C.length;H<st;H++)C[H]=0}function y(C){g(C,0)}function g(C,H){const st=c.newAttributes,at=c.enabledAttributes,ct=c.attributeDivisors;st[C]=1,at[C]===0&&(o.enableVertexAttribArray(C),at[C]=1),ct[C]!==H&&(o.vertexAttribDivisor(C,H),ct[C]=H)}function B(){const C=c.newAttributes,H=c.enabledAttributes;for(let st=0,at=H.length;st<at;st++)H[st]!==C[st]&&(o.disableVertexAttribArray(st),H[st]=0)}function N(C,H,st,at,ct,dt,z){z===!0?o.vertexAttribIPointer(C,H,st,ct,dt):o.vertexAttribPointer(C,H,st,at,ct,dt)}function D(C,H,st,at){R();const ct=at.attributes,dt=st.getAttributes(),z=H.defaultAttributeValues;for(const K in dt){const Z=dt[K];if(Z.location>=0){let xt=ct[K];if(xt===void 0&&(K==="instanceMatrix"&&C.instanceMatrix&&(xt=C.instanceMatrix),K==="instanceColor"&&C.instanceColor&&(xt=C.instanceColor)),xt!==void 0){const At=xt.normalized,U=xt.itemSize,nt=e.get(xt);if(nt===void 0)continue;const St=nt.buffer,j=nt.type,ft=nt.bytesPerElement,Tt=j===o.INT||j===o.UNSIGNED_INT||xt.gpuType===_d;if(xt.isInterleavedBufferAttribute){const yt=xt.data,Ot=yt.stride,Kt=xt.offset;if(yt.isInstancedInterleavedBuffer){for(let Qt=0;Qt<Z.locationSize;Qt++)g(Z.location+Qt,yt.meshPerAttribute);C.isInstancedMesh!==!0&&at._maxInstanceCount===void 0&&(at._maxInstanceCount=yt.meshPerAttribute*yt.count)}else for(let Qt=0;Qt<Z.locationSize;Qt++)y(Z.location+Qt);o.bindBuffer(o.ARRAY_BUFFER,St);for(let Qt=0;Qt<Z.locationSize;Qt++)N(Z.location+Qt,U/Z.locationSize,j,At,Ot*ft,(Kt+U/Z.locationSize*Qt)*ft,Tt)}else{if(xt.isInstancedBufferAttribute){for(let yt=0;yt<Z.locationSize;yt++)g(Z.location+yt,xt.meshPerAttribute);C.isInstancedMesh!==!0&&at._maxInstanceCount===void 0&&(at._maxInstanceCount=xt.meshPerAttribute*xt.count)}else for(let yt=0;yt<Z.locationSize;yt++)y(Z.location+yt);o.bindBuffer(o.ARRAY_BUFFER,St);for(let yt=0;yt<Z.locationSize;yt++)N(Z.location+yt,U/Z.locationSize,j,At,U*ft,U/Z.locationSize*yt*ft,Tt)}}else if(z!==void 0){const At=z[K];if(At!==void 0)switch(At.length){case 2:o.vertexAttrib2fv(Z.location,At);break;case 3:o.vertexAttrib3fv(Z.location,At);break;case 4:o.vertexAttrib4fv(Z.location,At);break;default:o.vertexAttrib1fv(Z.location,At)}}}}B()}function W(){k();for(const C in r){const H=r[C];for(const st in H){const at=H[st];for(const ct in at)v(at[ct].object),delete at[ct];delete H[st]}delete r[C]}}function F(C){if(r[C.id]===void 0)return;const H=r[C.id];for(const st in H){const at=H[st];for(const ct in at)v(at[ct].object),delete at[ct];delete H[st]}delete r[C.id]}function O(C){for(const H in r){const st=r[H];if(st[C.id]===void 0)continue;const at=st[C.id];for(const ct in at)v(at[ct].object),delete at[ct];delete st[C.id]}}function k(){w(),h=!0,c!==l&&(c=l,p(c.object))}function w(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:d,reset:k,resetDefaultState:w,dispose:W,releaseStatesOfGeometry:F,releaseStatesOfProgram:O,initAttributes:R,enableAttribute:y,disableUnusedAttributes:B}}function FT(o,e,i){let r;function l(p){r=p}function c(p,v){o.drawArrays(r,p,v),i.update(v,r,1)}function h(p,v,S){S!==0&&(o.drawArraysInstanced(r,p,v,S),i.update(v,r,S))}function d(p,v,S){if(S===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,p,0,v,0,S);let M=0;for(let b=0;b<S;b++)M+=v[b];i.update(M,r,1)}function m(p,v,S,x){if(S===0)return;const M=e.get("WEBGL_multi_draw");if(M===null)for(let b=0;b<p.length;b++)h(p[b],v[b],x[b]);else{M.multiDrawArraysInstancedWEBGL(r,p,0,v,0,x,0,S);let b=0;for(let R=0;R<S;R++)b+=v[R]*x[R];i.update(b,r,1)}}this.setMode=l,this.render=c,this.renderInstances=h,this.renderMultiDraw=d,this.renderMultiDrawInstances=m}function HT(o,e,i,r){let l;function c(){if(l!==void 0)return l;if(e.has("EXT_texture_filter_anisotropic")===!0){const O=e.get("EXT_texture_filter_anisotropic");l=o.getParameter(O.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else l=0;return l}function h(O){return!(O!==xi&&r.convert(O)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(O){const k=O===Po&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(O!==Li&&r.convert(O)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_TYPE)&&O!==sa&&!k)}function m(O){if(O==="highp"){if(o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.HIGH_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.HIGH_FLOAT).precision>0)return"highp";O="mediump"}return O==="mediump"&&o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.MEDIUM_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let p=i.precision!==void 0?i.precision:"highp";const v=m(p);v!==p&&(console.warn("THREE.WebGLRenderer:",p,"not supported, using",v,"instead."),p=v);const S=i.logarithmicDepthBuffer===!0,x=i.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),M=o.getParameter(o.MAX_TEXTURE_IMAGE_UNITS),b=o.getParameter(o.MAX_VERTEX_TEXTURE_IMAGE_UNITS),R=o.getParameter(o.MAX_TEXTURE_SIZE),y=o.getParameter(o.MAX_CUBE_MAP_TEXTURE_SIZE),g=o.getParameter(o.MAX_VERTEX_ATTRIBS),B=o.getParameter(o.MAX_VERTEX_UNIFORM_VECTORS),N=o.getParameter(o.MAX_VARYING_VECTORS),D=o.getParameter(o.MAX_FRAGMENT_UNIFORM_VECTORS),W=b>0,F=o.getParameter(o.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:c,getMaxPrecision:m,textureFormatReadable:h,textureTypeReadable:d,precision:p,logarithmicDepthBuffer:S,reverseDepthBuffer:x,maxTextures:M,maxVertexTextures:b,maxTextureSize:R,maxCubemapSize:y,maxAttributes:g,maxVertexUniforms:B,maxVaryings:N,maxFragmentUniforms:D,vertexTextures:W,maxSamples:F}}function GT(o){const e=this;let i=null,r=0,l=!1,c=!1;const h=new pr,d=new oe,m={value:null,needsUpdate:!1};this.uniform=m,this.numPlanes=0,this.numIntersection=0,this.init=function(S,x){const M=S.length!==0||x||r!==0||l;return l=x,r=S.length,M},this.beginShadows=function(){c=!0,v(null)},this.endShadows=function(){c=!1},this.setGlobalState=function(S,x){i=v(S,x,0)},this.setState=function(S,x,M){const b=S.clippingPlanes,R=S.clipIntersection,y=S.clipShadows,g=o.get(S);if(!l||b===null||b.length===0||c&&!y)c?v(null):p();else{const B=c?0:r,N=B*4;let D=g.clippingState||null;m.value=D,D=v(b,x,N,M);for(let W=0;W!==N;++W)D[W]=i[W];g.clippingState=D,this.numIntersection=R?this.numPlanes:0,this.numPlanes+=B}};function p(){m.value!==i&&(m.value=i,m.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function v(S,x,M,b){const R=S!==null?S.length:0;let y=null;if(R!==0){if(y=m.value,b!==!0||y===null){const g=M+R*4,B=x.matrixWorldInverse;d.getNormalMatrix(B),(y===null||y.length<g)&&(y=new Float32Array(g));for(let N=0,D=M;N!==R;++N,D+=4)h.copy(S[N]).applyMatrix4(B,d),h.normal.toArray(y,D),y[D+3]=h.constant}m.value=y,m.needsUpdate=!0}return e.numPlanes=R,e.numIntersection=0,y}}function VT(o){let e=new WeakMap;function i(h,d){return d===Bh?h.mapping=xs:d===Ih&&(h.mapping=ys),h}function r(h){if(h&&h.isTexture){const d=h.mapping;if(d===Bh||d===Ih)if(e.has(h)){const m=e.get(h).texture;return i(m,h.mapping)}else{const m=h.image;if(m&&m.height>0){const p=new Iy(m.height);return p.fromEquirectangularTexture(o,h),e.set(h,p),h.addEventListener("dispose",l),i(p.texture,h.mapping)}else return null}}return h}function l(h){const d=h.target;d.removeEventListener("dispose",l);const m=e.get(d);m!==void 0&&(e.delete(d),m.dispose())}function c(){e=new WeakMap}return{get:r,dispose:c}}const ms=4,K_=[.125,.215,.35,.446,.526,.582],_r=20,yh=new $v,Q_=new ye;let Mh=null,Eh=0,Th=0,bh=!1;const mr=(1+Math.sqrt(5))/2,ps=1/mr,J_=[new et(-mr,ps,0),new et(mr,ps,0),new et(-ps,0,mr),new et(ps,0,mr),new et(0,mr,-ps),new et(0,mr,ps),new et(-1,1,-1),new et(1,1,-1),new et(-1,1,1),new et(1,1,1)],XT=new et;class $_{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,i=0,r=.1,l=100,c={}){const{size:h=256,position:d=XT}=c;Mh=this._renderer.getRenderTarget(),Eh=this._renderer.getActiveCubeFace(),Th=this._renderer.getActiveMipmapLevel(),bh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(h);const m=this._allocateTargets();return m.depthBuffer=!0,this._sceneToCubeUV(e,r,l,m,d),i>0&&this._blur(m,0,0,i),this._applyPMREM(m),this._cleanup(m),m}fromEquirectangular(e,i=null){return this._fromTexture(e,i)}fromCubemap(e,i=null){return this._fromTexture(e,i)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=nv(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ev(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Mh,Eh,Th),this._renderer.xr.enabled=bh,e.scissorTest=!1,_u(e,0,0,e.width,e.height)}_fromTexture(e,i){e.mapping===xs||e.mapping===ys?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Mh=this._renderer.getRenderTarget(),Eh=this._renderer.getActiveCubeFace(),Th=this._renderer.getActiveMipmapLevel(),bh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=i||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),i=4*this._cubeSize,r={magFilter:Di,minFilter:Di,generateMipmaps:!1,type:Po,format:xi,colorSpace:Ms,depthBuffer:!1},l=tv(e,i,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==i){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=tv(e,i,r);const{_lodMax:c}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=kT(c)),this._blurMaterial=WT(c,e,i)}return l}_compileMaterial(e){const i=new yi(this._lodPlanes[0],e);this._renderer.compile(i,yh)}_sceneToCubeUV(e,i,r,l,c){const m=new ui(90,1,i,r),p=[1,-1,1,1,1,1],v=[1,1,1,-1,-1,-1],S=this._renderer,x=S.autoClear,M=S.toneMapping;S.getClearColor(Q_),S.toneMapping=Ha,S.autoClear=!1;const b=new kv({name:"PMREM.Background",side:Vn,depthWrite:!1,depthTest:!1}),R=new yi(new As,b);let y=!1;const g=e.background;g?g.isColor&&(b.color.copy(g),e.background=null,y=!0):(b.color.copy(Q_),y=!0);for(let B=0;B<6;B++){const N=B%3;N===0?(m.up.set(0,p[B],0),m.position.set(c.x,c.y,c.z),m.lookAt(c.x+v[B],c.y,c.z)):N===1?(m.up.set(0,0,p[B]),m.position.set(c.x,c.y,c.z),m.lookAt(c.x,c.y+v[B],c.z)):(m.up.set(0,p[B],0),m.position.set(c.x,c.y,c.z),m.lookAt(c.x,c.y,c.z+v[B]));const D=this._cubeSize;_u(l,N*D,B>2?D:0,D,D),S.setRenderTarget(l),y&&S.render(R,m),S.render(e,m)}R.geometry.dispose(),R.material.dispose(),S.toneMapping=M,S.autoClear=x,e.background=g}_textureToCubeUV(e,i){const r=this._renderer,l=e.mapping===xs||e.mapping===ys;l?(this._cubemapMaterial===null&&(this._cubemapMaterial=nv()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ev());const c=l?this._cubemapMaterial:this._equirectMaterial,h=new yi(this._lodPlanes[0],c),d=c.uniforms;d.envMap.value=e;const m=this._cubeSize;_u(i,0,0,3*m,2*m),r.setRenderTarget(i),r.render(h,yh)}_applyPMREM(e){const i=this._renderer,r=i.autoClear;i.autoClear=!1;const l=this._lodPlanes.length;for(let c=1;c<l;c++){const h=Math.sqrt(this._sigmas[c]*this._sigmas[c]-this._sigmas[c-1]*this._sigmas[c-1]),d=J_[(l-c-1)%J_.length];this._blur(e,c-1,c,h,d)}i.autoClear=r}_blur(e,i,r,l,c){const h=this._pingPongRenderTarget;this._halfBlur(e,h,i,r,l,"latitudinal",c),this._halfBlur(h,e,r,r,l,"longitudinal",c)}_halfBlur(e,i,r,l,c,h,d){const m=this._renderer,p=this._blurMaterial;h!=="latitudinal"&&h!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const v=3,S=new yi(this._lodPlanes[l],p),x=p.uniforms,M=this._sizeLods[r]-1,b=isFinite(c)?Math.PI/(2*M):2*Math.PI/(2*_r-1),R=c/b,y=isFinite(c)?1+Math.floor(v*R):_r;y>_r&&console.warn(`sigmaRadians, ${c}, is too large and will clip, as it requested ${y} samples when the maximum is set to ${_r}`);const g=[];let B=0;for(let O=0;O<_r;++O){const k=O/R,w=Math.exp(-k*k/2);g.push(w),O===0?B+=w:O<y&&(B+=2*w)}for(let O=0;O<g.length;O++)g[O]=g[O]/B;x.envMap.value=e.texture,x.samples.value=y,x.weights.value=g,x.latitudinal.value=h==="latitudinal",d&&(x.poleAxis.value=d);const{_lodMax:N}=this;x.dTheta.value=b,x.mipInt.value=N-r;const D=this._sizeLods[l],W=3*D*(l>N-ms?l-N+ms:0),F=4*(this._cubeSize-D);_u(i,W,F,3*D,2*D),m.setRenderTarget(i),m.render(S,yh)}}function kT(o){const e=[],i=[],r=[];let l=o;const c=o-ms+1+K_.length;for(let h=0;h<c;h++){const d=Math.pow(2,l);i.push(d);let m=1/d;h>o-ms?m=K_[h-o+ms-1]:h===0&&(m=0),r.push(m);const p=1/(d-2),v=-p,S=1+p,x=[v,v,S,v,S,S,v,v,S,S,v,S],M=6,b=6,R=3,y=2,g=1,B=new Float32Array(R*b*M),N=new Float32Array(y*b*M),D=new Float32Array(g*b*M);for(let F=0;F<M;F++){const O=F%3*2/3-1,k=F>2?0:-1,w=[O,k,0,O+2/3,k,0,O+2/3,k+1,0,O,k,0,O+2/3,k+1,0,O,k+1,0];B.set(w,R*b*F),N.set(x,y*b*F);const C=[F,F,F,F,F,F];D.set(C,g*b*F)}const W=new Ei;W.setAttribute("position",new Ui(B,R)),W.setAttribute("uv",new Ui(N,y)),W.setAttribute("faceIndex",new Ui(D,g)),e.push(W),l>ms&&l--}return{lodPlanes:e,sizeLods:i,sigmas:r}}function tv(o,e,i){const r=new yr(o,e,i);return r.texture.mapping=Uu,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function _u(o,e,i,r,l){o.viewport.set(e,i,r,l),o.scissor.set(e,i,r,l)}function WT(o,e,i){const r=new Float32Array(_r),l=new et(0,1,0);return new Va({name:"SphericalGaussianBlur",defines:{n:_r,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/i,CUBEUV_MAX_MIP:`${o}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:l}},vertexShader:Rd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Fa,depthTest:!1,depthWrite:!1})}function ev(){return new Va({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Rd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Fa,depthTest:!1,depthWrite:!1})}function nv(){return new Va({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Rd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fa,depthTest:!1,depthWrite:!1})}function Rd(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function qT(o){let e=new WeakMap,i=null;function r(d){if(d&&d.isTexture){const m=d.mapping,p=m===Bh||m===Ih,v=m===xs||m===ys;if(p||v){let S=e.get(d);const x=S!==void 0?S.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==x)return i===null&&(i=new $_(o)),S=p?i.fromEquirectangular(d,S):i.fromCubemap(d,S),S.texture.pmremVersion=d.pmremVersion,e.set(d,S),S.texture;if(S!==void 0)return S.texture;{const M=d.image;return p&&M&&M.height>0||v&&M&&l(M)?(i===null&&(i=new $_(o)),S=p?i.fromEquirectangular(d):i.fromCubemap(d),S.texture.pmremVersion=d.pmremVersion,e.set(d,S),d.addEventListener("dispose",c),S.texture):null}}}return d}function l(d){let m=0;const p=6;for(let v=0;v<p;v++)d[v]!==void 0&&m++;return m===p}function c(d){const m=d.target;m.removeEventListener("dispose",c);const p=e.get(m);p!==void 0&&(e.delete(m),p.dispose())}function h(){e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:h}}function YT(o){const e={};function i(r){if(e[r]!==void 0)return e[r];let l;switch(r){case"WEBGL_depth_texture":l=o.getExtension("WEBGL_depth_texture")||o.getExtension("MOZ_WEBGL_depth_texture")||o.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":l=o.getExtension("EXT_texture_filter_anisotropic")||o.getExtension("MOZ_EXT_texture_filter_anisotropic")||o.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":l=o.getExtension("WEBGL_compressed_texture_s3tc")||o.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||o.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":l=o.getExtension("WEBGL_compressed_texture_pvrtc")||o.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:l=o.getExtension(r)}return e[r]=l,l}return{has:function(r){return i(r)!==null},init:function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},get:function(r){const l=i(r);return l===null&&_s("THREE.WebGLRenderer: "+r+" extension not supported."),l}}}function jT(o,e,i,r){const l={},c=new WeakMap;function h(S){const x=S.target;x.index!==null&&e.remove(x.index);for(const b in x.attributes)e.remove(x.attributes[b]);x.removeEventListener("dispose",h),delete l[x.id];const M=c.get(x);M&&(e.remove(M),c.delete(x)),r.releaseStatesOfGeometry(x),x.isInstancedBufferGeometry===!0&&delete x._maxInstanceCount,i.memory.geometries--}function d(S,x){return l[x.id]===!0||(x.addEventListener("dispose",h),l[x.id]=!0,i.memory.geometries++),x}function m(S){const x=S.attributes;for(const M in x)e.update(x[M],o.ARRAY_BUFFER)}function p(S){const x=[],M=S.index,b=S.attributes.position;let R=0;if(M!==null){const B=M.array;R=M.version;for(let N=0,D=B.length;N<D;N+=3){const W=B[N+0],F=B[N+1],O=B[N+2];x.push(W,F,F,O,O,W)}}else if(b!==void 0){const B=b.array;R=b.version;for(let N=0,D=B.length/3-1;N<D;N+=3){const W=N+0,F=N+1,O=N+2;x.push(W,F,F,O,O,W)}}else return;const y=new(Fv(x)?qv:Wv)(x,1);y.version=R;const g=c.get(S);g&&e.remove(g),c.set(S,y)}function v(S){const x=c.get(S);if(x){const M=S.index;M!==null&&x.version<M.version&&p(S)}else p(S);return c.get(S)}return{get:d,update:m,getWireframeAttribute:v}}function ZT(o,e,i){let r;function l(x){r=x}let c,h;function d(x){c=x.type,h=x.bytesPerElement}function m(x,M){o.drawElements(r,M,c,x*h),i.update(M,r,1)}function p(x,M,b){b!==0&&(o.drawElementsInstanced(r,M,c,x*h,b),i.update(M,r,b))}function v(x,M,b){if(b===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,M,0,c,x,0,b);let y=0;for(let g=0;g<b;g++)y+=M[g];i.update(y,r,1)}function S(x,M,b,R){if(b===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let g=0;g<x.length;g++)p(x[g]/h,M[g],R[g]);else{y.multiDrawElementsInstancedWEBGL(r,M,0,c,x,0,R,0,b);let g=0;for(let B=0;B<b;B++)g+=M[B]*R[B];i.update(g,r,1)}}this.setMode=l,this.setIndex=d,this.render=m,this.renderInstances=p,this.renderMultiDraw=v,this.renderMultiDrawInstances=S}function KT(o){const e={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function r(c,h,d){switch(i.calls++,h){case o.TRIANGLES:i.triangles+=d*(c/3);break;case o.LINES:i.lines+=d*(c/2);break;case o.LINE_STRIP:i.lines+=d*(c-1);break;case o.LINE_LOOP:i.lines+=d*c;break;case o.POINTS:i.points+=d*c;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",h);break}}function l(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return{memory:e,render:i,programs:null,autoReset:!0,reset:l,update:r}}function QT(o,e,i){const r=new WeakMap,l=new $e;function c(h,d,m){const p=h.morphTargetInfluences,v=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,S=v!==void 0?v.length:0;let x=r.get(d);if(x===void 0||x.count!==S){let C=function(){k.dispose(),r.delete(d),d.removeEventListener("dispose",C)};var M=C;x!==void 0&&x.texture.dispose();const b=d.morphAttributes.position!==void 0,R=d.morphAttributes.normal!==void 0,y=d.morphAttributes.color!==void 0,g=d.morphAttributes.position||[],B=d.morphAttributes.normal||[],N=d.morphAttributes.color||[];let D=0;b===!0&&(D=1),R===!0&&(D=2),y===!0&&(D=3);let W=d.attributes.position.count*D,F=1;W>e.maxTextureSize&&(F=Math.ceil(W/e.maxTextureSize),W=e.maxTextureSize);const O=new Float32Array(W*F*4*S),k=new Hv(O,W,F,S);k.type=sa,k.needsUpdate=!0;const w=D*4;for(let H=0;H<S;H++){const st=g[H],at=B[H],ct=N[H],dt=W*F*4*H;for(let z=0;z<st.count;z++){const K=z*w;b===!0&&(l.fromBufferAttribute(st,z),O[dt+K+0]=l.x,O[dt+K+1]=l.y,O[dt+K+2]=l.z,O[dt+K+3]=0),R===!0&&(l.fromBufferAttribute(at,z),O[dt+K+4]=l.x,O[dt+K+5]=l.y,O[dt+K+6]=l.z,O[dt+K+7]=0),y===!0&&(l.fromBufferAttribute(ct,z),O[dt+K+8]=l.x,O[dt+K+9]=l.y,O[dt+K+10]=l.z,O[dt+K+11]=ct.itemSize===4?l.w:1)}}x={count:S,texture:k,size:new Ce(W,F)},r.set(d,x),d.addEventListener("dispose",C)}if(h.isInstancedMesh===!0&&h.morphTexture!==null)m.getUniforms().setValue(o,"morphTexture",h.morphTexture,i);else{let b=0;for(let y=0;y<p.length;y++)b+=p[y];const R=d.morphTargetsRelative?1:1-b;m.getUniforms().setValue(o,"morphTargetBaseInfluence",R),m.getUniforms().setValue(o,"morphTargetInfluences",p)}m.getUniforms().setValue(o,"morphTargetsTexture",x.texture,i),m.getUniforms().setValue(o,"morphTargetsTextureSize",x.size)}return{update:c}}function JT(o,e,i,r){let l=new WeakMap;function c(m){const p=r.render.frame,v=m.geometry,S=e.get(m,v);if(l.get(S)!==p&&(e.update(S),l.set(S,p)),m.isInstancedMesh&&(m.hasEventListener("dispose",d)===!1&&m.addEventListener("dispose",d),l.get(m)!==p&&(i.update(m.instanceMatrix,o.ARRAY_BUFFER),m.instanceColor!==null&&i.update(m.instanceColor,o.ARRAY_BUFFER),l.set(m,p))),m.isSkinnedMesh){const x=m.skeleton;l.get(x)!==p&&(x.update(),l.set(x,p))}return S}function h(){l=new WeakMap}function d(m){const p=m.target;p.removeEventListener("dispose",d),i.remove(p.instanceMatrix),p.instanceColor!==null&&i.remove(p.instanceColor)}return{update:c,dispose:h}}const e0=new Xn,iv=new Qv(1,1),n0=new Hv,i0=new yy,a0=new Zv,av=[],rv=[],sv=new Float32Array(16),ov=new Float32Array(9),lv=new Float32Array(4);function Rs(o,e,i){const r=o[0];if(r<=0||r>0)return o;const l=e*i;let c=av[l];if(c===void 0&&(c=new Float32Array(l),av[l]=c),e!==0){r.toArray(c,0);for(let h=1,d=0;h!==e;++h)d+=i,o[h].toArray(c,d)}return c}function fn(o,e){if(o.length!==e.length)return!1;for(let i=0,r=o.length;i<r;i++)if(o[i]!==e[i])return!1;return!0}function hn(o,e){for(let i=0,r=e.length;i<r;i++)o[i]=e[i]}function Ou(o,e){let i=rv[e];i===void 0&&(i=new Int32Array(e),rv[e]=i);for(let r=0;r!==e;++r)i[r]=o.allocateTextureUnit();return i}function $T(o,e){const i=this.cache;i[0]!==e&&(o.uniform1f(this.addr,e),i[0]=e)}function tb(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y)&&(o.uniform2f(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y);else{if(fn(i,e))return;o.uniform2fv(this.addr,e),hn(i,e)}}function eb(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)&&(o.uniform3f(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z);else if(e.r!==void 0)(i[0]!==e.r||i[1]!==e.g||i[2]!==e.b)&&(o.uniform3f(this.addr,e.r,e.g,e.b),i[0]=e.r,i[1]=e.g,i[2]=e.b);else{if(fn(i,e))return;o.uniform3fv(this.addr,e),hn(i,e)}}function nb(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)&&(o.uniform4f(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w);else{if(fn(i,e))return;o.uniform4fv(this.addr,e),hn(i,e)}}function ib(o,e){const i=this.cache,r=e.elements;if(r===void 0){if(fn(i,e))return;o.uniformMatrix2fv(this.addr,!1,e),hn(i,e)}else{if(fn(i,r))return;lv.set(r),o.uniformMatrix2fv(this.addr,!1,lv),hn(i,r)}}function ab(o,e){const i=this.cache,r=e.elements;if(r===void 0){if(fn(i,e))return;o.uniformMatrix3fv(this.addr,!1,e),hn(i,e)}else{if(fn(i,r))return;ov.set(r),o.uniformMatrix3fv(this.addr,!1,ov),hn(i,r)}}function rb(o,e){const i=this.cache,r=e.elements;if(r===void 0){if(fn(i,e))return;o.uniformMatrix4fv(this.addr,!1,e),hn(i,e)}else{if(fn(i,r))return;sv.set(r),o.uniformMatrix4fv(this.addr,!1,sv),hn(i,r)}}function sb(o,e){const i=this.cache;i[0]!==e&&(o.uniform1i(this.addr,e),i[0]=e)}function ob(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y)&&(o.uniform2i(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y);else{if(fn(i,e))return;o.uniform2iv(this.addr,e),hn(i,e)}}function lb(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)&&(o.uniform3i(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z);else{if(fn(i,e))return;o.uniform3iv(this.addr,e),hn(i,e)}}function ub(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)&&(o.uniform4i(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w);else{if(fn(i,e))return;o.uniform4iv(this.addr,e),hn(i,e)}}function cb(o,e){const i=this.cache;i[0]!==e&&(o.uniform1ui(this.addr,e),i[0]=e)}function fb(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y)&&(o.uniform2ui(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y);else{if(fn(i,e))return;o.uniform2uiv(this.addr,e),hn(i,e)}}function hb(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)&&(o.uniform3ui(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z);else{if(fn(i,e))return;o.uniform3uiv(this.addr,e),hn(i,e)}}function db(o,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)&&(o.uniform4ui(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w);else{if(fn(i,e))return;o.uniform4uiv(this.addr,e),hn(i,e)}}function pb(o,e,i){const r=this.cache,l=i.allocateTextureUnit();r[0]!==l&&(o.uniform1i(this.addr,l),r[0]=l);let c;this.type===o.SAMPLER_2D_SHADOW?(iv.compareFunction=Iv,c=iv):c=e0,i.setTexture2D(e||c,l)}function mb(o,e,i){const r=this.cache,l=i.allocateTextureUnit();r[0]!==l&&(o.uniform1i(this.addr,l),r[0]=l),i.setTexture3D(e||i0,l)}function gb(o,e,i){const r=this.cache,l=i.allocateTextureUnit();r[0]!==l&&(o.uniform1i(this.addr,l),r[0]=l),i.setTextureCube(e||a0,l)}function _b(o,e,i){const r=this.cache,l=i.allocateTextureUnit();r[0]!==l&&(o.uniform1i(this.addr,l),r[0]=l),i.setTexture2DArray(e||n0,l)}function vb(o){switch(o){case 5126:return $T;case 35664:return tb;case 35665:return eb;case 35666:return nb;case 35674:return ib;case 35675:return ab;case 35676:return rb;case 5124:case 35670:return sb;case 35667:case 35671:return ob;case 35668:case 35672:return lb;case 35669:case 35673:return ub;case 5125:return cb;case 36294:return fb;case 36295:return hb;case 36296:return db;case 35678:case 36198:case 36298:case 36306:case 35682:return pb;case 35679:case 36299:case 36307:return mb;case 35680:case 36300:case 36308:case 36293:return gb;case 36289:case 36303:case 36311:case 36292:return _b}}function Sb(o,e){o.uniform1fv(this.addr,e)}function xb(o,e){const i=Rs(e,this.size,2);o.uniform2fv(this.addr,i)}function yb(o,e){const i=Rs(e,this.size,3);o.uniform3fv(this.addr,i)}function Mb(o,e){const i=Rs(e,this.size,4);o.uniform4fv(this.addr,i)}function Eb(o,e){const i=Rs(e,this.size,4);o.uniformMatrix2fv(this.addr,!1,i)}function Tb(o,e){const i=Rs(e,this.size,9);o.uniformMatrix3fv(this.addr,!1,i)}function bb(o,e){const i=Rs(e,this.size,16);o.uniformMatrix4fv(this.addr,!1,i)}function Ab(o,e){o.uniform1iv(this.addr,e)}function Rb(o,e){o.uniform2iv(this.addr,e)}function Cb(o,e){o.uniform3iv(this.addr,e)}function wb(o,e){o.uniform4iv(this.addr,e)}function Db(o,e){o.uniform1uiv(this.addr,e)}function Ub(o,e){o.uniform2uiv(this.addr,e)}function Lb(o,e){o.uniform3uiv(this.addr,e)}function Nb(o,e){o.uniform4uiv(this.addr,e)}function Ob(o,e,i){const r=this.cache,l=e.length,c=Ou(i,l);fn(r,c)||(o.uniform1iv(this.addr,c),hn(r,c));for(let h=0;h!==l;++h)i.setTexture2D(e[h]||e0,c[h])}function zb(o,e,i){const r=this.cache,l=e.length,c=Ou(i,l);fn(r,c)||(o.uniform1iv(this.addr,c),hn(r,c));for(let h=0;h!==l;++h)i.setTexture3D(e[h]||i0,c[h])}function Pb(o,e,i){const r=this.cache,l=e.length,c=Ou(i,l);fn(r,c)||(o.uniform1iv(this.addr,c),hn(r,c));for(let h=0;h!==l;++h)i.setTextureCube(e[h]||a0,c[h])}function Bb(o,e,i){const r=this.cache,l=e.length,c=Ou(i,l);fn(r,c)||(o.uniform1iv(this.addr,c),hn(r,c));for(let h=0;h!==l;++h)i.setTexture2DArray(e[h]||n0,c[h])}function Ib(o){switch(o){case 5126:return Sb;case 35664:return xb;case 35665:return yb;case 35666:return Mb;case 35674:return Eb;case 35675:return Tb;case 35676:return bb;case 5124:case 35670:return Ab;case 35667:case 35671:return Rb;case 35668:case 35672:return Cb;case 35669:case 35673:return wb;case 5125:return Db;case 36294:return Ub;case 36295:return Lb;case 36296:return Nb;case 35678:case 36198:case 36298:case 36306:case 35682:return Ob;case 35679:case 36299:case 36307:return zb;case 35680:case 36300:case 36308:case 36293:return Pb;case 36289:case 36303:case 36311:case 36292:return Bb}}class Fb{constructor(e,i,r){this.id=e,this.addr=r,this.cache=[],this.type=i.type,this.setValue=vb(i.type)}}class Hb{constructor(e,i,r){this.id=e,this.addr=r,this.cache=[],this.type=i.type,this.size=i.size,this.setValue=Ib(i.type)}}class Gb{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,i,r){const l=this.seq;for(let c=0,h=l.length;c!==h;++c){const d=l[c];d.setValue(e,i[d.id],r)}}}const Ah=/(\w+)(\])?(\[|\.)?/g;function uv(o,e){o.seq.push(e),o.map[e.id]=e}function Vb(o,e,i){const r=o.name,l=r.length;for(Ah.lastIndex=0;;){const c=Ah.exec(r),h=Ah.lastIndex;let d=c[1];const m=c[2]==="]",p=c[3];if(m&&(d=d|0),p===void 0||p==="["&&h+2===l){uv(i,p===void 0?new Fb(d,o,e):new Hb(d,o,e));break}else{let S=i.map[d];S===void 0&&(S=new Gb(d),uv(i,S)),i=S}}}class Tu{constructor(e,i){this.seq=[],this.map={};const r=e.getProgramParameter(i,e.ACTIVE_UNIFORMS);for(let l=0;l<r;++l){const c=e.getActiveUniform(i,l),h=e.getUniformLocation(i,c.name);Vb(c,h,this)}}setValue(e,i,r,l){const c=this.map[i];c!==void 0&&c.setValue(e,r,l)}setOptional(e,i,r){const l=i[r];l!==void 0&&this.setValue(e,r,l)}static upload(e,i,r,l){for(let c=0,h=i.length;c!==h;++c){const d=i[c],m=r[d.id];m.needsUpdate!==!1&&d.setValue(e,m.value,l)}}static seqWithValue(e,i){const r=[];for(let l=0,c=e.length;l!==c;++l){const h=e[l];h.id in i&&r.push(h)}return r}}function cv(o,e,i){const r=o.createShader(e);return o.shaderSource(r,i),o.compileShader(r),r}const Xb=37297;let kb=0;function Wb(o,e){const i=o.split(`
`),r=[],l=Math.max(e-6,0),c=Math.min(e+6,i.length);for(let h=l;h<c;h++){const d=h+1;r.push(`${d===e?">":" "} ${d}: ${i[h]}`)}return r.join(`
`)}const fv=new oe;function qb(o){Re._getMatrix(fv,Re.workingColorSpace,o);const e=`mat3( ${fv.elements.map(i=>i.toFixed(4))} )`;switch(Re.getTransfer(o)){case Au:return[e,"LinearTransferOETF"];case Fe:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",o),[e,"LinearTransferOETF"]}}function hv(o,e,i){const r=o.getShaderParameter(e,o.COMPILE_STATUS),l=o.getShaderInfoLog(e).trim();if(r&&l==="")return"";const c=/ERROR: 0:(\d+)/.exec(l);if(c){const h=parseInt(c[1]);return i.toUpperCase()+`

`+l+`

`+Wb(o.getShaderSource(e),h)}else return l}function Yb(o,e){const i=qb(e);return[`vec4 ${o}( vec4 value ) {`,`	return ${i[1]}( vec4( value.rgb * ${i[0]}, value.a ) );`,"}"].join(`
`)}function jb(o,e){let i;switch(e){case Yx:i="Linear";break;case jx:i="Reinhard";break;case Zx:i="Cineon";break;case Kx:i="ACESFilmic";break;case Jx:i="AgX";break;case $x:i="Neutral";break;case Qx:i="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),i="Linear"}return"vec3 "+o+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}const vu=new et;function Zb(){Re.getLuminanceCoefficients(vu);const o=vu.x.toFixed(4),e=vu.y.toFixed(4),i=vu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${o}, ${e}, ${i} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Kb(o){return[o.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",o.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Uo).join(`
`)}function Qb(o){const e=[];for(const i in o){const r=o[i];r!==!1&&e.push("#define "+i+" "+r)}return e.join(`
`)}function Jb(o,e){const i={},r=o.getProgramParameter(e,o.ACTIVE_ATTRIBUTES);for(let l=0;l<r;l++){const c=o.getActiveAttrib(e,l),h=c.name;let d=1;c.type===o.FLOAT_MAT2&&(d=2),c.type===o.FLOAT_MAT3&&(d=3),c.type===o.FLOAT_MAT4&&(d=4),i[h]={type:c.type,location:o.getAttribLocation(e,h),locationSize:d}}return i}function Uo(o){return o!==""}function dv(o,e){const i=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return o.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function pv(o,e){return o.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const $b=/^[ \t]*#include +<([\w\d./]+)>/gm;function pd(o){return o.replace($b,eA)}const tA=new Map;function eA(o,e){let i=ue[e];if(i===void 0){const r=tA.get(e);if(r!==void 0)i=ue[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return pd(i)}const nA=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function mv(o){return o.replace(nA,iA)}function iA(o,e,i,r){let l="";for(let c=parseInt(e);c<parseInt(i);c++)l+=r.replace(/\[\s*i\s*\]/g,"[ "+c+" ]").replace(/UNROLLED_LOOP_INDEX/g,c);return l}function gv(o){let e=`precision ${o.precision} float;
	precision ${o.precision} int;
	precision ${o.precision} sampler2D;
	precision ${o.precision} samplerCube;
	precision ${o.precision} sampler3D;
	precision ${o.precision} sampler2DArray;
	precision ${o.precision} sampler2DShadow;
	precision ${o.precision} samplerCubeShadow;
	precision ${o.precision} sampler2DArrayShadow;
	precision ${o.precision} isampler2D;
	precision ${o.precision} isampler3D;
	precision ${o.precision} isamplerCube;
	precision ${o.precision} isampler2DArray;
	precision ${o.precision} usampler2D;
	precision ${o.precision} usampler3D;
	precision ${o.precision} usamplerCube;
	precision ${o.precision} usampler2DArray;
	`;return o.precision==="highp"?e+=`
#define HIGH_PRECISION`:o.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:o.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function aA(o){let e="SHADOWMAP_TYPE_BASIC";return o.shadowMapType===Av?e="SHADOWMAP_TYPE_PCF":o.shadowMapType===Ax?e="SHADOWMAP_TYPE_PCF_SOFT":o.shadowMapType===aa&&(e="SHADOWMAP_TYPE_VSM"),e}function rA(o){let e="ENVMAP_TYPE_CUBE";if(o.envMap)switch(o.envMapMode){case xs:case ys:e="ENVMAP_TYPE_CUBE";break;case Uu:e="ENVMAP_TYPE_CUBE_UV";break}return e}function sA(o){let e="ENVMAP_MODE_REFLECTION";return o.envMap&&o.envMapMode===ys&&(e="ENVMAP_MODE_REFRACTION"),e}function oA(o){let e="ENVMAP_BLENDING_NONE";if(o.envMap)switch(o.combine){case Rv:e="ENVMAP_BLENDING_MULTIPLY";break;case Wx:e="ENVMAP_BLENDING_MIX";break;case qx:e="ENVMAP_BLENDING_ADD";break}return e}function lA(o){const e=o.envMapCubeUVHeight;if(e===null)return null;const i=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,i),112)),texelHeight:r,maxMip:i}}function uA(o,e,i,r){const l=o.getContext(),c=i.defines;let h=i.vertexShader,d=i.fragmentShader;const m=aA(i),p=rA(i),v=sA(i),S=oA(i),x=lA(i),M=Kb(i),b=Qb(c),R=l.createProgram();let y,g,B=i.glslVersion?"#version "+i.glslVersion+`
`:"";i.isRawShaderMaterial?(y=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,b].filter(Uo).join(`
`),y.length>0&&(y+=`
`),g=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,b].filter(Uo).join(`
`),g.length>0&&(g+=`
`)):(y=[gv(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,b,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+v:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+m:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",i.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Uo).join(`
`),g=[gv(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,b,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+p:"",i.envMap?"#define "+v:"",i.envMap?"#define "+S:"",x?"#define CUBEUV_TEXEL_WIDTH "+x.texelWidth:"",x?"#define CUBEUV_TEXEL_HEIGHT "+x.texelHeight:"",x?"#define CUBEUV_MAX_MIP "+x.maxMip+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor||i.batchingColor?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+m:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",i.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==Ha?"#define TONE_MAPPING":"",i.toneMapping!==Ha?ue.tonemapping_pars_fragment:"",i.toneMapping!==Ha?jb("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",ue.colorspace_pars_fragment,Yb("linearToOutputTexel",i.outputColorSpace),Zb(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(Uo).join(`
`)),h=pd(h),h=dv(h,i),h=pv(h,i),d=pd(d),d=dv(d,i),d=pv(d,i),h=mv(h),d=mv(d),i.isRawShaderMaterial!==!0&&(B=`#version 300 es
`,y=[M,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+y,g=["#define varying in",i.glslVersion===b_?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion===b_?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const N=B+y+h,D=B+g+d,W=cv(l,l.VERTEX_SHADER,N),F=cv(l,l.FRAGMENT_SHADER,D);l.attachShader(R,W),l.attachShader(R,F),i.index0AttributeName!==void 0?l.bindAttribLocation(R,0,i.index0AttributeName):i.morphTargets===!0&&l.bindAttribLocation(R,0,"position"),l.linkProgram(R);function O(H){if(o.debug.checkShaderErrors){const st=l.getProgramInfoLog(R).trim(),at=l.getShaderInfoLog(W).trim(),ct=l.getShaderInfoLog(F).trim();let dt=!0,z=!0;if(l.getProgramParameter(R,l.LINK_STATUS)===!1)if(dt=!1,typeof o.debug.onShaderError=="function")o.debug.onShaderError(l,R,W,F);else{const K=hv(l,W,"vertex"),Z=hv(l,F,"fragment");console.error("THREE.WebGLProgram: Shader Error "+l.getError()+" - VALIDATE_STATUS "+l.getProgramParameter(R,l.VALIDATE_STATUS)+`

Material Name: `+H.name+`
Material Type: `+H.type+`

Program Info Log: `+st+`
`+K+`
`+Z)}else st!==""?console.warn("THREE.WebGLProgram: Program Info Log:",st):(at===""||ct==="")&&(z=!1);z&&(H.diagnostics={runnable:dt,programLog:st,vertexShader:{log:at,prefix:y},fragmentShader:{log:ct,prefix:g}})}l.deleteShader(W),l.deleteShader(F),k=new Tu(l,R),w=Jb(l,R)}let k;this.getUniforms=function(){return k===void 0&&O(this),k};let w;this.getAttributes=function(){return w===void 0&&O(this),w};let C=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=l.getProgramParameter(R,Xb)),C},this.destroy=function(){r.releaseStatesOfProgram(this),l.deleteProgram(R),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=kb++,this.cacheKey=e,this.usedTimes=1,this.program=R,this.vertexShader=W,this.fragmentShader=F,this}let cA=0;class fA{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const i=e.vertexShader,r=e.fragmentShader,l=this._getShaderStage(i),c=this._getShaderStage(r),h=this._getShaderCacheForMaterial(e);return h.has(l)===!1&&(h.add(l),l.usedTimes++),h.has(c)===!1&&(h.add(c),c.usedTimes++),this}remove(e){const i=this.materialCache.get(e);for(const r of i)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const i=this.materialCache;let r=i.get(e);return r===void 0&&(r=new Set,i.set(e,r)),r}_getShaderStage(e){const i=this.shaderCache;let r=i.get(e);return r===void 0&&(r=new hA(e),i.set(e,r)),r}}class hA{constructor(e){this.id=cA++,this.code=e,this.usedTimes=0}}function dA(o,e,i,r,l,c,h){const d=new Vv,m=new fA,p=new Set,v=[],S=l.logarithmicDepthBuffer,x=l.vertexTextures;let M=l.precision;const b={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function R(w){return p.add(w),w===0?"uv":`uv${w}`}function y(w,C,H,st,at){const ct=st.fog,dt=at.geometry,z=w.isMeshStandardMaterial?st.environment:null,K=(w.isMeshStandardMaterial?i:e).get(w.envMap||z),Z=K&&K.mapping===Uu?K.image.height:null,xt=b[w.type];w.precision!==null&&(M=l.getMaxPrecision(w.precision),M!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",M,"instead."));const At=dt.morphAttributes.position||dt.morphAttributes.normal||dt.morphAttributes.color,U=At!==void 0?At.length:0;let nt=0;dt.morphAttributes.position!==void 0&&(nt=1),dt.morphAttributes.normal!==void 0&&(nt=2),dt.morphAttributes.color!==void 0&&(nt=3);let St,j,ft,Tt;if(xt){const Ee=wi[xt];St=Ee.vertexShader,j=Ee.fragmentShader}else St=w.vertexShader,j=w.fragmentShader,m.update(w),ft=m.getVertexShaderID(w),Tt=m.getFragmentShaderID(w);const yt=o.getRenderTarget(),Ot=o.state.buffers.depth.getReversed(),Kt=at.isInstancedMesh===!0,Qt=at.isBatchedMesh===!0,Le=!!w.map,He=!!w.matcap,Me=!!K,I=!!w.aoMap,un=!!w.lightMap,_e=!!w.bumpMap,Ne=!!w.normalMap,Vt=!!w.displacementMap,de=!!w.emissiveMap,Yt=!!w.metalnessMap,ie=!!w.roughnessMap,tn=w.anisotropy>0,L=w.clearcoat>0,E=w.dispersion>0,$=w.iridescence>0,pt=w.sheen>0,_t=w.transmission>0,lt=tn&&!!w.anisotropyMap,Xt=L&&!!w.clearcoatMap,Ct=L&&!!w.clearcoatNormalMap,Ht=L&&!!w.clearcoatRoughnessMap,kt=$&&!!w.iridescenceMap,vt=$&&!!w.iridescenceThicknessMap,Rt=pt&&!!w.sheenColorMap,Wt=pt&&!!w.sheenRoughnessMap,Ft=!!w.specularMap,wt=!!w.specularColorMap,ee=!!w.specularIntensityMap,V=_t&&!!w.transmissionMap,Dt=_t&&!!w.thicknessMap,Mt=!!w.gradientMap,Pt=!!w.alphaMap,Et=w.alphaTest>0,gt=!!w.alphaHash,Bt=!!w.extensions;let ne=Ha;w.toneMapped&&(yt===null||yt.isXRRenderTarget===!0)&&(ne=o.toneMapping);const Oe={shaderID:xt,shaderType:w.type,shaderName:w.name,vertexShader:St,fragmentShader:j,defines:w.defines,customVertexShaderID:ft,customFragmentShaderID:Tt,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:M,batching:Qt,batchingColor:Qt&&at._colorsTexture!==null,instancing:Kt,instancingColor:Kt&&at.instanceColor!==null,instancingMorph:Kt&&at.morphTexture!==null,supportsVertexTextures:x,outputColorSpace:yt===null?o.outputColorSpace:yt.isXRRenderTarget===!0?yt.texture.colorSpace:Ms,alphaToCoverage:!!w.alphaToCoverage,map:Le,matcap:He,envMap:Me,envMapMode:Me&&K.mapping,envMapCubeUVHeight:Z,aoMap:I,lightMap:un,bumpMap:_e,normalMap:Ne,displacementMap:x&&Vt,emissiveMap:de,normalMapObjectSpace:Ne&&w.normalMapType===iy,normalMapTangentSpace:Ne&&w.normalMapType===Bv,metalnessMap:Yt,roughnessMap:ie,anisotropy:tn,anisotropyMap:lt,clearcoat:L,clearcoatMap:Xt,clearcoatNormalMap:Ct,clearcoatRoughnessMap:Ht,dispersion:E,iridescence:$,iridescenceMap:kt,iridescenceThicknessMap:vt,sheen:pt,sheenColorMap:Rt,sheenRoughnessMap:Wt,specularMap:Ft,specularColorMap:wt,specularIntensityMap:ee,transmission:_t,transmissionMap:V,thicknessMap:Dt,gradientMap:Mt,opaque:w.transparent===!1&&w.blending===gs&&w.alphaToCoverage===!1,alphaMap:Pt,alphaTest:Et,alphaHash:gt,combine:w.combine,mapUv:Le&&R(w.map.channel),aoMapUv:I&&R(w.aoMap.channel),lightMapUv:un&&R(w.lightMap.channel),bumpMapUv:_e&&R(w.bumpMap.channel),normalMapUv:Ne&&R(w.normalMap.channel),displacementMapUv:Vt&&R(w.displacementMap.channel),emissiveMapUv:de&&R(w.emissiveMap.channel),metalnessMapUv:Yt&&R(w.metalnessMap.channel),roughnessMapUv:ie&&R(w.roughnessMap.channel),anisotropyMapUv:lt&&R(w.anisotropyMap.channel),clearcoatMapUv:Xt&&R(w.clearcoatMap.channel),clearcoatNormalMapUv:Ct&&R(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ht&&R(w.clearcoatRoughnessMap.channel),iridescenceMapUv:kt&&R(w.iridescenceMap.channel),iridescenceThicknessMapUv:vt&&R(w.iridescenceThicknessMap.channel),sheenColorMapUv:Rt&&R(w.sheenColorMap.channel),sheenRoughnessMapUv:Wt&&R(w.sheenRoughnessMap.channel),specularMapUv:Ft&&R(w.specularMap.channel),specularColorMapUv:wt&&R(w.specularColorMap.channel),specularIntensityMapUv:ee&&R(w.specularIntensityMap.channel),transmissionMapUv:V&&R(w.transmissionMap.channel),thicknessMapUv:Dt&&R(w.thicknessMap.channel),alphaMapUv:Pt&&R(w.alphaMap.channel),vertexTangents:!!dt.attributes.tangent&&(Ne||tn),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!dt.attributes.color&&dt.attributes.color.itemSize===4,pointsUvs:at.isPoints===!0&&!!dt.attributes.uv&&(Le||Pt),fog:!!ct,useFog:w.fog===!0,fogExp2:!!ct&&ct.isFogExp2,flatShading:w.flatShading===!0&&w.wireframe===!1,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:S,reverseDepthBuffer:Ot,skinning:at.isSkinnedMesh===!0,morphTargets:dt.morphAttributes.position!==void 0,morphNormals:dt.morphAttributes.normal!==void 0,morphColors:dt.morphAttributes.color!==void 0,morphTargetsCount:U,morphTextureStride:nt,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numClippingPlanes:h.numPlanes,numClipIntersection:h.numIntersection,dithering:w.dithering,shadowMapEnabled:o.shadowMap.enabled&&H.length>0,shadowMapType:o.shadowMap.type,toneMapping:ne,decodeVideoTexture:Le&&w.map.isVideoTexture===!0&&Re.getTransfer(w.map.colorSpace)===Fe,decodeVideoTextureEmissive:de&&w.emissiveMap.isVideoTexture===!0&&Re.getTransfer(w.emissiveMap.colorSpace)===Fe,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===ra,flipSided:w.side===Vn,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:Bt&&w.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Bt&&w.extensions.multiDraw===!0||Qt)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return Oe.vertexUv1s=p.has(1),Oe.vertexUv2s=p.has(2),Oe.vertexUv3s=p.has(3),p.clear(),Oe}function g(w){const C=[];if(w.shaderID?C.push(w.shaderID):(C.push(w.customVertexShaderID),C.push(w.customFragmentShaderID)),w.defines!==void 0)for(const H in w.defines)C.push(H),C.push(w.defines[H]);return w.isRawShaderMaterial===!1&&(B(C,w),N(C,w),C.push(o.outputColorSpace)),C.push(w.customProgramCacheKey),C.join()}function B(w,C){w.push(C.precision),w.push(C.outputColorSpace),w.push(C.envMapMode),w.push(C.envMapCubeUVHeight),w.push(C.mapUv),w.push(C.alphaMapUv),w.push(C.lightMapUv),w.push(C.aoMapUv),w.push(C.bumpMapUv),w.push(C.normalMapUv),w.push(C.displacementMapUv),w.push(C.emissiveMapUv),w.push(C.metalnessMapUv),w.push(C.roughnessMapUv),w.push(C.anisotropyMapUv),w.push(C.clearcoatMapUv),w.push(C.clearcoatNormalMapUv),w.push(C.clearcoatRoughnessMapUv),w.push(C.iridescenceMapUv),w.push(C.iridescenceThicknessMapUv),w.push(C.sheenColorMapUv),w.push(C.sheenRoughnessMapUv),w.push(C.specularMapUv),w.push(C.specularColorMapUv),w.push(C.specularIntensityMapUv),w.push(C.transmissionMapUv),w.push(C.thicknessMapUv),w.push(C.combine),w.push(C.fogExp2),w.push(C.sizeAttenuation),w.push(C.morphTargetsCount),w.push(C.morphAttributeCount),w.push(C.numDirLights),w.push(C.numPointLights),w.push(C.numSpotLights),w.push(C.numSpotLightMaps),w.push(C.numHemiLights),w.push(C.numRectAreaLights),w.push(C.numDirLightShadows),w.push(C.numPointLightShadows),w.push(C.numSpotLightShadows),w.push(C.numSpotLightShadowsWithMaps),w.push(C.numLightProbes),w.push(C.shadowMapType),w.push(C.toneMapping),w.push(C.numClippingPlanes),w.push(C.numClipIntersection),w.push(C.depthPacking)}function N(w,C){d.disableAll(),C.supportsVertexTextures&&d.enable(0),C.instancing&&d.enable(1),C.instancingColor&&d.enable(2),C.instancingMorph&&d.enable(3),C.matcap&&d.enable(4),C.envMap&&d.enable(5),C.normalMapObjectSpace&&d.enable(6),C.normalMapTangentSpace&&d.enable(7),C.clearcoat&&d.enable(8),C.iridescence&&d.enable(9),C.alphaTest&&d.enable(10),C.vertexColors&&d.enable(11),C.vertexAlphas&&d.enable(12),C.vertexUv1s&&d.enable(13),C.vertexUv2s&&d.enable(14),C.vertexUv3s&&d.enable(15),C.vertexTangents&&d.enable(16),C.anisotropy&&d.enable(17),C.alphaHash&&d.enable(18),C.batching&&d.enable(19),C.dispersion&&d.enable(20),C.batchingColor&&d.enable(21),C.gradientMap&&d.enable(22),w.push(d.mask),d.disableAll(),C.fog&&d.enable(0),C.useFog&&d.enable(1),C.flatShading&&d.enable(2),C.logarithmicDepthBuffer&&d.enable(3),C.reverseDepthBuffer&&d.enable(4),C.skinning&&d.enable(5),C.morphTargets&&d.enable(6),C.morphNormals&&d.enable(7),C.morphColors&&d.enable(8),C.premultipliedAlpha&&d.enable(9),C.shadowMapEnabled&&d.enable(10),C.doubleSided&&d.enable(11),C.flipSided&&d.enable(12),C.useDepthPacking&&d.enable(13),C.dithering&&d.enable(14),C.transmission&&d.enable(15),C.sheen&&d.enable(16),C.opaque&&d.enable(17),C.pointsUvs&&d.enable(18),C.decodeVideoTexture&&d.enable(19),C.decodeVideoTextureEmissive&&d.enable(20),C.alphaToCoverage&&d.enable(21),w.push(d.mask)}function D(w){const C=b[w.type];let H;if(C){const st=wi[C];H=Oy.clone(st.uniforms)}else H=w.uniforms;return H}function W(w,C){let H;for(let st=0,at=v.length;st<at;st++){const ct=v[st];if(ct.cacheKey===C){H=ct,++H.usedTimes;break}}return H===void 0&&(H=new uA(o,C,w,c),v.push(H)),H}function F(w){if(--w.usedTimes===0){const C=v.indexOf(w);v[C]=v[v.length-1],v.pop(),w.destroy()}}function O(w){m.remove(w)}function k(){m.dispose()}return{getParameters:y,getProgramCacheKey:g,getUniforms:D,acquireProgram:W,releaseProgram:F,releaseShaderCache:O,programs:v,dispose:k}}function pA(){let o=new WeakMap;function e(h){return o.has(h)}function i(h){let d=o.get(h);return d===void 0&&(d={},o.set(h,d)),d}function r(h){o.delete(h)}function l(h,d,m){o.get(h)[d]=m}function c(){o=new WeakMap}return{has:e,get:i,remove:r,update:l,dispose:c}}function mA(o,e){return o.groupOrder!==e.groupOrder?o.groupOrder-e.groupOrder:o.renderOrder!==e.renderOrder?o.renderOrder-e.renderOrder:o.material.id!==e.material.id?o.material.id-e.material.id:o.z!==e.z?o.z-e.z:o.id-e.id}function _v(o,e){return o.groupOrder!==e.groupOrder?o.groupOrder-e.groupOrder:o.renderOrder!==e.renderOrder?o.renderOrder-e.renderOrder:o.z!==e.z?e.z-o.z:o.id-e.id}function vv(){const o=[];let e=0;const i=[],r=[],l=[];function c(){e=0,i.length=0,r.length=0,l.length=0}function h(S,x,M,b,R,y){let g=o[e];return g===void 0?(g={id:S.id,object:S,geometry:x,material:M,groupOrder:b,renderOrder:S.renderOrder,z:R,group:y},o[e]=g):(g.id=S.id,g.object=S,g.geometry=x,g.material=M,g.groupOrder=b,g.renderOrder=S.renderOrder,g.z=R,g.group=y),e++,g}function d(S,x,M,b,R,y){const g=h(S,x,M,b,R,y);M.transmission>0?r.push(g):M.transparent===!0?l.push(g):i.push(g)}function m(S,x,M,b,R,y){const g=h(S,x,M,b,R,y);M.transmission>0?r.unshift(g):M.transparent===!0?l.unshift(g):i.unshift(g)}function p(S,x){i.length>1&&i.sort(S||mA),r.length>1&&r.sort(x||_v),l.length>1&&l.sort(x||_v)}function v(){for(let S=e,x=o.length;S<x;S++){const M=o[S];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:i,transmissive:r,transparent:l,init:c,push:d,unshift:m,finish:v,sort:p}}function gA(){let o=new WeakMap;function e(r,l){const c=o.get(r);let h;return c===void 0?(h=new vv,o.set(r,[h])):l>=c.length?(h=new vv,c.push(h)):h=c[l],h}function i(){o=new WeakMap}return{get:e,dispose:i}}function _A(){const o={};return{get:function(e){if(o[e.id]!==void 0)return o[e.id];let i;switch(e.type){case"DirectionalLight":i={direction:new et,color:new ye};break;case"SpotLight":i={position:new et,direction:new et,color:new ye,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new et,color:new ye,distance:0,decay:0};break;case"HemisphereLight":i={direction:new et,skyColor:new ye,groundColor:new ye};break;case"RectAreaLight":i={color:new ye,position:new et,halfWidth:new et,halfHeight:new et};break}return o[e.id]=i,i}}}function vA(){const o={};return{get:function(e){if(o[e.id]!==void 0)return o[e.id];let i;switch(e.type){case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ce};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ce};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ce,shadowCameraNear:1,shadowCameraFar:1e3};break}return o[e.id]=i,i}}}let SA=0;function xA(o,e){return(e.castShadow?2:0)-(o.castShadow?2:0)+(e.map?1:0)-(o.map?1:0)}function yA(o){const e=new _A,i=vA(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let p=0;p<9;p++)r.probe.push(new et);const l=new et,c=new je,h=new je;function d(p){let v=0,S=0,x=0;for(let w=0;w<9;w++)r.probe[w].set(0,0,0);let M=0,b=0,R=0,y=0,g=0,B=0,N=0,D=0,W=0,F=0,O=0;p.sort(xA);for(let w=0,C=p.length;w<C;w++){const H=p[w],st=H.color,at=H.intensity,ct=H.distance,dt=H.shadow&&H.shadow.map?H.shadow.map.texture:null;if(H.isAmbientLight)v+=st.r*at,S+=st.g*at,x+=st.b*at;else if(H.isLightProbe){for(let z=0;z<9;z++)r.probe[z].addScaledVector(H.sh.coefficients[z],at);O++}else if(H.isDirectionalLight){const z=e.get(H);if(z.color.copy(H.color).multiplyScalar(H.intensity),H.castShadow){const K=H.shadow,Z=i.get(H);Z.shadowIntensity=K.intensity,Z.shadowBias=K.bias,Z.shadowNormalBias=K.normalBias,Z.shadowRadius=K.radius,Z.shadowMapSize=K.mapSize,r.directionalShadow[M]=Z,r.directionalShadowMap[M]=dt,r.directionalShadowMatrix[M]=H.shadow.matrix,B++}r.directional[M]=z,M++}else if(H.isSpotLight){const z=e.get(H);z.position.setFromMatrixPosition(H.matrixWorld),z.color.copy(st).multiplyScalar(at),z.distance=ct,z.coneCos=Math.cos(H.angle),z.penumbraCos=Math.cos(H.angle*(1-H.penumbra)),z.decay=H.decay,r.spot[R]=z;const K=H.shadow;if(H.map&&(r.spotLightMap[W]=H.map,W++,K.updateMatrices(H),H.castShadow&&F++),r.spotLightMatrix[R]=K.matrix,H.castShadow){const Z=i.get(H);Z.shadowIntensity=K.intensity,Z.shadowBias=K.bias,Z.shadowNormalBias=K.normalBias,Z.shadowRadius=K.radius,Z.shadowMapSize=K.mapSize,r.spotShadow[R]=Z,r.spotShadowMap[R]=dt,D++}R++}else if(H.isRectAreaLight){const z=e.get(H);z.color.copy(st).multiplyScalar(at),z.halfWidth.set(H.width*.5,0,0),z.halfHeight.set(0,H.height*.5,0),r.rectArea[y]=z,y++}else if(H.isPointLight){const z=e.get(H);if(z.color.copy(H.color).multiplyScalar(H.intensity),z.distance=H.distance,z.decay=H.decay,H.castShadow){const K=H.shadow,Z=i.get(H);Z.shadowIntensity=K.intensity,Z.shadowBias=K.bias,Z.shadowNormalBias=K.normalBias,Z.shadowRadius=K.radius,Z.shadowMapSize=K.mapSize,Z.shadowCameraNear=K.camera.near,Z.shadowCameraFar=K.camera.far,r.pointShadow[b]=Z,r.pointShadowMap[b]=dt,r.pointShadowMatrix[b]=H.shadow.matrix,N++}r.point[b]=z,b++}else if(H.isHemisphereLight){const z=e.get(H);z.skyColor.copy(H.color).multiplyScalar(at),z.groundColor.copy(H.groundColor).multiplyScalar(at),r.hemi[g]=z,g++}}y>0&&(o.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=Lt.LTC_FLOAT_1,r.rectAreaLTC2=Lt.LTC_FLOAT_2):(r.rectAreaLTC1=Lt.LTC_HALF_1,r.rectAreaLTC2=Lt.LTC_HALF_2)),r.ambient[0]=v,r.ambient[1]=S,r.ambient[2]=x;const k=r.hash;(k.directionalLength!==M||k.pointLength!==b||k.spotLength!==R||k.rectAreaLength!==y||k.hemiLength!==g||k.numDirectionalShadows!==B||k.numPointShadows!==N||k.numSpotShadows!==D||k.numSpotMaps!==W||k.numLightProbes!==O)&&(r.directional.length=M,r.spot.length=R,r.rectArea.length=y,r.point.length=b,r.hemi.length=g,r.directionalShadow.length=B,r.directionalShadowMap.length=B,r.pointShadow.length=N,r.pointShadowMap.length=N,r.spotShadow.length=D,r.spotShadowMap.length=D,r.directionalShadowMatrix.length=B,r.pointShadowMatrix.length=N,r.spotLightMatrix.length=D+W-F,r.spotLightMap.length=W,r.numSpotLightShadowsWithMaps=F,r.numLightProbes=O,k.directionalLength=M,k.pointLength=b,k.spotLength=R,k.rectAreaLength=y,k.hemiLength=g,k.numDirectionalShadows=B,k.numPointShadows=N,k.numSpotShadows=D,k.numSpotMaps=W,k.numLightProbes=O,r.version=SA++)}function m(p,v){let S=0,x=0,M=0,b=0,R=0;const y=v.matrixWorldInverse;for(let g=0,B=p.length;g<B;g++){const N=p[g];if(N.isDirectionalLight){const D=r.directional[S];D.direction.setFromMatrixPosition(N.matrixWorld),l.setFromMatrixPosition(N.target.matrixWorld),D.direction.sub(l),D.direction.transformDirection(y),S++}else if(N.isSpotLight){const D=r.spot[M];D.position.setFromMatrixPosition(N.matrixWorld),D.position.applyMatrix4(y),D.direction.setFromMatrixPosition(N.matrixWorld),l.setFromMatrixPosition(N.target.matrixWorld),D.direction.sub(l),D.direction.transformDirection(y),M++}else if(N.isRectAreaLight){const D=r.rectArea[b];D.position.setFromMatrixPosition(N.matrixWorld),D.position.applyMatrix4(y),h.identity(),c.copy(N.matrixWorld),c.premultiply(y),h.extractRotation(c),D.halfWidth.set(N.width*.5,0,0),D.halfHeight.set(0,N.height*.5,0),D.halfWidth.applyMatrix4(h),D.halfHeight.applyMatrix4(h),b++}else if(N.isPointLight){const D=r.point[x];D.position.setFromMatrixPosition(N.matrixWorld),D.position.applyMatrix4(y),x++}else if(N.isHemisphereLight){const D=r.hemi[R];D.direction.setFromMatrixPosition(N.matrixWorld),D.direction.transformDirection(y),R++}}}return{setup:d,setupView:m,state:r}}function Sv(o){const e=new yA(o),i=[],r=[];function l(v){p.camera=v,i.length=0,r.length=0}function c(v){i.push(v)}function h(v){r.push(v)}function d(){e.setup(i)}function m(v){e.setupView(i,v)}const p={lightsArray:i,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:l,state:p,setupLights:d,setupLightsView:m,pushLight:c,pushShadow:h}}function MA(o){let e=new WeakMap;function i(l,c=0){const h=e.get(l);let d;return h===void 0?(d=new Sv(o),e.set(l,[d])):c>=h.length?(d=new Sv(o),h.push(d)):d=h[c],d}function r(){e=new WeakMap}return{get:i,dispose:r}}const EA=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,TA=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function bA(o,e,i){let r=new Td;const l=new Ce,c=new Ce,h=new $e,d=new Yy({depthPacking:ny}),m=new jy,p={},v=i.maxTextureSize,S={[Ga]:Vn,[Vn]:Ga,[ra]:ra},x=new Va({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ce},radius:{value:4}},vertexShader:EA,fragmentShader:TA}),M=x.clone();M.defines.HORIZONTAL_PASS=1;const b=new Ei;b.setAttribute("position",new Ui(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const R=new yi(b,x),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Av;let g=this.type;this.render=function(F,O,k){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||F.length===0)return;const w=o.getRenderTarget(),C=o.getActiveCubeFace(),H=o.getActiveMipmapLevel(),st=o.state;st.setBlending(Fa),st.buffers.color.setClear(1,1,1,1),st.buffers.depth.setTest(!0),st.setScissorTest(!1);const at=g!==aa&&this.type===aa,ct=g===aa&&this.type!==aa;for(let dt=0,z=F.length;dt<z;dt++){const K=F[dt],Z=K.shadow;if(Z===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;l.copy(Z.mapSize);const xt=Z.getFrameExtents();if(l.multiply(xt),c.copy(Z.mapSize),(l.x>v||l.y>v)&&(l.x>v&&(c.x=Math.floor(v/xt.x),l.x=c.x*xt.x,Z.mapSize.x=c.x),l.y>v&&(c.y=Math.floor(v/xt.y),l.y=c.y*xt.y,Z.mapSize.y=c.y)),Z.map===null||at===!0||ct===!0){const U=this.type!==aa?{minFilter:Mi,magFilter:Mi}:{};Z.map!==null&&Z.map.dispose(),Z.map=new yr(l.x,l.y,U),Z.map.texture.name=K.name+".shadowMap",Z.camera.updateProjectionMatrix()}o.setRenderTarget(Z.map),o.clear();const At=Z.getViewportCount();for(let U=0;U<At;U++){const nt=Z.getViewport(U);h.set(c.x*nt.x,c.y*nt.y,c.x*nt.z,c.y*nt.w),st.viewport(h),Z.updateMatrices(K,U),r=Z.getFrustum(),D(O,k,Z.camera,K,this.type)}Z.isPointLightShadow!==!0&&this.type===aa&&B(Z,k),Z.needsUpdate=!1}g=this.type,y.needsUpdate=!1,o.setRenderTarget(w,C,H)};function B(F,O){const k=e.update(R);x.defines.VSM_SAMPLES!==F.blurSamples&&(x.defines.VSM_SAMPLES=F.blurSamples,M.defines.VSM_SAMPLES=F.blurSamples,x.needsUpdate=!0,M.needsUpdate=!0),F.mapPass===null&&(F.mapPass=new yr(l.x,l.y)),x.uniforms.shadow_pass.value=F.map.texture,x.uniforms.resolution.value=F.mapSize,x.uniforms.radius.value=F.radius,o.setRenderTarget(F.mapPass),o.clear(),o.renderBufferDirect(O,null,k,x,R,null),M.uniforms.shadow_pass.value=F.mapPass.texture,M.uniforms.resolution.value=F.mapSize,M.uniforms.radius.value=F.radius,o.setRenderTarget(F.map),o.clear(),o.renderBufferDirect(O,null,k,M,R,null)}function N(F,O,k,w){let C=null;const H=k.isPointLight===!0?F.customDistanceMaterial:F.customDepthMaterial;if(H!==void 0)C=H;else if(C=k.isPointLight===!0?m:d,o.localClippingEnabled&&O.clipShadows===!0&&Array.isArray(O.clippingPlanes)&&O.clippingPlanes.length!==0||O.displacementMap&&O.displacementScale!==0||O.alphaMap&&O.alphaTest>0||O.map&&O.alphaTest>0||O.alphaToCoverage===!0){const st=C.uuid,at=O.uuid;let ct=p[st];ct===void 0&&(ct={},p[st]=ct);let dt=ct[at];dt===void 0&&(dt=C.clone(),ct[at]=dt,O.addEventListener("dispose",W)),C=dt}if(C.visible=O.visible,C.wireframe=O.wireframe,w===aa?C.side=O.shadowSide!==null?O.shadowSide:O.side:C.side=O.shadowSide!==null?O.shadowSide:S[O.side],C.alphaMap=O.alphaMap,C.alphaTest=O.alphaToCoverage===!0?.5:O.alphaTest,C.map=O.map,C.clipShadows=O.clipShadows,C.clippingPlanes=O.clippingPlanes,C.clipIntersection=O.clipIntersection,C.displacementMap=O.displacementMap,C.displacementScale=O.displacementScale,C.displacementBias=O.displacementBias,C.wireframeLinewidth=O.wireframeLinewidth,C.linewidth=O.linewidth,k.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const st=o.properties.get(C);st.light=k}return C}function D(F,O,k,w,C){if(F.visible===!1)return;if(F.layers.test(O.layers)&&(F.isMesh||F.isLine||F.isPoints)&&(F.castShadow||F.receiveShadow&&C===aa)&&(!F.frustumCulled||r.intersectsObject(F))){F.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,F.matrixWorld);const at=e.update(F),ct=F.material;if(Array.isArray(ct)){const dt=at.groups;for(let z=0,K=dt.length;z<K;z++){const Z=dt[z],xt=ct[Z.materialIndex];if(xt&&xt.visible){const At=N(F,xt,w,C);F.onBeforeShadow(o,F,O,k,at,At,Z),o.renderBufferDirect(k,null,at,At,F,Z),F.onAfterShadow(o,F,O,k,at,At,Z)}}}else if(ct.visible){const dt=N(F,ct,w,C);F.onBeforeShadow(o,F,O,k,at,dt,null),o.renderBufferDirect(k,null,at,dt,F,null),F.onAfterShadow(o,F,O,k,at,dt,null)}}const st=F.children;for(let at=0,ct=st.length;at<ct;at++)D(st[at],O,k,w,C)}function W(F){F.target.removeEventListener("dispose",W);for(const k in p){const w=p[k],C=F.target.uuid;C in w&&(w[C].dispose(),delete w[C])}}}const AA={[Dh]:Uh,[Lh]:zh,[Nh]:Ph,[Ss]:Oh,[Uh]:Dh,[zh]:Lh,[Ph]:Nh,[Oh]:Ss};function RA(o,e){function i(){let V=!1;const Dt=new $e;let Mt=null;const Pt=new $e(0,0,0,0);return{setMask:function(Et){Mt!==Et&&!V&&(o.colorMask(Et,Et,Et,Et),Mt=Et)},setLocked:function(Et){V=Et},setClear:function(Et,gt,Bt,ne,Oe){Oe===!0&&(Et*=ne,gt*=ne,Bt*=ne),Dt.set(Et,gt,Bt,ne),Pt.equals(Dt)===!1&&(o.clearColor(Et,gt,Bt,ne),Pt.copy(Dt))},reset:function(){V=!1,Mt=null,Pt.set(-1,0,0,0)}}}function r(){let V=!1,Dt=!1,Mt=null,Pt=null,Et=null;return{setReversed:function(gt){if(Dt!==gt){const Bt=e.get("EXT_clip_control");gt?Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.ZERO_TO_ONE_EXT):Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.NEGATIVE_ONE_TO_ONE_EXT),Dt=gt;const ne=Et;Et=null,this.setClear(ne)}},getReversed:function(){return Dt},setTest:function(gt){gt?yt(o.DEPTH_TEST):Ot(o.DEPTH_TEST)},setMask:function(gt){Mt!==gt&&!V&&(o.depthMask(gt),Mt=gt)},setFunc:function(gt){if(Dt&&(gt=AA[gt]),Pt!==gt){switch(gt){case Dh:o.depthFunc(o.NEVER);break;case Uh:o.depthFunc(o.ALWAYS);break;case Lh:o.depthFunc(o.LESS);break;case Ss:o.depthFunc(o.LEQUAL);break;case Nh:o.depthFunc(o.EQUAL);break;case Oh:o.depthFunc(o.GEQUAL);break;case zh:o.depthFunc(o.GREATER);break;case Ph:o.depthFunc(o.NOTEQUAL);break;default:o.depthFunc(o.LEQUAL)}Pt=gt}},setLocked:function(gt){V=gt},setClear:function(gt){Et!==gt&&(Dt&&(gt=1-gt),o.clearDepth(gt),Et=gt)},reset:function(){V=!1,Mt=null,Pt=null,Et=null,Dt=!1}}}function l(){let V=!1,Dt=null,Mt=null,Pt=null,Et=null,gt=null,Bt=null,ne=null,Oe=null;return{setTest:function(Ee){V||(Ee?yt(o.STENCIL_TEST):Ot(o.STENCIL_TEST))},setMask:function(Ee){Dt!==Ee&&!V&&(o.stencilMask(Ee),Dt=Ee)},setFunc:function(Ee,gn,ci){(Mt!==Ee||Pt!==gn||Et!==ci)&&(o.stencilFunc(Ee,gn,ci),Mt=Ee,Pt=gn,Et=ci)},setOp:function(Ee,gn,ci){(gt!==Ee||Bt!==gn||ne!==ci)&&(o.stencilOp(Ee,gn,ci),gt=Ee,Bt=gn,ne=ci)},setLocked:function(Ee){V=Ee},setClear:function(Ee){Oe!==Ee&&(o.clearStencil(Ee),Oe=Ee)},reset:function(){V=!1,Dt=null,Mt=null,Pt=null,Et=null,gt=null,Bt=null,ne=null,Oe=null}}}const c=new i,h=new r,d=new l,m=new WeakMap,p=new WeakMap;let v={},S={},x=new WeakMap,M=[],b=null,R=!1,y=null,g=null,B=null,N=null,D=null,W=null,F=null,O=new ye(0,0,0),k=0,w=!1,C=null,H=null,st=null,at=null,ct=null;const dt=o.getParameter(o.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,K=0;const Z=o.getParameter(o.VERSION);Z.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(Z)[1]),z=K>=1):Z.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),z=K>=2);let xt=null,At={};const U=o.getParameter(o.SCISSOR_BOX),nt=o.getParameter(o.VIEWPORT),St=new $e().fromArray(U),j=new $e().fromArray(nt);function ft(V,Dt,Mt,Pt){const Et=new Uint8Array(4),gt=o.createTexture();o.bindTexture(V,gt),o.texParameteri(V,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(V,o.TEXTURE_MAG_FILTER,o.NEAREST);for(let Bt=0;Bt<Mt;Bt++)V===o.TEXTURE_3D||V===o.TEXTURE_2D_ARRAY?o.texImage3D(Dt,0,o.RGBA,1,1,Pt,0,o.RGBA,o.UNSIGNED_BYTE,Et):o.texImage2D(Dt+Bt,0,o.RGBA,1,1,0,o.RGBA,o.UNSIGNED_BYTE,Et);return gt}const Tt={};Tt[o.TEXTURE_2D]=ft(o.TEXTURE_2D,o.TEXTURE_2D,1),Tt[o.TEXTURE_CUBE_MAP]=ft(o.TEXTURE_CUBE_MAP,o.TEXTURE_CUBE_MAP_POSITIVE_X,6),Tt[o.TEXTURE_2D_ARRAY]=ft(o.TEXTURE_2D_ARRAY,o.TEXTURE_2D_ARRAY,1,1),Tt[o.TEXTURE_3D]=ft(o.TEXTURE_3D,o.TEXTURE_3D,1,1),c.setClear(0,0,0,1),h.setClear(1),d.setClear(0),yt(o.DEPTH_TEST),h.setFunc(Ss),_e(!1),Ne(S_),yt(o.CULL_FACE),I(Fa);function yt(V){v[V]!==!0&&(o.enable(V),v[V]=!0)}function Ot(V){v[V]!==!1&&(o.disable(V),v[V]=!1)}function Kt(V,Dt){return S[V]!==Dt?(o.bindFramebuffer(V,Dt),S[V]=Dt,V===o.DRAW_FRAMEBUFFER&&(S[o.FRAMEBUFFER]=Dt),V===o.FRAMEBUFFER&&(S[o.DRAW_FRAMEBUFFER]=Dt),!0):!1}function Qt(V,Dt){let Mt=M,Pt=!1;if(V){Mt=x.get(Dt),Mt===void 0&&(Mt=[],x.set(Dt,Mt));const Et=V.textures;if(Mt.length!==Et.length||Mt[0]!==o.COLOR_ATTACHMENT0){for(let gt=0,Bt=Et.length;gt<Bt;gt++)Mt[gt]=o.COLOR_ATTACHMENT0+gt;Mt.length=Et.length,Pt=!0}}else Mt[0]!==o.BACK&&(Mt[0]=o.BACK,Pt=!0);Pt&&o.drawBuffers(Mt)}function Le(V){return b!==V?(o.useProgram(V),b=V,!0):!1}const He={[gr]:o.FUNC_ADD,[Cx]:o.FUNC_SUBTRACT,[wx]:o.FUNC_REVERSE_SUBTRACT};He[Dx]=o.MIN,He[Ux]=o.MAX;const Me={[Lx]:o.ZERO,[Nx]:o.ONE,[Ox]:o.SRC_COLOR,[Ch]:o.SRC_ALPHA,[Hx]:o.SRC_ALPHA_SATURATE,[Ix]:o.DST_COLOR,[Px]:o.DST_ALPHA,[zx]:o.ONE_MINUS_SRC_COLOR,[wh]:o.ONE_MINUS_SRC_ALPHA,[Fx]:o.ONE_MINUS_DST_COLOR,[Bx]:o.ONE_MINUS_DST_ALPHA,[Gx]:o.CONSTANT_COLOR,[Vx]:o.ONE_MINUS_CONSTANT_COLOR,[Xx]:o.CONSTANT_ALPHA,[kx]:o.ONE_MINUS_CONSTANT_ALPHA};function I(V,Dt,Mt,Pt,Et,gt,Bt,ne,Oe,Ee){if(V===Fa){R===!0&&(Ot(o.BLEND),R=!1);return}if(R===!1&&(yt(o.BLEND),R=!0),V!==Rx){if(V!==y||Ee!==w){if((g!==gr||D!==gr)&&(o.blendEquation(o.FUNC_ADD),g=gr,D=gr),Ee)switch(V){case gs:o.blendFuncSeparate(o.ONE,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case x_:o.blendFunc(o.ONE,o.ONE);break;case y_:o.blendFuncSeparate(o.ZERO,o.ONE_MINUS_SRC_COLOR,o.ZERO,o.ONE);break;case M_:o.blendFuncSeparate(o.DST_COLOR,o.ONE_MINUS_SRC_ALPHA,o.ZERO,o.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}else switch(V){case gs:o.blendFuncSeparate(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case x_:o.blendFuncSeparate(o.SRC_ALPHA,o.ONE,o.ONE,o.ONE);break;case y_:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case M_:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}B=null,N=null,W=null,F=null,O.set(0,0,0),k=0,y=V,w=Ee}return}Et=Et||Dt,gt=gt||Mt,Bt=Bt||Pt,(Dt!==g||Et!==D)&&(o.blendEquationSeparate(He[Dt],He[Et]),g=Dt,D=Et),(Mt!==B||Pt!==N||gt!==W||Bt!==F)&&(o.blendFuncSeparate(Me[Mt],Me[Pt],Me[gt],Me[Bt]),B=Mt,N=Pt,W=gt,F=Bt),(ne.equals(O)===!1||Oe!==k)&&(o.blendColor(ne.r,ne.g,ne.b,Oe),O.copy(ne),k=Oe),y=V,w=!1}function un(V,Dt){V.side===ra?Ot(o.CULL_FACE):yt(o.CULL_FACE);let Mt=V.side===Vn;Dt&&(Mt=!Mt),_e(Mt),V.blending===gs&&V.transparent===!1?I(Fa):I(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),h.setFunc(V.depthFunc),h.setTest(V.depthTest),h.setMask(V.depthWrite),c.setMask(V.colorWrite);const Pt=V.stencilWrite;d.setTest(Pt),Pt&&(d.setMask(V.stencilWriteMask),d.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),d.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),de(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?yt(o.SAMPLE_ALPHA_TO_COVERAGE):Ot(o.SAMPLE_ALPHA_TO_COVERAGE)}function _e(V){C!==V&&(V?o.frontFace(o.CW):o.frontFace(o.CCW),C=V)}function Ne(V){V!==Tx?(yt(o.CULL_FACE),V!==H&&(V===S_?o.cullFace(o.BACK):V===bx?o.cullFace(o.FRONT):o.cullFace(o.FRONT_AND_BACK))):Ot(o.CULL_FACE),H=V}function Vt(V){V!==st&&(z&&o.lineWidth(V),st=V)}function de(V,Dt,Mt){V?(yt(o.POLYGON_OFFSET_FILL),(at!==Dt||ct!==Mt)&&(o.polygonOffset(Dt,Mt),at=Dt,ct=Mt)):Ot(o.POLYGON_OFFSET_FILL)}function Yt(V){V?yt(o.SCISSOR_TEST):Ot(o.SCISSOR_TEST)}function ie(V){V===void 0&&(V=o.TEXTURE0+dt-1),xt!==V&&(o.activeTexture(V),xt=V)}function tn(V,Dt,Mt){Mt===void 0&&(xt===null?Mt=o.TEXTURE0+dt-1:Mt=xt);let Pt=At[Mt];Pt===void 0&&(Pt={type:void 0,texture:void 0},At[Mt]=Pt),(Pt.type!==V||Pt.texture!==Dt)&&(xt!==Mt&&(o.activeTexture(Mt),xt=Mt),o.bindTexture(V,Dt||Tt[V]),Pt.type=V,Pt.texture=Dt)}function L(){const V=At[xt];V!==void 0&&V.type!==void 0&&(o.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function E(){try{o.compressedTexImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function $(){try{o.compressedTexImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function pt(){try{o.texSubImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function _t(){try{o.texSubImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function lt(){try{o.compressedTexSubImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Xt(){try{o.compressedTexSubImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ct(){try{o.texStorage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ht(){try{o.texStorage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function kt(){try{o.texImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function vt(){try{o.texImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Rt(V){St.equals(V)===!1&&(o.scissor(V.x,V.y,V.z,V.w),St.copy(V))}function Wt(V){j.equals(V)===!1&&(o.viewport(V.x,V.y,V.z,V.w),j.copy(V))}function Ft(V,Dt){let Mt=p.get(Dt);Mt===void 0&&(Mt=new WeakMap,p.set(Dt,Mt));let Pt=Mt.get(V);Pt===void 0&&(Pt=o.getUniformBlockIndex(Dt,V.name),Mt.set(V,Pt))}function wt(V,Dt){const Pt=p.get(Dt).get(V);m.get(Dt)!==Pt&&(o.uniformBlockBinding(Dt,Pt,V.__bindingPointIndex),m.set(Dt,Pt))}function ee(){o.disable(o.BLEND),o.disable(o.CULL_FACE),o.disable(o.DEPTH_TEST),o.disable(o.POLYGON_OFFSET_FILL),o.disable(o.SCISSOR_TEST),o.disable(o.STENCIL_TEST),o.disable(o.SAMPLE_ALPHA_TO_COVERAGE),o.blendEquation(o.FUNC_ADD),o.blendFunc(o.ONE,o.ZERO),o.blendFuncSeparate(o.ONE,o.ZERO,o.ONE,o.ZERO),o.blendColor(0,0,0,0),o.colorMask(!0,!0,!0,!0),o.clearColor(0,0,0,0),o.depthMask(!0),o.depthFunc(o.LESS),h.setReversed(!1),o.clearDepth(1),o.stencilMask(4294967295),o.stencilFunc(o.ALWAYS,0,4294967295),o.stencilOp(o.KEEP,o.KEEP,o.KEEP),o.clearStencil(0),o.cullFace(o.BACK),o.frontFace(o.CCW),o.polygonOffset(0,0),o.activeTexture(o.TEXTURE0),o.bindFramebuffer(o.FRAMEBUFFER,null),o.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),o.bindFramebuffer(o.READ_FRAMEBUFFER,null),o.useProgram(null),o.lineWidth(1),o.scissor(0,0,o.canvas.width,o.canvas.height),o.viewport(0,0,o.canvas.width,o.canvas.height),v={},xt=null,At={},S={},x=new WeakMap,M=[],b=null,R=!1,y=null,g=null,B=null,N=null,D=null,W=null,F=null,O=new ye(0,0,0),k=0,w=!1,C=null,H=null,st=null,at=null,ct=null,St.set(0,0,o.canvas.width,o.canvas.height),j.set(0,0,o.canvas.width,o.canvas.height),c.reset(),h.reset(),d.reset()}return{buffers:{color:c,depth:h,stencil:d},enable:yt,disable:Ot,bindFramebuffer:Kt,drawBuffers:Qt,useProgram:Le,setBlending:I,setMaterial:un,setFlipSided:_e,setCullFace:Ne,setLineWidth:Vt,setPolygonOffset:de,setScissorTest:Yt,activeTexture:ie,bindTexture:tn,unbindTexture:L,compressedTexImage2D:E,compressedTexImage3D:$,texImage2D:kt,texImage3D:vt,updateUBOMapping:Ft,uniformBlockBinding:wt,texStorage2D:Ct,texStorage3D:Ht,texSubImage2D:pt,texSubImage3D:_t,compressedTexSubImage2D:lt,compressedTexSubImage3D:Xt,scissor:Rt,viewport:Wt,reset:ee}}function CA(o,e,i,r,l,c,h){const d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,m=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),p=new Ce,v=new WeakMap;let S;const x=new WeakMap;let M=!1;try{M=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(L,E){return M?new OffscreenCanvas(L,E):Cu("canvas")}function R(L,E,$){let pt=1;const _t=tn(L);if((_t.width>$||_t.height>$)&&(pt=$/Math.max(_t.width,_t.height)),pt<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){const lt=Math.floor(pt*_t.width),Xt=Math.floor(pt*_t.height);S===void 0&&(S=b(lt,Xt));const Ct=E?b(lt,Xt):S;return Ct.width=lt,Ct.height=Xt,Ct.getContext("2d").drawImage(L,0,0,lt,Xt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+_t.width+"x"+_t.height+") to ("+lt+"x"+Xt+")."),Ct}else return"data"in L&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+_t.width+"x"+_t.height+")."),L;return L}function y(L){return L.generateMipmaps}function g(L){o.generateMipmap(L)}function B(L){return L.isWebGLCubeRenderTarget?o.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?o.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?o.TEXTURE_2D_ARRAY:o.TEXTURE_2D}function N(L,E,$,pt,_t=!1){if(L!==null){if(o[L]!==void 0)return o[L];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let lt=E;if(E===o.RED&&($===o.FLOAT&&(lt=o.R32F),$===o.HALF_FLOAT&&(lt=o.R16F),$===o.UNSIGNED_BYTE&&(lt=o.R8)),E===o.RED_INTEGER&&($===o.UNSIGNED_BYTE&&(lt=o.R8UI),$===o.UNSIGNED_SHORT&&(lt=o.R16UI),$===o.UNSIGNED_INT&&(lt=o.R32UI),$===o.BYTE&&(lt=o.R8I),$===o.SHORT&&(lt=o.R16I),$===o.INT&&(lt=o.R32I)),E===o.RG&&($===o.FLOAT&&(lt=o.RG32F),$===o.HALF_FLOAT&&(lt=o.RG16F),$===o.UNSIGNED_BYTE&&(lt=o.RG8)),E===o.RG_INTEGER&&($===o.UNSIGNED_BYTE&&(lt=o.RG8UI),$===o.UNSIGNED_SHORT&&(lt=o.RG16UI),$===o.UNSIGNED_INT&&(lt=o.RG32UI),$===o.BYTE&&(lt=o.RG8I),$===o.SHORT&&(lt=o.RG16I),$===o.INT&&(lt=o.RG32I)),E===o.RGB_INTEGER&&($===o.UNSIGNED_BYTE&&(lt=o.RGB8UI),$===o.UNSIGNED_SHORT&&(lt=o.RGB16UI),$===o.UNSIGNED_INT&&(lt=o.RGB32UI),$===o.BYTE&&(lt=o.RGB8I),$===o.SHORT&&(lt=o.RGB16I),$===o.INT&&(lt=o.RGB32I)),E===o.RGBA_INTEGER&&($===o.UNSIGNED_BYTE&&(lt=o.RGBA8UI),$===o.UNSIGNED_SHORT&&(lt=o.RGBA16UI),$===o.UNSIGNED_INT&&(lt=o.RGBA32UI),$===o.BYTE&&(lt=o.RGBA8I),$===o.SHORT&&(lt=o.RGBA16I),$===o.INT&&(lt=o.RGBA32I)),E===o.RGB&&$===o.UNSIGNED_INT_5_9_9_9_REV&&(lt=o.RGB9_E5),E===o.RGBA){const Xt=_t?Au:Re.getTransfer(pt);$===o.FLOAT&&(lt=o.RGBA32F),$===o.HALF_FLOAT&&(lt=o.RGBA16F),$===o.UNSIGNED_BYTE&&(lt=Xt===Fe?o.SRGB8_ALPHA8:o.RGBA8),$===o.UNSIGNED_SHORT_4_4_4_4&&(lt=o.RGBA4),$===o.UNSIGNED_SHORT_5_5_5_1&&(lt=o.RGB5_A1)}return(lt===o.R16F||lt===o.R32F||lt===o.RG16F||lt===o.RG32F||lt===o.RGBA16F||lt===o.RGBA32F)&&e.get("EXT_color_buffer_float"),lt}function D(L,E){let $;return L?E===null||E===xr||E===No?$=o.DEPTH24_STENCIL8:E===sa?$=o.DEPTH32F_STENCIL8:E===Lo&&($=o.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===xr||E===No?$=o.DEPTH_COMPONENT24:E===sa?$=o.DEPTH_COMPONENT32F:E===Lo&&($=o.DEPTH_COMPONENT16),$}function W(L,E){return y(L)===!0||L.isFramebufferTexture&&L.minFilter!==Mi&&L.minFilter!==Di?Math.log2(Math.max(E.width,E.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?E.mipmaps.length:1}function F(L){const E=L.target;E.removeEventListener("dispose",F),k(E),E.isVideoTexture&&v.delete(E)}function O(L){const E=L.target;E.removeEventListener("dispose",O),C(E)}function k(L){const E=r.get(L);if(E.__webglInit===void 0)return;const $=L.source,pt=x.get($);if(pt){const _t=pt[E.__cacheKey];_t.usedTimes--,_t.usedTimes===0&&w(L),Object.keys(pt).length===0&&x.delete($)}r.remove(L)}function w(L){const E=r.get(L);o.deleteTexture(E.__webglTexture);const $=L.source,pt=x.get($);delete pt[E.__cacheKey],h.memory.textures--}function C(L){const E=r.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),r.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let pt=0;pt<6;pt++){if(Array.isArray(E.__webglFramebuffer[pt]))for(let _t=0;_t<E.__webglFramebuffer[pt].length;_t++)o.deleteFramebuffer(E.__webglFramebuffer[pt][_t]);else o.deleteFramebuffer(E.__webglFramebuffer[pt]);E.__webglDepthbuffer&&o.deleteRenderbuffer(E.__webglDepthbuffer[pt])}else{if(Array.isArray(E.__webglFramebuffer))for(let pt=0;pt<E.__webglFramebuffer.length;pt++)o.deleteFramebuffer(E.__webglFramebuffer[pt]);else o.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&o.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&o.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let pt=0;pt<E.__webglColorRenderbuffer.length;pt++)E.__webglColorRenderbuffer[pt]&&o.deleteRenderbuffer(E.__webglColorRenderbuffer[pt]);E.__webglDepthRenderbuffer&&o.deleteRenderbuffer(E.__webglDepthRenderbuffer)}const $=L.textures;for(let pt=0,_t=$.length;pt<_t;pt++){const lt=r.get($[pt]);lt.__webglTexture&&(o.deleteTexture(lt.__webglTexture),h.memory.textures--),r.remove($[pt])}r.remove(L)}let H=0;function st(){H=0}function at(){const L=H;return L>=l.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+L+" texture units while this GPU supports only "+l.maxTextures),H+=1,L}function ct(L){const E=[];return E.push(L.wrapS),E.push(L.wrapT),E.push(L.wrapR||0),E.push(L.magFilter),E.push(L.minFilter),E.push(L.anisotropy),E.push(L.internalFormat),E.push(L.format),E.push(L.type),E.push(L.generateMipmaps),E.push(L.premultiplyAlpha),E.push(L.flipY),E.push(L.unpackAlignment),E.push(L.colorSpace),E.join()}function dt(L,E){const $=r.get(L);if(L.isVideoTexture&&Yt(L),L.isRenderTargetTexture===!1&&L.version>0&&$.__version!==L.version){const pt=L.image;if(pt===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(pt.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Tt($,L,E);return}}i.bindTexture(o.TEXTURE_2D,$.__webglTexture,o.TEXTURE0+E)}function z(L,E){const $=r.get(L);if(L.version>0&&$.__version!==L.version){Tt($,L,E);return}i.bindTexture(o.TEXTURE_2D_ARRAY,$.__webglTexture,o.TEXTURE0+E)}function K(L,E){const $=r.get(L);if(L.version>0&&$.__version!==L.version){Tt($,L,E);return}i.bindTexture(o.TEXTURE_3D,$.__webglTexture,o.TEXTURE0+E)}function Z(L,E){const $=r.get(L);if(L.version>0&&$.__version!==L.version){yt($,L,E);return}i.bindTexture(o.TEXTURE_CUBE_MAP,$.__webglTexture,o.TEXTURE0+E)}const xt={[Fh]:o.REPEAT,[vr]:o.CLAMP_TO_EDGE,[Hh]:o.MIRRORED_REPEAT},At={[Mi]:o.NEAREST,[ty]:o.NEAREST_MIPMAP_NEAREST,[Kl]:o.NEAREST_MIPMAP_LINEAR,[Di]:o.LINEAR,[jf]:o.LINEAR_MIPMAP_NEAREST,[Sr]:o.LINEAR_MIPMAP_LINEAR},U={[ay]:o.NEVER,[cy]:o.ALWAYS,[ry]:o.LESS,[Iv]:o.LEQUAL,[sy]:o.EQUAL,[uy]:o.GEQUAL,[oy]:o.GREATER,[ly]:o.NOTEQUAL};function nt(L,E){if(E.type===sa&&e.has("OES_texture_float_linear")===!1&&(E.magFilter===Di||E.magFilter===jf||E.magFilter===Kl||E.magFilter===Sr||E.minFilter===Di||E.minFilter===jf||E.minFilter===Kl||E.minFilter===Sr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),o.texParameteri(L,o.TEXTURE_WRAP_S,xt[E.wrapS]),o.texParameteri(L,o.TEXTURE_WRAP_T,xt[E.wrapT]),(L===o.TEXTURE_3D||L===o.TEXTURE_2D_ARRAY)&&o.texParameteri(L,o.TEXTURE_WRAP_R,xt[E.wrapR]),o.texParameteri(L,o.TEXTURE_MAG_FILTER,At[E.magFilter]),o.texParameteri(L,o.TEXTURE_MIN_FILTER,At[E.minFilter]),E.compareFunction&&(o.texParameteri(L,o.TEXTURE_COMPARE_MODE,o.COMPARE_REF_TO_TEXTURE),o.texParameteri(L,o.TEXTURE_COMPARE_FUNC,U[E.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===Mi||E.minFilter!==Kl&&E.minFilter!==Sr||E.type===sa&&e.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||r.get(E).__currentAnisotropy){const $=e.get("EXT_texture_filter_anisotropic");o.texParameterf(L,$.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,l.getMaxAnisotropy())),r.get(E).__currentAnisotropy=E.anisotropy}}}function St(L,E){let $=!1;L.__webglInit===void 0&&(L.__webglInit=!0,E.addEventListener("dispose",F));const pt=E.source;let _t=x.get(pt);_t===void 0&&(_t={},x.set(pt,_t));const lt=ct(E);if(lt!==L.__cacheKey){_t[lt]===void 0&&(_t[lt]={texture:o.createTexture(),usedTimes:0},h.memory.textures++,$=!0),_t[lt].usedTimes++;const Xt=_t[L.__cacheKey];Xt!==void 0&&(_t[L.__cacheKey].usedTimes--,Xt.usedTimes===0&&w(E)),L.__cacheKey=lt,L.__webglTexture=_t[lt].texture}return $}function j(L,E,$){return Math.floor(Math.floor(L/$)/E)}function ft(L,E,$,pt){const lt=L.updateRanges;if(lt.length===0)i.texSubImage2D(o.TEXTURE_2D,0,0,0,E.width,E.height,$,pt,E.data);else{lt.sort((vt,Rt)=>vt.start-Rt.start);let Xt=0;for(let vt=1;vt<lt.length;vt++){const Rt=lt[Xt],Wt=lt[vt],Ft=Rt.start+Rt.count,wt=j(Wt.start,E.width,4),ee=j(Rt.start,E.width,4);Wt.start<=Ft+1&&wt===ee&&j(Wt.start+Wt.count-1,E.width,4)===wt?Rt.count=Math.max(Rt.count,Wt.start+Wt.count-Rt.start):(++Xt,lt[Xt]=Wt)}lt.length=Xt+1;const Ct=o.getParameter(o.UNPACK_ROW_LENGTH),Ht=o.getParameter(o.UNPACK_SKIP_PIXELS),kt=o.getParameter(o.UNPACK_SKIP_ROWS);o.pixelStorei(o.UNPACK_ROW_LENGTH,E.width);for(let vt=0,Rt=lt.length;vt<Rt;vt++){const Wt=lt[vt],Ft=Math.floor(Wt.start/4),wt=Math.ceil(Wt.count/4),ee=Ft%E.width,V=Math.floor(Ft/E.width),Dt=wt,Mt=1;o.pixelStorei(o.UNPACK_SKIP_PIXELS,ee),o.pixelStorei(o.UNPACK_SKIP_ROWS,V),i.texSubImage2D(o.TEXTURE_2D,0,ee,V,Dt,Mt,$,pt,E.data)}L.clearUpdateRanges(),o.pixelStorei(o.UNPACK_ROW_LENGTH,Ct),o.pixelStorei(o.UNPACK_SKIP_PIXELS,Ht),o.pixelStorei(o.UNPACK_SKIP_ROWS,kt)}}function Tt(L,E,$){let pt=o.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(pt=o.TEXTURE_2D_ARRAY),E.isData3DTexture&&(pt=o.TEXTURE_3D);const _t=St(L,E),lt=E.source;i.bindTexture(pt,L.__webglTexture,o.TEXTURE0+$);const Xt=r.get(lt);if(lt.version!==Xt.__version||_t===!0){i.activeTexture(o.TEXTURE0+$);const Ct=Re.getPrimaries(Re.workingColorSpace),Ht=E.colorSpace===Ia?null:Re.getPrimaries(E.colorSpace),kt=E.colorSpace===Ia||Ct===Ht?o.NONE:o.BROWSER_DEFAULT_WEBGL;o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,E.flipY),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),o.pixelStorei(o.UNPACK_ALIGNMENT,E.unpackAlignment),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,kt);let vt=R(E.image,!1,l.maxTextureSize);vt=ie(E,vt);const Rt=c.convert(E.format,E.colorSpace),Wt=c.convert(E.type);let Ft=N(E.internalFormat,Rt,Wt,E.colorSpace,E.isVideoTexture);nt(pt,E);let wt;const ee=E.mipmaps,V=E.isVideoTexture!==!0,Dt=Xt.__version===void 0||_t===!0,Mt=lt.dataReady,Pt=W(E,vt);if(E.isDepthTexture)Ft=D(E.format===zo,E.type),Dt&&(V?i.texStorage2D(o.TEXTURE_2D,1,Ft,vt.width,vt.height):i.texImage2D(o.TEXTURE_2D,0,Ft,vt.width,vt.height,0,Rt,Wt,null));else if(E.isDataTexture)if(ee.length>0){V&&Dt&&i.texStorage2D(o.TEXTURE_2D,Pt,Ft,ee[0].width,ee[0].height);for(let Et=0,gt=ee.length;Et<gt;Et++)wt=ee[Et],V?Mt&&i.texSubImage2D(o.TEXTURE_2D,Et,0,0,wt.width,wt.height,Rt,Wt,wt.data):i.texImage2D(o.TEXTURE_2D,Et,Ft,wt.width,wt.height,0,Rt,Wt,wt.data);E.generateMipmaps=!1}else V?(Dt&&i.texStorage2D(o.TEXTURE_2D,Pt,Ft,vt.width,vt.height),Mt&&ft(E,vt,Rt,Wt)):i.texImage2D(o.TEXTURE_2D,0,Ft,vt.width,vt.height,0,Rt,Wt,vt.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){V&&Dt&&i.texStorage3D(o.TEXTURE_2D_ARRAY,Pt,Ft,ee[0].width,ee[0].height,vt.depth);for(let Et=0,gt=ee.length;Et<gt;Et++)if(wt=ee[Et],E.format!==xi)if(Rt!==null)if(V){if(Mt)if(E.layerUpdates.size>0){const Bt=Z_(wt.width,wt.height,E.format,E.type);for(const ne of E.layerUpdates){const Oe=wt.data.subarray(ne*Bt/wt.data.BYTES_PER_ELEMENT,(ne+1)*Bt/wt.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,Et,0,0,ne,wt.width,wt.height,1,Rt,Oe)}E.clearLayerUpdates()}else i.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,Et,0,0,0,wt.width,wt.height,vt.depth,Rt,wt.data)}else i.compressedTexImage3D(o.TEXTURE_2D_ARRAY,Et,Ft,wt.width,wt.height,vt.depth,0,wt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else V?Mt&&i.texSubImage3D(o.TEXTURE_2D_ARRAY,Et,0,0,0,wt.width,wt.height,vt.depth,Rt,Wt,wt.data):i.texImage3D(o.TEXTURE_2D_ARRAY,Et,Ft,wt.width,wt.height,vt.depth,0,Rt,Wt,wt.data)}else{V&&Dt&&i.texStorage2D(o.TEXTURE_2D,Pt,Ft,ee[0].width,ee[0].height);for(let Et=0,gt=ee.length;Et<gt;Et++)wt=ee[Et],E.format!==xi?Rt!==null?V?Mt&&i.compressedTexSubImage2D(o.TEXTURE_2D,Et,0,0,wt.width,wt.height,Rt,wt.data):i.compressedTexImage2D(o.TEXTURE_2D,Et,Ft,wt.width,wt.height,0,wt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):V?Mt&&i.texSubImage2D(o.TEXTURE_2D,Et,0,0,wt.width,wt.height,Rt,Wt,wt.data):i.texImage2D(o.TEXTURE_2D,Et,Ft,wt.width,wt.height,0,Rt,Wt,wt.data)}else if(E.isDataArrayTexture)if(V){if(Dt&&i.texStorage3D(o.TEXTURE_2D_ARRAY,Pt,Ft,vt.width,vt.height,vt.depth),Mt)if(E.layerUpdates.size>0){const Et=Z_(vt.width,vt.height,E.format,E.type);for(const gt of E.layerUpdates){const Bt=vt.data.subarray(gt*Et/vt.data.BYTES_PER_ELEMENT,(gt+1)*Et/vt.data.BYTES_PER_ELEMENT);i.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,gt,vt.width,vt.height,1,Rt,Wt,Bt)}E.clearLayerUpdates()}else i.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,0,vt.width,vt.height,vt.depth,Rt,Wt,vt.data)}else i.texImage3D(o.TEXTURE_2D_ARRAY,0,Ft,vt.width,vt.height,vt.depth,0,Rt,Wt,vt.data);else if(E.isData3DTexture)V?(Dt&&i.texStorage3D(o.TEXTURE_3D,Pt,Ft,vt.width,vt.height,vt.depth),Mt&&i.texSubImage3D(o.TEXTURE_3D,0,0,0,0,vt.width,vt.height,vt.depth,Rt,Wt,vt.data)):i.texImage3D(o.TEXTURE_3D,0,Ft,vt.width,vt.height,vt.depth,0,Rt,Wt,vt.data);else if(E.isFramebufferTexture){if(Dt)if(V)i.texStorage2D(o.TEXTURE_2D,Pt,Ft,vt.width,vt.height);else{let Et=vt.width,gt=vt.height;for(let Bt=0;Bt<Pt;Bt++)i.texImage2D(o.TEXTURE_2D,Bt,Ft,Et,gt,0,Rt,Wt,null),Et>>=1,gt>>=1}}else if(ee.length>0){if(V&&Dt){const Et=tn(ee[0]);i.texStorage2D(o.TEXTURE_2D,Pt,Ft,Et.width,Et.height)}for(let Et=0,gt=ee.length;Et<gt;Et++)wt=ee[Et],V?Mt&&i.texSubImage2D(o.TEXTURE_2D,Et,0,0,Rt,Wt,wt):i.texImage2D(o.TEXTURE_2D,Et,Ft,Rt,Wt,wt);E.generateMipmaps=!1}else if(V){if(Dt){const Et=tn(vt);i.texStorage2D(o.TEXTURE_2D,Pt,Ft,Et.width,Et.height)}Mt&&i.texSubImage2D(o.TEXTURE_2D,0,0,0,Rt,Wt,vt)}else i.texImage2D(o.TEXTURE_2D,0,Ft,Rt,Wt,vt);y(E)&&g(pt),Xt.__version=lt.version,E.onUpdate&&E.onUpdate(E)}L.__version=E.version}function yt(L,E,$){if(E.image.length!==6)return;const pt=St(L,E),_t=E.source;i.bindTexture(o.TEXTURE_CUBE_MAP,L.__webglTexture,o.TEXTURE0+$);const lt=r.get(_t);if(_t.version!==lt.__version||pt===!0){i.activeTexture(o.TEXTURE0+$);const Xt=Re.getPrimaries(Re.workingColorSpace),Ct=E.colorSpace===Ia?null:Re.getPrimaries(E.colorSpace),Ht=E.colorSpace===Ia||Xt===Ct?o.NONE:o.BROWSER_DEFAULT_WEBGL;o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,E.flipY),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),o.pixelStorei(o.UNPACK_ALIGNMENT,E.unpackAlignment),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ht);const kt=E.isCompressedTexture||E.image[0].isCompressedTexture,vt=E.image[0]&&E.image[0].isDataTexture,Rt=[];for(let gt=0;gt<6;gt++)!kt&&!vt?Rt[gt]=R(E.image[gt],!0,l.maxCubemapSize):Rt[gt]=vt?E.image[gt].image:E.image[gt],Rt[gt]=ie(E,Rt[gt]);const Wt=Rt[0],Ft=c.convert(E.format,E.colorSpace),wt=c.convert(E.type),ee=N(E.internalFormat,Ft,wt,E.colorSpace),V=E.isVideoTexture!==!0,Dt=lt.__version===void 0||pt===!0,Mt=_t.dataReady;let Pt=W(E,Wt);nt(o.TEXTURE_CUBE_MAP,E);let Et;if(kt){V&&Dt&&i.texStorage2D(o.TEXTURE_CUBE_MAP,Pt,ee,Wt.width,Wt.height);for(let gt=0;gt<6;gt++){Et=Rt[gt].mipmaps;for(let Bt=0;Bt<Et.length;Bt++){const ne=Et[Bt];E.format!==xi?Ft!==null?V?Mt&&i.compressedTexSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,Bt,0,0,ne.width,ne.height,Ft,ne.data):i.compressedTexImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,Bt,ee,ne.width,ne.height,0,ne.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):V?Mt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,Bt,0,0,ne.width,ne.height,Ft,wt,ne.data):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,Bt,ee,ne.width,ne.height,0,Ft,wt,ne.data)}}}else{if(Et=E.mipmaps,V&&Dt){Et.length>0&&Pt++;const gt=tn(Rt[0]);i.texStorage2D(o.TEXTURE_CUBE_MAP,Pt,ee,gt.width,gt.height)}for(let gt=0;gt<6;gt++)if(vt){V?Mt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,0,0,Rt[gt].width,Rt[gt].height,Ft,wt,Rt[gt].data):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,ee,Rt[gt].width,Rt[gt].height,0,Ft,wt,Rt[gt].data);for(let Bt=0;Bt<Et.length;Bt++){const Oe=Et[Bt].image[gt].image;V?Mt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,Bt+1,0,0,Oe.width,Oe.height,Ft,wt,Oe.data):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,Bt+1,ee,Oe.width,Oe.height,0,Ft,wt,Oe.data)}}else{V?Mt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,0,0,Ft,wt,Rt[gt]):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,ee,Ft,wt,Rt[gt]);for(let Bt=0;Bt<Et.length;Bt++){const ne=Et[Bt];V?Mt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,Bt+1,0,0,Ft,wt,ne.image[gt]):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+gt,Bt+1,ee,Ft,wt,ne.image[gt])}}}y(E)&&g(o.TEXTURE_CUBE_MAP),lt.__version=_t.version,E.onUpdate&&E.onUpdate(E)}L.__version=E.version}function Ot(L,E,$,pt,_t,lt){const Xt=c.convert($.format,$.colorSpace),Ct=c.convert($.type),Ht=N($.internalFormat,Xt,Ct,$.colorSpace),kt=r.get(E),vt=r.get($);if(vt.__renderTarget=E,!kt.__hasExternalTextures){const Rt=Math.max(1,E.width>>lt),Wt=Math.max(1,E.height>>lt);_t===o.TEXTURE_3D||_t===o.TEXTURE_2D_ARRAY?i.texImage3D(_t,lt,Ht,Rt,Wt,E.depth,0,Xt,Ct,null):i.texImage2D(_t,lt,Ht,Rt,Wt,0,Xt,Ct,null)}i.bindFramebuffer(o.FRAMEBUFFER,L),de(E)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,pt,_t,vt.__webglTexture,0,Vt(E)):(_t===o.TEXTURE_2D||_t>=o.TEXTURE_CUBE_MAP_POSITIVE_X&&_t<=o.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&o.framebufferTexture2D(o.FRAMEBUFFER,pt,_t,vt.__webglTexture,lt),i.bindFramebuffer(o.FRAMEBUFFER,null)}function Kt(L,E,$){if(o.bindRenderbuffer(o.RENDERBUFFER,L),E.depthBuffer){const pt=E.depthTexture,_t=pt&&pt.isDepthTexture?pt.type:null,lt=D(E.stencilBuffer,_t),Xt=E.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,Ct=Vt(E);de(E)?d.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,Ct,lt,E.width,E.height):$?o.renderbufferStorageMultisample(o.RENDERBUFFER,Ct,lt,E.width,E.height):o.renderbufferStorage(o.RENDERBUFFER,lt,E.width,E.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,Xt,o.RENDERBUFFER,L)}else{const pt=E.textures;for(let _t=0;_t<pt.length;_t++){const lt=pt[_t],Xt=c.convert(lt.format,lt.colorSpace),Ct=c.convert(lt.type),Ht=N(lt.internalFormat,Xt,Ct,lt.colorSpace),kt=Vt(E);$&&de(E)===!1?o.renderbufferStorageMultisample(o.RENDERBUFFER,kt,Ht,E.width,E.height):de(E)?d.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,kt,Ht,E.width,E.height):o.renderbufferStorage(o.RENDERBUFFER,Ht,E.width,E.height)}}o.bindRenderbuffer(o.RENDERBUFFER,null)}function Qt(L,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(i.bindFramebuffer(o.FRAMEBUFFER,L),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const pt=r.get(E.depthTexture);pt.__renderTarget=E,(!pt.__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),dt(E.depthTexture,0);const _t=pt.__webglTexture,lt=Vt(E);if(E.depthTexture.format===Oo)de(E)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,o.DEPTH_ATTACHMENT,o.TEXTURE_2D,_t,0,lt):o.framebufferTexture2D(o.FRAMEBUFFER,o.DEPTH_ATTACHMENT,o.TEXTURE_2D,_t,0);else if(E.depthTexture.format===zo)de(E)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,o.DEPTH_STENCIL_ATTACHMENT,o.TEXTURE_2D,_t,0,lt):o.framebufferTexture2D(o.FRAMEBUFFER,o.DEPTH_STENCIL_ATTACHMENT,o.TEXTURE_2D,_t,0);else throw new Error("Unknown depthTexture format")}function Le(L){const E=r.get(L),$=L.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==L.depthTexture){const pt=L.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),pt){const _t=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,pt.removeEventListener("dispose",_t)};pt.addEventListener("dispose",_t),E.__depthDisposeCallback=_t}E.__boundDepthTexture=pt}if(L.depthTexture&&!E.__autoAllocateDepthBuffer){if($)throw new Error("target.depthTexture not supported in Cube render targets");const pt=L.texture.mipmaps;pt&&pt.length>0?Qt(E.__webglFramebuffer[0],L):Qt(E.__webglFramebuffer,L)}else if($){E.__webglDepthbuffer=[];for(let pt=0;pt<6;pt++)if(i.bindFramebuffer(o.FRAMEBUFFER,E.__webglFramebuffer[pt]),E.__webglDepthbuffer[pt]===void 0)E.__webglDepthbuffer[pt]=o.createRenderbuffer(),Kt(E.__webglDepthbuffer[pt],L,!1);else{const _t=L.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,lt=E.__webglDepthbuffer[pt];o.bindRenderbuffer(o.RENDERBUFFER,lt),o.framebufferRenderbuffer(o.FRAMEBUFFER,_t,o.RENDERBUFFER,lt)}}else{const pt=L.texture.mipmaps;if(pt&&pt.length>0?i.bindFramebuffer(o.FRAMEBUFFER,E.__webglFramebuffer[0]):i.bindFramebuffer(o.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=o.createRenderbuffer(),Kt(E.__webglDepthbuffer,L,!1);else{const _t=L.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,lt=E.__webglDepthbuffer;o.bindRenderbuffer(o.RENDERBUFFER,lt),o.framebufferRenderbuffer(o.FRAMEBUFFER,_t,o.RENDERBUFFER,lt)}}i.bindFramebuffer(o.FRAMEBUFFER,null)}function He(L,E,$){const pt=r.get(L);E!==void 0&&Ot(pt.__webglFramebuffer,L,L.texture,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,0),$!==void 0&&Le(L)}function Me(L){const E=L.texture,$=r.get(L),pt=r.get(E);L.addEventListener("dispose",O);const _t=L.textures,lt=L.isWebGLCubeRenderTarget===!0,Xt=_t.length>1;if(Xt||(pt.__webglTexture===void 0&&(pt.__webglTexture=o.createTexture()),pt.__version=E.version,h.memory.textures++),lt){$.__webglFramebuffer=[];for(let Ct=0;Ct<6;Ct++)if(E.mipmaps&&E.mipmaps.length>0){$.__webglFramebuffer[Ct]=[];for(let Ht=0;Ht<E.mipmaps.length;Ht++)$.__webglFramebuffer[Ct][Ht]=o.createFramebuffer()}else $.__webglFramebuffer[Ct]=o.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){$.__webglFramebuffer=[];for(let Ct=0;Ct<E.mipmaps.length;Ct++)$.__webglFramebuffer[Ct]=o.createFramebuffer()}else $.__webglFramebuffer=o.createFramebuffer();if(Xt)for(let Ct=0,Ht=_t.length;Ct<Ht;Ct++){const kt=r.get(_t[Ct]);kt.__webglTexture===void 0&&(kt.__webglTexture=o.createTexture(),h.memory.textures++)}if(L.samples>0&&de(L)===!1){$.__webglMultisampledFramebuffer=o.createFramebuffer(),$.__webglColorRenderbuffer=[],i.bindFramebuffer(o.FRAMEBUFFER,$.__webglMultisampledFramebuffer);for(let Ct=0;Ct<_t.length;Ct++){const Ht=_t[Ct];$.__webglColorRenderbuffer[Ct]=o.createRenderbuffer(),o.bindRenderbuffer(o.RENDERBUFFER,$.__webglColorRenderbuffer[Ct]);const kt=c.convert(Ht.format,Ht.colorSpace),vt=c.convert(Ht.type),Rt=N(Ht.internalFormat,kt,vt,Ht.colorSpace,L.isXRRenderTarget===!0),Wt=Vt(L);o.renderbufferStorageMultisample(o.RENDERBUFFER,Wt,Rt,L.width,L.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+Ct,o.RENDERBUFFER,$.__webglColorRenderbuffer[Ct])}o.bindRenderbuffer(o.RENDERBUFFER,null),L.depthBuffer&&($.__webglDepthRenderbuffer=o.createRenderbuffer(),Kt($.__webglDepthRenderbuffer,L,!0)),i.bindFramebuffer(o.FRAMEBUFFER,null)}}if(lt){i.bindTexture(o.TEXTURE_CUBE_MAP,pt.__webglTexture),nt(o.TEXTURE_CUBE_MAP,E);for(let Ct=0;Ct<6;Ct++)if(E.mipmaps&&E.mipmaps.length>0)for(let Ht=0;Ht<E.mipmaps.length;Ht++)Ot($.__webglFramebuffer[Ct][Ht],L,E,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,Ht);else Ot($.__webglFramebuffer[Ct],L,E,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+Ct,0);y(E)&&g(o.TEXTURE_CUBE_MAP),i.unbindTexture()}else if(Xt){for(let Ct=0,Ht=_t.length;Ct<Ht;Ct++){const kt=_t[Ct],vt=r.get(kt);i.bindTexture(o.TEXTURE_2D,vt.__webglTexture),nt(o.TEXTURE_2D,kt),Ot($.__webglFramebuffer,L,kt,o.COLOR_ATTACHMENT0+Ct,o.TEXTURE_2D,0),y(kt)&&g(o.TEXTURE_2D)}i.unbindTexture()}else{let Ct=o.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(Ct=L.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY),i.bindTexture(Ct,pt.__webglTexture),nt(Ct,E),E.mipmaps&&E.mipmaps.length>0)for(let Ht=0;Ht<E.mipmaps.length;Ht++)Ot($.__webglFramebuffer[Ht],L,E,o.COLOR_ATTACHMENT0,Ct,Ht);else Ot($.__webglFramebuffer,L,E,o.COLOR_ATTACHMENT0,Ct,0);y(E)&&g(Ct),i.unbindTexture()}L.depthBuffer&&Le(L)}function I(L){const E=L.textures;for(let $=0,pt=E.length;$<pt;$++){const _t=E[$];if(y(_t)){const lt=B(L),Xt=r.get(_t).__webglTexture;i.bindTexture(lt,Xt),g(lt),i.unbindTexture()}}}const un=[],_e=[];function Ne(L){if(L.samples>0){if(de(L)===!1){const E=L.textures,$=L.width,pt=L.height;let _t=o.COLOR_BUFFER_BIT;const lt=L.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,Xt=r.get(L),Ct=E.length>1;if(Ct)for(let kt=0;kt<E.length;kt++)i.bindFramebuffer(o.FRAMEBUFFER,Xt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+kt,o.RENDERBUFFER,null),i.bindFramebuffer(o.FRAMEBUFFER,Xt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+kt,o.TEXTURE_2D,null,0);i.bindFramebuffer(o.READ_FRAMEBUFFER,Xt.__webglMultisampledFramebuffer);const Ht=L.texture.mipmaps;Ht&&Ht.length>0?i.bindFramebuffer(o.DRAW_FRAMEBUFFER,Xt.__webglFramebuffer[0]):i.bindFramebuffer(o.DRAW_FRAMEBUFFER,Xt.__webglFramebuffer);for(let kt=0;kt<E.length;kt++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(_t|=o.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(_t|=o.STENCIL_BUFFER_BIT)),Ct){o.framebufferRenderbuffer(o.READ_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.RENDERBUFFER,Xt.__webglColorRenderbuffer[kt]);const vt=r.get(E[kt]).__webglTexture;o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,vt,0)}o.blitFramebuffer(0,0,$,pt,0,0,$,pt,_t,o.NEAREST),m===!0&&(un.length=0,_e.length=0,un.push(o.COLOR_ATTACHMENT0+kt),L.depthBuffer&&L.resolveDepthBuffer===!1&&(un.push(lt),_e.push(lt),o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER,_e)),o.invalidateFramebuffer(o.READ_FRAMEBUFFER,un))}if(i.bindFramebuffer(o.READ_FRAMEBUFFER,null),i.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),Ct)for(let kt=0;kt<E.length;kt++){i.bindFramebuffer(o.FRAMEBUFFER,Xt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+kt,o.RENDERBUFFER,Xt.__webglColorRenderbuffer[kt]);const vt=r.get(E[kt]).__webglTexture;i.bindFramebuffer(o.FRAMEBUFFER,Xt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+kt,o.TEXTURE_2D,vt,0)}i.bindFramebuffer(o.DRAW_FRAMEBUFFER,Xt.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.resolveDepthBuffer===!1&&m){const E=L.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER,[E])}}}function Vt(L){return Math.min(l.maxSamples,L.samples)}function de(L){const E=r.get(L);return L.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function Yt(L){const E=h.render.frame;v.get(L)!==E&&(v.set(L,E),L.update())}function ie(L,E){const $=L.colorSpace,pt=L.format,_t=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||$!==Ms&&$!==Ia&&(Re.getTransfer($)===Fe?(pt!==xi||_t!==Li)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",$)),E}function tn(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(p.width=L.naturalWidth||L.width,p.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(p.width=L.displayWidth,p.height=L.displayHeight):(p.width=L.width,p.height=L.height),p}this.allocateTextureUnit=at,this.resetTextureUnits=st,this.setTexture2D=dt,this.setTexture2DArray=z,this.setTexture3D=K,this.setTextureCube=Z,this.rebindTextures=He,this.setupRenderTarget=Me,this.updateRenderTargetMipmap=I,this.updateMultisampleRenderTarget=Ne,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=Ot,this.useMultisampledRTT=de}function wA(o,e){function i(r,l=Ia){let c;const h=Re.getTransfer(l);if(r===Li)return o.UNSIGNED_BYTE;if(r===vd)return o.UNSIGNED_SHORT_4_4_4_4;if(r===Sd)return o.UNSIGNED_SHORT_5_5_5_1;if(r===Uv)return o.UNSIGNED_INT_5_9_9_9_REV;if(r===wv)return o.BYTE;if(r===Dv)return o.SHORT;if(r===Lo)return o.UNSIGNED_SHORT;if(r===_d)return o.INT;if(r===xr)return o.UNSIGNED_INT;if(r===sa)return o.FLOAT;if(r===Po)return o.HALF_FLOAT;if(r===Lv)return o.ALPHA;if(r===Nv)return o.RGB;if(r===xi)return o.RGBA;if(r===Oo)return o.DEPTH_COMPONENT;if(r===zo)return o.DEPTH_STENCIL;if(r===Ov)return o.RED;if(r===xd)return o.RED_INTEGER;if(r===zv)return o.RG;if(r===yd)return o.RG_INTEGER;if(r===Md)return o.RGBA_INTEGER;if(r===Su||r===xu||r===yu||r===Mu)if(h===Fe)if(c=e.get("WEBGL_compressed_texture_s3tc_srgb"),c!==null){if(r===Su)return c.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===xu)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===yu)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Mu)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(c=e.get("WEBGL_compressed_texture_s3tc"),c!==null){if(r===Su)return c.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===xu)return c.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===yu)return c.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Mu)return c.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Gh||r===Vh||r===Xh||r===kh)if(c=e.get("WEBGL_compressed_texture_pvrtc"),c!==null){if(r===Gh)return c.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Vh)return c.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===Xh)return c.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===kh)return c.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Wh||r===qh||r===Yh)if(c=e.get("WEBGL_compressed_texture_etc"),c!==null){if(r===Wh||r===qh)return h===Fe?c.COMPRESSED_SRGB8_ETC2:c.COMPRESSED_RGB8_ETC2;if(r===Yh)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:c.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===jh||r===Zh||r===Kh||r===Qh||r===Jh||r===$h||r===td||r===ed||r===nd||r===id||r===ad||r===rd||r===sd||r===od)if(c=e.get("WEBGL_compressed_texture_astc"),c!==null){if(r===jh)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:c.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Zh)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:c.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Kh)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:c.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Qh)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:c.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===Jh)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:c.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===$h)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:c.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===td)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:c.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===ed)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:c.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===nd)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:c.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===id)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:c.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===ad)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:c.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===rd)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:c.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===sd)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:c.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===od)return h===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:c.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Eu||r===ld||r===ud)if(c=e.get("EXT_texture_compression_bptc"),c!==null){if(r===Eu)return h===Fe?c.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:c.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===ld)return c.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===ud)return c.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Pv||r===cd||r===fd||r===hd)if(c=e.get("EXT_texture_compression_rgtc"),c!==null){if(r===Eu)return c.COMPRESSED_RED_RGTC1_EXT;if(r===cd)return c.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===fd)return c.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===hd)return c.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===No?o.UNSIGNED_INT_24_8:o[r]!==void 0?o[r]:null}return{convert:i}}const DA=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,UA=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class LA{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,i,r){if(this.texture===null){const l=new Xn,c=e.properties.get(l);c.__webglTexture=i.texture,(i.depthNear!==r.depthNear||i.depthFar!==r.depthFar)&&(this.depthNear=i.depthNear,this.depthFar=i.depthFar),this.texture=l}}getMesh(e){if(this.texture!==null&&this.mesh===null){const i=e.cameras[0].viewport,r=new Va({vertexShader:DA,fragmentShader:UA,uniforms:{depthColor:{value:this.texture},depthWidth:{value:i.z},depthHeight:{value:i.w}}});this.mesh=new yi(new Nu(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class NA extends Ts{constructor(e,i){super();const r=this;let l=null,c=1,h=null,d="local-floor",m=1,p=null,v=null,S=null,x=null,M=null,b=null;const R=new LA,y=i.getContextAttributes();let g=null,B=null;const N=[],D=[],W=new Ce;let F=null;const O=new ui;O.viewport=new $e;const k=new ui;k.viewport=new $e;const w=[O,k],C=new $y;let H=null,st=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let ft=N[j];return ft===void 0&&(ft=new _h,N[j]=ft),ft.getTargetRaySpace()},this.getControllerGrip=function(j){let ft=N[j];return ft===void 0&&(ft=new _h,N[j]=ft),ft.getGripSpace()},this.getHand=function(j){let ft=N[j];return ft===void 0&&(ft=new _h,N[j]=ft),ft.getHandSpace()};function at(j){const ft=D.indexOf(j.inputSource);if(ft===-1)return;const Tt=N[ft];Tt!==void 0&&(Tt.update(j.inputSource,j.frame,p||h),Tt.dispatchEvent({type:j.type,data:j.inputSource}))}function ct(){l.removeEventListener("select",at),l.removeEventListener("selectstart",at),l.removeEventListener("selectend",at),l.removeEventListener("squeeze",at),l.removeEventListener("squeezestart",at),l.removeEventListener("squeezeend",at),l.removeEventListener("end",ct),l.removeEventListener("inputsourceschange",dt);for(let j=0;j<N.length;j++){const ft=D[j];ft!==null&&(D[j]=null,N[j].disconnect(ft))}H=null,st=null,R.reset(),e.setRenderTarget(g),M=null,x=null,S=null,l=null,B=null,St.stop(),r.isPresenting=!1,e.setPixelRatio(F),e.setSize(W.width,W.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){c=j,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){d=j,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return p||h},this.setReferenceSpace=function(j){p=j},this.getBaseLayer=function(){return x!==null?x:M},this.getBinding=function(){return S},this.getFrame=function(){return b},this.getSession=function(){return l},this.setSession=async function(j){if(l=j,l!==null){if(g=e.getRenderTarget(),l.addEventListener("select",at),l.addEventListener("selectstart",at),l.addEventListener("selectend",at),l.addEventListener("squeeze",at),l.addEventListener("squeezestart",at),l.addEventListener("squeezeend",at),l.addEventListener("end",ct),l.addEventListener("inputsourceschange",dt),y.xrCompatible!==!0&&await i.makeXRCompatible(),F=e.getPixelRatio(),e.getSize(W),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let Tt=null,yt=null,Ot=null;y.depth&&(Ot=y.stencil?i.DEPTH24_STENCIL8:i.DEPTH_COMPONENT24,Tt=y.stencil?zo:Oo,yt=y.stencil?No:xr);const Kt={colorFormat:i.RGBA8,depthFormat:Ot,scaleFactor:c};S=new XRWebGLBinding(l,i),x=S.createProjectionLayer(Kt),l.updateRenderState({layers:[x]}),e.setPixelRatio(1),e.setSize(x.textureWidth,x.textureHeight,!1),B=new yr(x.textureWidth,x.textureHeight,{format:xi,type:Li,depthTexture:new Qv(x.textureWidth,x.textureHeight,yt,void 0,void 0,void 0,void 0,void 0,void 0,Tt),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:x.ignoreDepthValues===!1,resolveStencilBuffer:x.ignoreDepthValues===!1})}else{const Tt={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:c};M=new XRWebGLLayer(l,i,Tt),l.updateRenderState({baseLayer:M}),e.setPixelRatio(1),e.setSize(M.framebufferWidth,M.framebufferHeight,!1),B=new yr(M.framebufferWidth,M.framebufferHeight,{format:xi,type:Li,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:M.ignoreDepthValues===!1,resolveStencilBuffer:M.ignoreDepthValues===!1})}B.isXRRenderTarget=!0,this.setFoveation(m),p=null,h=await l.requestReferenceSpace(d),St.setContext(l),St.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(l!==null)return l.environmentBlendMode},this.getDepthTexture=function(){return R.getDepthTexture()};function dt(j){for(let ft=0;ft<j.removed.length;ft++){const Tt=j.removed[ft],yt=D.indexOf(Tt);yt>=0&&(D[yt]=null,N[yt].disconnect(Tt))}for(let ft=0;ft<j.added.length;ft++){const Tt=j.added[ft];let yt=D.indexOf(Tt);if(yt===-1){for(let Kt=0;Kt<N.length;Kt++)if(Kt>=D.length){D.push(Tt),yt=Kt;break}else if(D[Kt]===null){D[Kt]=Tt,yt=Kt;break}if(yt===-1)break}const Ot=N[yt];Ot&&Ot.connect(Tt)}}const z=new et,K=new et;function Z(j,ft,Tt){z.setFromMatrixPosition(ft.matrixWorld),K.setFromMatrixPosition(Tt.matrixWorld);const yt=z.distanceTo(K),Ot=ft.projectionMatrix.elements,Kt=Tt.projectionMatrix.elements,Qt=Ot[14]/(Ot[10]-1),Le=Ot[14]/(Ot[10]+1),He=(Ot[9]+1)/Ot[5],Me=(Ot[9]-1)/Ot[5],I=(Ot[8]-1)/Ot[0],un=(Kt[8]+1)/Kt[0],_e=Qt*I,Ne=Qt*un,Vt=yt/(-I+un),de=Vt*-I;if(ft.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(de),j.translateZ(Vt),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),Ot[10]===-1)j.projectionMatrix.copy(ft.projectionMatrix),j.projectionMatrixInverse.copy(ft.projectionMatrixInverse);else{const Yt=Qt+Vt,ie=Le+Vt,tn=_e-de,L=Ne+(yt-de),E=He*Le/ie*Yt,$=Me*Le/ie*Yt;j.projectionMatrix.makePerspective(tn,L,E,$,Yt,ie),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function xt(j,ft){ft===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(ft.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(l===null)return;let ft=j.near,Tt=j.far;R.texture!==null&&(R.depthNear>0&&(ft=R.depthNear),R.depthFar>0&&(Tt=R.depthFar)),C.near=k.near=O.near=ft,C.far=k.far=O.far=Tt,(H!==C.near||st!==C.far)&&(l.updateRenderState({depthNear:C.near,depthFar:C.far}),H=C.near,st=C.far),O.layers.mask=j.layers.mask|2,k.layers.mask=j.layers.mask|4,C.layers.mask=O.layers.mask|k.layers.mask;const yt=j.parent,Ot=C.cameras;xt(C,yt);for(let Kt=0;Kt<Ot.length;Kt++)xt(Ot[Kt],yt);Ot.length===2?Z(C,O,k):C.projectionMatrix.copy(O.projectionMatrix),At(j,C,yt)};function At(j,ft,Tt){Tt===null?j.matrix.copy(ft.matrixWorld):(j.matrix.copy(Tt.matrixWorld),j.matrix.invert(),j.matrix.multiply(ft.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(ft.projectionMatrix),j.projectionMatrixInverse.copy(ft.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=dd*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return C},this.getFoveation=function(){if(!(x===null&&M===null))return m},this.setFoveation=function(j){m=j,x!==null&&(x.fixedFoveation=j),M!==null&&M.fixedFoveation!==void 0&&(M.fixedFoveation=j)},this.hasDepthSensing=function(){return R.texture!==null},this.getDepthSensingMesh=function(){return R.getMesh(C)};let U=null;function nt(j,ft){if(v=ft.getViewerPose(p||h),b=ft,v!==null){const Tt=v.views;M!==null&&(e.setRenderTargetFramebuffer(B,M.framebuffer),e.setRenderTarget(B));let yt=!1;Tt.length!==C.cameras.length&&(C.cameras.length=0,yt=!0);for(let Qt=0;Qt<Tt.length;Qt++){const Le=Tt[Qt];let He=null;if(M!==null)He=M.getViewport(Le);else{const I=S.getViewSubImage(x,Le);He=I.viewport,Qt===0&&(e.setRenderTargetTextures(B,I.colorTexture,I.depthStencilTexture),e.setRenderTarget(B))}let Me=w[Qt];Me===void 0&&(Me=new ui,Me.layers.enable(Qt),Me.viewport=new $e,w[Qt]=Me),Me.matrix.fromArray(Le.transform.matrix),Me.matrix.decompose(Me.position,Me.quaternion,Me.scale),Me.projectionMatrix.fromArray(Le.projectionMatrix),Me.projectionMatrixInverse.copy(Me.projectionMatrix).invert(),Me.viewport.set(He.x,He.y,He.width,He.height),Qt===0&&(C.matrix.copy(Me.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale)),yt===!0&&C.cameras.push(Me)}const Ot=l.enabledFeatures;if(Ot&&Ot.includes("depth-sensing")&&l.depthUsage=="gpu-optimized"&&S){const Qt=S.getDepthInformation(Tt[0]);Qt&&Qt.isValid&&Qt.texture&&R.init(e,Qt,l.renderState)}}for(let Tt=0;Tt<N.length;Tt++){const yt=D[Tt],Ot=N[Tt];yt!==null&&Ot!==void 0&&Ot.update(yt,ft,p||h)}U&&U(j,ft),ft.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:ft}),b=null}const St=new t0;St.setAnimationLoop(nt),this.setAnimationLoop=function(j){U=j},this.dispose=function(){}}}const dr=new Ni,OA=new je;function zA(o,e){function i(y,g){y.matrixAutoUpdate===!0&&y.updateMatrix(),g.value.copy(y.matrix)}function r(y,g){g.color.getRGB(y.fogColor.value,Yv(o)),g.isFog?(y.fogNear.value=g.near,y.fogFar.value=g.far):g.isFogExp2&&(y.fogDensity.value=g.density)}function l(y,g,B,N,D){g.isMeshBasicMaterial||g.isMeshLambertMaterial?c(y,g):g.isMeshToonMaterial?(c(y,g),S(y,g)):g.isMeshPhongMaterial?(c(y,g),v(y,g)):g.isMeshStandardMaterial?(c(y,g),x(y,g),g.isMeshPhysicalMaterial&&M(y,g,D)):g.isMeshMatcapMaterial?(c(y,g),b(y,g)):g.isMeshDepthMaterial?c(y,g):g.isMeshDistanceMaterial?(c(y,g),R(y,g)):g.isMeshNormalMaterial?c(y,g):g.isLineBasicMaterial?(h(y,g),g.isLineDashedMaterial&&d(y,g)):g.isPointsMaterial?m(y,g,B,N):g.isSpriteMaterial?p(y,g):g.isShadowMaterial?(y.color.value.copy(g.color),y.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function c(y,g){y.opacity.value=g.opacity,g.color&&y.diffuse.value.copy(g.color),g.emissive&&y.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(y.map.value=g.map,i(g.map,y.mapTransform)),g.alphaMap&&(y.alphaMap.value=g.alphaMap,i(g.alphaMap,y.alphaMapTransform)),g.bumpMap&&(y.bumpMap.value=g.bumpMap,i(g.bumpMap,y.bumpMapTransform),y.bumpScale.value=g.bumpScale,g.side===Vn&&(y.bumpScale.value*=-1)),g.normalMap&&(y.normalMap.value=g.normalMap,i(g.normalMap,y.normalMapTransform),y.normalScale.value.copy(g.normalScale),g.side===Vn&&y.normalScale.value.negate()),g.displacementMap&&(y.displacementMap.value=g.displacementMap,i(g.displacementMap,y.displacementMapTransform),y.displacementScale.value=g.displacementScale,y.displacementBias.value=g.displacementBias),g.emissiveMap&&(y.emissiveMap.value=g.emissiveMap,i(g.emissiveMap,y.emissiveMapTransform)),g.specularMap&&(y.specularMap.value=g.specularMap,i(g.specularMap,y.specularMapTransform)),g.alphaTest>0&&(y.alphaTest.value=g.alphaTest);const B=e.get(g),N=B.envMap,D=B.envMapRotation;N&&(y.envMap.value=N,dr.copy(D),dr.x*=-1,dr.y*=-1,dr.z*=-1,N.isCubeTexture&&N.isRenderTargetTexture===!1&&(dr.y*=-1,dr.z*=-1),y.envMapRotation.value.setFromMatrix4(OA.makeRotationFromEuler(dr)),y.flipEnvMap.value=N.isCubeTexture&&N.isRenderTargetTexture===!1?-1:1,y.reflectivity.value=g.reflectivity,y.ior.value=g.ior,y.refractionRatio.value=g.refractionRatio),g.lightMap&&(y.lightMap.value=g.lightMap,y.lightMapIntensity.value=g.lightMapIntensity,i(g.lightMap,y.lightMapTransform)),g.aoMap&&(y.aoMap.value=g.aoMap,y.aoMapIntensity.value=g.aoMapIntensity,i(g.aoMap,y.aoMapTransform))}function h(y,g){y.diffuse.value.copy(g.color),y.opacity.value=g.opacity,g.map&&(y.map.value=g.map,i(g.map,y.mapTransform))}function d(y,g){y.dashSize.value=g.dashSize,y.totalSize.value=g.dashSize+g.gapSize,y.scale.value=g.scale}function m(y,g,B,N){y.diffuse.value.copy(g.color),y.opacity.value=g.opacity,y.size.value=g.size*B,y.scale.value=N*.5,g.map&&(y.map.value=g.map,i(g.map,y.uvTransform)),g.alphaMap&&(y.alphaMap.value=g.alphaMap,i(g.alphaMap,y.alphaMapTransform)),g.alphaTest>0&&(y.alphaTest.value=g.alphaTest)}function p(y,g){y.diffuse.value.copy(g.color),y.opacity.value=g.opacity,y.rotation.value=g.rotation,g.map&&(y.map.value=g.map,i(g.map,y.mapTransform)),g.alphaMap&&(y.alphaMap.value=g.alphaMap,i(g.alphaMap,y.alphaMapTransform)),g.alphaTest>0&&(y.alphaTest.value=g.alphaTest)}function v(y,g){y.specular.value.copy(g.specular),y.shininess.value=Math.max(g.shininess,1e-4)}function S(y,g){g.gradientMap&&(y.gradientMap.value=g.gradientMap)}function x(y,g){y.metalness.value=g.metalness,g.metalnessMap&&(y.metalnessMap.value=g.metalnessMap,i(g.metalnessMap,y.metalnessMapTransform)),y.roughness.value=g.roughness,g.roughnessMap&&(y.roughnessMap.value=g.roughnessMap,i(g.roughnessMap,y.roughnessMapTransform)),g.envMap&&(y.envMapIntensity.value=g.envMapIntensity)}function M(y,g,B){y.ior.value=g.ior,g.sheen>0&&(y.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),y.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(y.sheenColorMap.value=g.sheenColorMap,i(g.sheenColorMap,y.sheenColorMapTransform)),g.sheenRoughnessMap&&(y.sheenRoughnessMap.value=g.sheenRoughnessMap,i(g.sheenRoughnessMap,y.sheenRoughnessMapTransform))),g.clearcoat>0&&(y.clearcoat.value=g.clearcoat,y.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(y.clearcoatMap.value=g.clearcoatMap,i(g.clearcoatMap,y.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(y.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,i(g.clearcoatRoughnessMap,y.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(y.clearcoatNormalMap.value=g.clearcoatNormalMap,i(g.clearcoatNormalMap,y.clearcoatNormalMapTransform),y.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Vn&&y.clearcoatNormalScale.value.negate())),g.dispersion>0&&(y.dispersion.value=g.dispersion),g.iridescence>0&&(y.iridescence.value=g.iridescence,y.iridescenceIOR.value=g.iridescenceIOR,y.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],y.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(y.iridescenceMap.value=g.iridescenceMap,i(g.iridescenceMap,y.iridescenceMapTransform)),g.iridescenceThicknessMap&&(y.iridescenceThicknessMap.value=g.iridescenceThicknessMap,i(g.iridescenceThicknessMap,y.iridescenceThicknessMapTransform))),g.transmission>0&&(y.transmission.value=g.transmission,y.transmissionSamplerMap.value=B.texture,y.transmissionSamplerSize.value.set(B.width,B.height),g.transmissionMap&&(y.transmissionMap.value=g.transmissionMap,i(g.transmissionMap,y.transmissionMapTransform)),y.thickness.value=g.thickness,g.thicknessMap&&(y.thicknessMap.value=g.thicknessMap,i(g.thicknessMap,y.thicknessMapTransform)),y.attenuationDistance.value=g.attenuationDistance,y.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(y.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(y.anisotropyMap.value=g.anisotropyMap,i(g.anisotropyMap,y.anisotropyMapTransform))),y.specularIntensity.value=g.specularIntensity,y.specularColor.value.copy(g.specularColor),g.specularColorMap&&(y.specularColorMap.value=g.specularColorMap,i(g.specularColorMap,y.specularColorMapTransform)),g.specularIntensityMap&&(y.specularIntensityMap.value=g.specularIntensityMap,i(g.specularIntensityMap,y.specularIntensityMapTransform))}function b(y,g){g.matcap&&(y.matcap.value=g.matcap)}function R(y,g){const B=e.get(g).light;y.referencePosition.value.setFromMatrixPosition(B.matrixWorld),y.nearDistance.value=B.shadow.camera.near,y.farDistance.value=B.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:l}}function PA(o,e,i,r){let l={},c={},h=[];const d=o.getParameter(o.MAX_UNIFORM_BUFFER_BINDINGS);function m(B,N){const D=N.program;r.uniformBlockBinding(B,D)}function p(B,N){let D=l[B.id];D===void 0&&(b(B),D=v(B),l[B.id]=D,B.addEventListener("dispose",y));const W=N.program;r.updateUBOMapping(B,W);const F=e.render.frame;c[B.id]!==F&&(x(B),c[B.id]=F)}function v(B){const N=S();B.__bindingPointIndex=N;const D=o.createBuffer(),W=B.__size,F=B.usage;return o.bindBuffer(o.UNIFORM_BUFFER,D),o.bufferData(o.UNIFORM_BUFFER,W,F),o.bindBuffer(o.UNIFORM_BUFFER,null),o.bindBufferBase(o.UNIFORM_BUFFER,N,D),D}function S(){for(let B=0;B<d;B++)if(h.indexOf(B)===-1)return h.push(B),B;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function x(B){const N=l[B.id],D=B.uniforms,W=B.__cache;o.bindBuffer(o.UNIFORM_BUFFER,N);for(let F=0,O=D.length;F<O;F++){const k=Array.isArray(D[F])?D[F]:[D[F]];for(let w=0,C=k.length;w<C;w++){const H=k[w];if(M(H,F,w,W)===!0){const st=H.__offset,at=Array.isArray(H.value)?H.value:[H.value];let ct=0;for(let dt=0;dt<at.length;dt++){const z=at[dt],K=R(z);typeof z=="number"||typeof z=="boolean"?(H.__data[0]=z,o.bufferSubData(o.UNIFORM_BUFFER,st+ct,H.__data)):z.isMatrix3?(H.__data[0]=z.elements[0],H.__data[1]=z.elements[1],H.__data[2]=z.elements[2],H.__data[3]=0,H.__data[4]=z.elements[3],H.__data[5]=z.elements[4],H.__data[6]=z.elements[5],H.__data[7]=0,H.__data[8]=z.elements[6],H.__data[9]=z.elements[7],H.__data[10]=z.elements[8],H.__data[11]=0):(z.toArray(H.__data,ct),ct+=K.storage/Float32Array.BYTES_PER_ELEMENT)}o.bufferSubData(o.UNIFORM_BUFFER,st,H.__data)}}}o.bindBuffer(o.UNIFORM_BUFFER,null)}function M(B,N,D,W){const F=B.value,O=N+"_"+D;if(W[O]===void 0)return typeof F=="number"||typeof F=="boolean"?W[O]=F:W[O]=F.clone(),!0;{const k=W[O];if(typeof F=="number"||typeof F=="boolean"){if(k!==F)return W[O]=F,!0}else if(k.equals(F)===!1)return k.copy(F),!0}return!1}function b(B){const N=B.uniforms;let D=0;const W=16;for(let O=0,k=N.length;O<k;O++){const w=Array.isArray(N[O])?N[O]:[N[O]];for(let C=0,H=w.length;C<H;C++){const st=w[C],at=Array.isArray(st.value)?st.value:[st.value];for(let ct=0,dt=at.length;ct<dt;ct++){const z=at[ct],K=R(z),Z=D%W,xt=Z%K.boundary,At=Z+xt;D+=xt,At!==0&&W-At<K.storage&&(D+=W-At),st.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),st.__offset=D,D+=K.storage}}}const F=D%W;return F>0&&(D+=W-F),B.__size=D,B.__cache={},this}function R(B){const N={boundary:0,storage:0};return typeof B=="number"||typeof B=="boolean"?(N.boundary=4,N.storage=4):B.isVector2?(N.boundary=8,N.storage=8):B.isVector3||B.isColor?(N.boundary=16,N.storage=12):B.isVector4?(N.boundary=16,N.storage=16):B.isMatrix3?(N.boundary=48,N.storage=48):B.isMatrix4?(N.boundary=64,N.storage=64):B.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",B),N}function y(B){const N=B.target;N.removeEventListener("dispose",y);const D=h.indexOf(N.__bindingPointIndex);h.splice(D,1),o.deleteBuffer(l[N.id]),delete l[N.id],delete c[N.id]}function g(){for(const B in l)o.deleteBuffer(l[B]);h=[],l={},c={}}return{bind:m,update:p,dispose:g}}class BA{constructor(e={}){const{canvas:i=hy(),context:r=null,depth:l=!0,stencil:c=!1,alpha:h=!1,antialias:d=!1,premultipliedAlpha:m=!0,preserveDrawingBuffer:p=!1,powerPreference:v="default",failIfMajorPerformanceCaveat:S=!1,reverseDepthBuffer:x=!1}=e;this.isWebGLRenderer=!0;let M;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");M=r.getContextAttributes().alpha}else M=h;const b=new Uint32Array(4),R=new Int32Array(4);let y=null,g=null;const B=[],N=[];this.domElement=i,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ha,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const D=this;let W=!1;this._outputColorSpace=$n;let F=0,O=0,k=null,w=-1,C=null;const H=new $e,st=new $e;let at=null;const ct=new ye(0);let dt=0,z=i.width,K=i.height,Z=1,xt=null,At=null;const U=new $e(0,0,z,K),nt=new $e(0,0,z,K);let St=!1;const j=new Td;let ft=!1,Tt=!1;const yt=new je,Ot=new je,Kt=new et,Qt=new $e,Le={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let He=!1;function Me(){return k===null?Z:1}let I=r;function un(A,q){return i.getContext(A,q)}try{const A={alpha:!0,depth:l,stencil:c,antialias:d,premultipliedAlpha:m,preserveDrawingBuffer:p,powerPreference:v,failIfMajorPerformanceCaveat:S};if("setAttribute"in i&&i.setAttribute("data-engine",`three.js r${gd}`),i.addEventListener("webglcontextlost",Pt,!1),i.addEventListener("webglcontextrestored",Et,!1),i.addEventListener("webglcontextcreationerror",gt,!1),I===null){const q="webgl2";if(I=un(q,A),I===null)throw un(q)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let _e,Ne,Vt,de,Yt,ie,tn,L,E,$,pt,_t,lt,Xt,Ct,Ht,kt,vt,Rt,Wt,Ft,wt,ee,V;function Dt(){_e=new YT(I),_e.init(),wt=new wA(I,_e),Ne=new HT(I,_e,e,wt),Vt=new RA(I,_e),Ne.reverseDepthBuffer&&x&&Vt.buffers.depth.setReversed(!0),de=new KT(I),Yt=new pA,ie=new CA(I,_e,Vt,Yt,Ne,wt,de),tn=new VT(D),L=new qT(D),E=new nM(I),ee=new IT(I,E),$=new jT(I,E,de,ee),pt=new JT(I,$,E,de),Rt=new QT(I,Ne,ie),Ht=new GT(Yt),_t=new dA(D,tn,L,_e,Ne,ee,Ht),lt=new zA(D,Yt),Xt=new gA,Ct=new MA(_e),vt=new BT(D,tn,L,Vt,pt,M,m),kt=new bA(D,pt,Ne),V=new PA(I,de,Ne,Vt),Wt=new FT(I,_e,de),Ft=new ZT(I,_e,de),de.programs=_t.programs,D.capabilities=Ne,D.extensions=_e,D.properties=Yt,D.renderLists=Xt,D.shadowMap=kt,D.state=Vt,D.info=de}Dt();const Mt=new NA(D,I);this.xr=Mt,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const A=_e.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=_e.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(A){A!==void 0&&(Z=A,this.setSize(z,K,!1))},this.getSize=function(A){return A.set(z,K)},this.setSize=function(A,q,it=!0){if(Mt.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=A,K=q,i.width=Math.floor(A*Z),i.height=Math.floor(q*Z),it===!0&&(i.style.width=A+"px",i.style.height=q+"px"),this.setViewport(0,0,A,q)},this.getDrawingBufferSize=function(A){return A.set(z*Z,K*Z).floor()},this.setDrawingBufferSize=function(A,q,it){z=A,K=q,Z=it,i.width=Math.floor(A*it),i.height=Math.floor(q*it),this.setViewport(0,0,A,q)},this.getCurrentViewport=function(A){return A.copy(H)},this.getViewport=function(A){return A.copy(U)},this.setViewport=function(A,q,it,rt){A.isVector4?U.set(A.x,A.y,A.z,A.w):U.set(A,q,it,rt),Vt.viewport(H.copy(U).multiplyScalar(Z).round())},this.getScissor=function(A){return A.copy(nt)},this.setScissor=function(A,q,it,rt){A.isVector4?nt.set(A.x,A.y,A.z,A.w):nt.set(A,q,it,rt),Vt.scissor(st.copy(nt).multiplyScalar(Z).round())},this.getScissorTest=function(){return St},this.setScissorTest=function(A){Vt.setScissorTest(St=A)},this.setOpaqueSort=function(A){xt=A},this.setTransparentSort=function(A){At=A},this.getClearColor=function(A){return A.copy(vt.getClearColor())},this.setClearColor=function(){vt.setClearColor(...arguments)},this.getClearAlpha=function(){return vt.getClearAlpha()},this.setClearAlpha=function(){vt.setClearAlpha(...arguments)},this.clear=function(A=!0,q=!0,it=!0){let rt=0;if(A){let X=!1;if(k!==null){const bt=k.texture.format;X=bt===Md||bt===yd||bt===xd}if(X){const bt=k.texture.type,Ut=bt===Li||bt===xr||bt===Lo||bt===No||bt===vd||bt===Sd,zt=vt.getClearColor(),Nt=vt.getClearAlpha(),$t=zt.r,te=zt.g,qt=zt.b;Ut?(b[0]=$t,b[1]=te,b[2]=qt,b[3]=Nt,I.clearBufferuiv(I.COLOR,0,b)):(R[0]=$t,R[1]=te,R[2]=qt,R[3]=Nt,I.clearBufferiv(I.COLOR,0,R))}else rt|=I.COLOR_BUFFER_BIT}q&&(rt|=I.DEPTH_BUFFER_BIT),it&&(rt|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(rt)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){i.removeEventListener("webglcontextlost",Pt,!1),i.removeEventListener("webglcontextrestored",Et,!1),i.removeEventListener("webglcontextcreationerror",gt,!1),vt.dispose(),Xt.dispose(),Ct.dispose(),Yt.dispose(),tn.dispose(),L.dispose(),pt.dispose(),ee.dispose(),V.dispose(),_t.dispose(),Mt.dispose(),Mt.removeEventListener("sessionstart",Cs),Mt.removeEventListener("sessionend",ws),Ti.stop()};function Pt(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),W=!0}function Et(){console.log("THREE.WebGLRenderer: Context Restored."),W=!1;const A=de.autoReset,q=kt.enabled,it=kt.autoUpdate,rt=kt.needsUpdate,X=kt.type;Dt(),de.autoReset=A,kt.enabled=q,kt.autoUpdate=it,kt.needsUpdate=rt,kt.type=X}function gt(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function Bt(A){const q=A.target;q.removeEventListener("dispose",Bt),ne(q)}function ne(A){Oe(A),Yt.remove(A)}function Oe(A){const q=Yt.get(A).programs;q!==void 0&&(q.forEach(function(it){_t.releaseProgram(it)}),A.isShaderMaterial&&_t.releaseShaderCache(A))}this.renderBufferDirect=function(A,q,it,rt,X,bt){q===null&&(q=Le);const Ut=X.isMesh&&X.matrixWorld.determinant()<0,zt=Us(A,q,it,rt,X);Vt.setMaterial(rt,Ut);let Nt=it.index,$t=1;if(rt.wireframe===!0){if(Nt=$.getWireframeAttribute(it),Nt===void 0)return;$t=2}const te=it.drawRange,qt=it.attributes.position;let ce=te.start*$t,Te=(te.start+te.count)*$t;bt!==null&&(ce=Math.max(ce,bt.start*$t),Te=Math.min(Te,(bt.start+bt.count)*$t)),Nt!==null?(ce=Math.max(ce,0),Te=Math.min(Te,Nt.count)):qt!=null&&(ce=Math.max(ce,0),Te=Math.min(Te,qt.count));const Ge=Te-ce;if(Ge<0||Ge===1/0)return;ee.setup(X,rt,zt,it,Nt);let ve,le=Wt;if(Nt!==null&&(ve=E.get(Nt),le=Ft,le.setIndex(ve)),X.isMesh)rt.wireframe===!0?(Vt.setLineWidth(rt.wireframeLinewidth*Me()),le.setMode(I.LINES)):le.setMode(I.TRIANGLES);else if(X.isLine){let Zt=rt.linewidth;Zt===void 0&&(Zt=1),Vt.setLineWidth(Zt*Me()),X.isLineSegments?le.setMode(I.LINES):X.isLineLoop?le.setMode(I.LINE_LOOP):le.setMode(I.LINE_STRIP)}else X.isPoints?le.setMode(I.POINTS):X.isSprite&&le.setMode(I.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)_s("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),le.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(_e.get("WEBGL_multi_draw"))le.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{const Zt=X._multiDrawStarts,ke=X._multiDrawCounts,pe=X._multiDrawCount,bn=Nt?E.get(Nt).bytesPerElement:1,hi=Yt.get(rt).currentProgram.getUniforms();for(let Dn=0;Dn<pe;Dn++)hi.setValue(I,"_gl_DrawID",Dn),le.render(Zt[Dn]/bn,ke[Dn])}else if(X.isInstancedMesh)le.renderInstances(ce,Ge,X.count);else if(it.isInstancedBufferGeometry){const Zt=it._maxInstanceCount!==void 0?it._maxInstanceCount:1/0,ke=Math.min(it.instanceCount,Zt);le.renderInstances(ce,Ge,ke)}else le.render(ce,Ge)};function Ee(A,q,it){A.transparent===!0&&A.side===ra&&A.forceSinglePass===!1?(A.side=Vn,A.needsUpdate=!0,Ze(A,q,it),A.side=Ga,A.needsUpdate=!0,Ze(A,q,it),A.side=ra):Ze(A,q,it)}this.compile=function(A,q,it=null){it===null&&(it=A),g=Ct.get(it),g.init(q),N.push(g),it.traverseVisible(function(X){X.isLight&&X.layers.test(q.layers)&&(g.pushLight(X),X.castShadow&&g.pushShadow(X))}),A!==it&&A.traverseVisible(function(X){X.isLight&&X.layers.test(q.layers)&&(g.pushLight(X),X.castShadow&&g.pushShadow(X))}),g.setupLights();const rt=new Set;return A.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;const bt=X.material;if(bt)if(Array.isArray(bt))for(let Ut=0;Ut<bt.length;Ut++){const zt=bt[Ut];Ee(zt,it,X),rt.add(zt)}else Ee(bt,it,X),rt.add(bt)}),g=N.pop(),rt},this.compileAsync=function(A,q,it=null){const rt=this.compile(A,q,it);return new Promise(X=>{function bt(){if(rt.forEach(function(Ut){Yt.get(Ut).currentProgram.isReady()&&rt.delete(Ut)}),rt.size===0){X(A);return}setTimeout(bt,10)}_e.get("KHR_parallel_shader_compile")!==null?bt():setTimeout(bt,10)})};let gn=null;function ci(A){gn&&gn(A)}function Cs(){Ti.stop()}function ws(){Ti.start()}const Ti=new t0;Ti.setAnimationLoop(ci),typeof self<"u"&&Ti.setContext(self),this.setAnimationLoop=function(A){gn=A,Mt.setAnimationLoop(A),A===null?Ti.stop():Ti.start()},Mt.addEventListener("sessionstart",Cs),Mt.addEventListener("sessionend",ws),this.render=function(A,q){if(q!==void 0&&q.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(W===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),q.parent===null&&q.matrixWorldAutoUpdate===!0&&q.updateMatrixWorld(),Mt.enabled===!0&&Mt.isPresenting===!0&&(Mt.cameraAutoUpdate===!0&&Mt.updateCamera(q),q=Mt.getCamera()),A.isScene===!0&&A.onBeforeRender(D,A,q,k),g=Ct.get(A,N.length),g.init(q),N.push(g),Ot.multiplyMatrices(q.projectionMatrix,q.matrixWorldInverse),j.setFromProjectionMatrix(Ot),Tt=this.localClippingEnabled,ft=Ht.init(this.clippingPlanes,Tt),y=Xt.get(A,B.length),y.init(),B.push(y),Mt.enabled===!0&&Mt.isPresenting===!0){const bt=D.xr.getDepthSensingMesh();bt!==null&&Xa(bt,q,-1/0,D.sortObjects)}Xa(A,q,0,D.sortObjects),y.finish(),D.sortObjects===!0&&y.sort(xt,At),He=Mt.enabled===!1||Mt.isPresenting===!1||Mt.hasDepthSensing()===!1,He&&vt.addToRenderList(y,A),this.info.render.frame++,ft===!0&&Ht.beginShadows();const it=g.state.shadowsArray;kt.render(it,A,q),ft===!0&&Ht.endShadows(),this.info.autoReset===!0&&this.info.reset();const rt=y.opaque,X=y.transmissive;if(g.setupLights(),q.isArrayCamera){const bt=q.cameras;if(X.length>0)for(let Ut=0,zt=bt.length;Ut<zt;Ut++){const Nt=bt[Ut];Ds(rt,X,A,Nt)}He&&vt.render(A);for(let Ut=0,zt=bt.length;Ut<zt;Ut++){const Nt=bt[Ut];Mr(y,A,Nt,Nt.viewport)}}else X.length>0&&Ds(rt,X,A,q),He&&vt.render(A),Mr(y,A,q);k!==null&&O===0&&(ie.updateMultisampleRenderTarget(k),ie.updateRenderTargetMipmap(k)),A.isScene===!0&&A.onAfterRender(D,A,q),ee.resetDefaultState(),w=-1,C=null,N.pop(),N.length>0?(g=N[N.length-1],ft===!0&&Ht.setGlobalState(D.clippingPlanes,g.state.camera)):g=null,B.pop(),B.length>0?y=B[B.length-1]:y=null};function Xa(A,q,it,rt){if(A.visible===!1)return;if(A.layers.test(q.layers)){if(A.isGroup)it=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(q);else if(A.isLight)g.pushLight(A),A.castShadow&&g.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||j.intersectsSprite(A)){rt&&Qt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Ot);const Ut=pt.update(A),zt=A.material;zt.visible&&y.push(A,Ut,zt,it,Qt.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||j.intersectsObject(A))){const Ut=pt.update(A),zt=A.material;if(rt&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Qt.copy(A.boundingSphere.center)):(Ut.boundingSphere===null&&Ut.computeBoundingSphere(),Qt.copy(Ut.boundingSphere.center)),Qt.applyMatrix4(A.matrixWorld).applyMatrix4(Ot)),Array.isArray(zt)){const Nt=Ut.groups;for(let $t=0,te=Nt.length;$t<te;$t++){const qt=Nt[$t],ce=zt[qt.materialIndex];ce&&ce.visible&&y.push(A,Ut,ce,it,Qt.z,qt)}}else zt.visible&&y.push(A,Ut,zt,it,Qt.z,null)}}const bt=A.children;for(let Ut=0,zt=bt.length;Ut<zt;Ut++)Xa(bt[Ut],q,it,rt)}function Mr(A,q,it,rt){const X=A.opaque,bt=A.transmissive,Ut=A.transparent;g.setupLightsView(it),ft===!0&&Ht.setGlobalState(D.clippingPlanes,it),rt&&Vt.viewport(H.copy(rt)),X.length>0&&ka(X,q,it),bt.length>0&&ka(bt,q,it),Ut.length>0&&ka(Ut,q,it),Vt.buffers.depth.setTest(!0),Vt.buffers.depth.setMask(!0),Vt.buffers.color.setMask(!0),Vt.setPolygonOffset(!1)}function Ds(A,q,it,rt){if((it.isScene===!0?it.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[rt.id]===void 0&&(g.state.transmissionRenderTarget[rt.id]=new yr(1,1,{generateMipmaps:!0,type:_e.has("EXT_color_buffer_half_float")||_e.has("EXT_color_buffer_float")?Po:Li,minFilter:Sr,samples:4,stencilBuffer:c,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Re.workingColorSpace}));const bt=g.state.transmissionRenderTarget[rt.id],Ut=rt.viewport||H;bt.setSize(Ut.z*D.transmissionResolutionScale,Ut.w*D.transmissionResolutionScale);const zt=D.getRenderTarget(),Nt=D.getActiveCubeFace(),$t=D.getActiveMipmapLevel();D.setRenderTarget(bt),D.getClearColor(ct),dt=D.getClearAlpha(),dt<1&&D.setClearColor(16777215,.5),D.clear(),He&&vt.render(it);const te=D.toneMapping;D.toneMapping=Ha;const qt=rt.viewport;if(rt.viewport!==void 0&&(rt.viewport=void 0),g.setupLightsView(rt),ft===!0&&Ht.setGlobalState(D.clippingPlanes,rt),ka(A,it,rt),ie.updateMultisampleRenderTarget(bt),ie.updateRenderTargetMipmap(bt),_e.has("WEBGL_multisampled_render_to_texture")===!1){let ce=!1;for(let Te=0,Ge=q.length;Te<Ge;Te++){const ve=q[Te],le=ve.object,Zt=ve.geometry,ke=ve.material,pe=ve.group;if(ke.side===ra&&le.layers.test(rt.layers)){const bn=ke.side;ke.side=Vn,ke.needsUpdate=!0,fi(le,it,rt,Zt,ke,pe),ke.side=bn,ke.needsUpdate=!0,ce=!0}}ce===!0&&(ie.updateMultisampleRenderTarget(bt),ie.updateRenderTargetMipmap(bt))}D.setRenderTarget(zt,Nt,$t),D.setClearColor(ct,dt),qt!==void 0&&(rt.viewport=qt),D.toneMapping=te}function ka(A,q,it){const rt=q.isScene===!0?q.overrideMaterial:null;for(let X=0,bt=A.length;X<bt;X++){const Ut=A[X],zt=Ut.object,Nt=Ut.geometry,$t=Ut.group;let te=Ut.material;te.allowOverride===!0&&rt!==null&&(te=rt),zt.layers.test(it.layers)&&fi(zt,q,it,Nt,te,$t)}}function fi(A,q,it,rt,X,bt){A.onBeforeRender(D,q,it,rt,X,bt),A.modelViewMatrix.multiplyMatrices(it.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),X.onBeforeRender(D,q,it,rt,A,bt),X.transparent===!0&&X.side===ra&&X.forceSinglePass===!1?(X.side=Vn,X.needsUpdate=!0,D.renderBufferDirect(it,q,rt,X,A,bt),X.side=Ga,X.needsUpdate=!0,D.renderBufferDirect(it,q,rt,X,A,bt),X.side=ra):D.renderBufferDirect(it,q,rt,X,A,bt),A.onAfterRender(D,q,it,rt,X,bt)}function Ze(A,q,it){q.isScene!==!0&&(q=Le);const rt=Yt.get(A),X=g.state.lights,bt=g.state.shadowsArray,Ut=X.state.version,zt=_t.getParameters(A,X.state,bt,q,it),Nt=_t.getProgramCacheKey(zt);let $t=rt.programs;rt.environment=A.isMeshStandardMaterial?q.environment:null,rt.fog=q.fog,rt.envMap=(A.isMeshStandardMaterial?L:tn).get(A.envMap||rt.environment),rt.envMapRotation=rt.environment!==null&&A.envMap===null?q.environmentRotation:A.envMapRotation,$t===void 0&&(A.addEventListener("dispose",Bt),$t=new Map,rt.programs=$t);let te=$t.get(Nt);if(te!==void 0){if(rt.currentProgram===te&&rt.lightsStateVersion===Ut)return Oi(A,zt),te}else zt.uniforms=_t.getUniforms(A),A.onBeforeCompile(zt,D),te=_t.acquireProgram(zt,Nt),$t.set(Nt,te),rt.uniforms=zt.uniforms;const qt=rt.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(qt.clippingPlanes=Ht.uniform),Oi(A,zt),rt.needsLights=Pu(A),rt.lightsStateVersion=Ut,rt.needsLights&&(qt.ambientLightColor.value=X.state.ambient,qt.lightProbe.value=X.state.probe,qt.directionalLights.value=X.state.directional,qt.directionalLightShadows.value=X.state.directionalShadow,qt.spotLights.value=X.state.spot,qt.spotLightShadows.value=X.state.spotShadow,qt.rectAreaLights.value=X.state.rectArea,qt.ltc_1.value=X.state.rectAreaLTC1,qt.ltc_2.value=X.state.rectAreaLTC2,qt.pointLights.value=X.state.point,qt.pointLightShadows.value=X.state.pointShadow,qt.hemisphereLights.value=X.state.hemi,qt.directionalShadowMap.value=X.state.directionalShadowMap,qt.directionalShadowMatrix.value=X.state.directionalShadowMatrix,qt.spotShadowMap.value=X.state.spotShadowMap,qt.spotLightMatrix.value=X.state.spotLightMatrix,qt.spotLightMap.value=X.state.spotLightMap,qt.pointShadowMap.value=X.state.pointShadowMap,qt.pointShadowMatrix.value=X.state.pointShadowMatrix),rt.currentProgram=te,rt.uniformsList=null,te}function _n(A){if(A.uniformsList===null){const q=A.currentProgram.getUniforms();A.uniformsList=Tu.seqWithValue(q.seq,A.uniforms)}return A.uniformsList}function Oi(A,q){const it=Yt.get(A);it.outputColorSpace=q.outputColorSpace,it.batching=q.batching,it.batchingColor=q.batchingColor,it.instancing=q.instancing,it.instancingColor=q.instancingColor,it.instancingMorph=q.instancingMorph,it.skinning=q.skinning,it.morphTargets=q.morphTargets,it.morphNormals=q.morphNormals,it.morphColors=q.morphColors,it.morphTargetsCount=q.morphTargetsCount,it.numClippingPlanes=q.numClippingPlanes,it.numIntersection=q.numClipIntersection,it.vertexAlphas=q.vertexAlphas,it.vertexTangents=q.vertexTangents,it.toneMapping=q.toneMapping}function Us(A,q,it,rt,X){q.isScene!==!0&&(q=Le),ie.resetTextureUnits();const bt=q.fog,Ut=rt.isMeshStandardMaterial?q.environment:null,zt=k===null?D.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:Ms,Nt=(rt.isMeshStandardMaterial?L:tn).get(rt.envMap||Ut),$t=rt.vertexColors===!0&&!!it.attributes.color&&it.attributes.color.itemSize===4,te=!!it.attributes.tangent&&(!!rt.normalMap||rt.anisotropy>0),qt=!!it.morphAttributes.position,ce=!!it.morphAttributes.normal,Te=!!it.morphAttributes.color;let Ge=Ha;rt.toneMapped&&(k===null||k.isXRRenderTarget===!0)&&(Ge=D.toneMapping);const ve=it.morphAttributes.position||it.morphAttributes.normal||it.morphAttributes.color,le=ve!==void 0?ve.length:0,Zt=Yt.get(rt),ke=g.state.lights;if(ft===!0&&(Tt===!0||A!==C)){const Ke=A===C&&rt.id===w;Ht.setState(rt,A,Ke)}let pe=!1;rt.version===Zt.__version?(Zt.needsLights&&Zt.lightsStateVersion!==ke.state.version||Zt.outputColorSpace!==zt||X.isBatchedMesh&&Zt.batching===!1||!X.isBatchedMesh&&Zt.batching===!0||X.isBatchedMesh&&Zt.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&Zt.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&Zt.instancing===!1||!X.isInstancedMesh&&Zt.instancing===!0||X.isSkinnedMesh&&Zt.skinning===!1||!X.isSkinnedMesh&&Zt.skinning===!0||X.isInstancedMesh&&Zt.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Zt.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Zt.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Zt.instancingMorph===!1&&X.morphTexture!==null||Zt.envMap!==Nt||rt.fog===!0&&Zt.fog!==bt||Zt.numClippingPlanes!==void 0&&(Zt.numClippingPlanes!==Ht.numPlanes||Zt.numIntersection!==Ht.numIntersection)||Zt.vertexAlphas!==$t||Zt.vertexTangents!==te||Zt.morphTargets!==qt||Zt.morphNormals!==ce||Zt.morphColors!==Te||Zt.toneMapping!==Ge||Zt.morphTargetsCount!==le)&&(pe=!0):(pe=!0,Zt.__version=rt.version);let bn=Zt.currentProgram;pe===!0&&(bn=Ze(rt,q,X));let hi=!1,Dn=!1,dn=!1;const ze=bn.getUniforms(),Un=Zt.uniforms;if(Vt.useProgram(bn.program)&&(hi=!0,Dn=!0,dn=!0),rt.id!==w&&(w=rt.id,Dn=!0),hi||C!==A){Vt.buffers.depth.getReversed()?(yt.copy(A.projectionMatrix),py(yt),my(yt),ze.setValue(I,"projectionMatrix",yt)):ze.setValue(I,"projectionMatrix",A.projectionMatrix),ze.setValue(I,"viewMatrix",A.matrixWorldInverse);const vn=ze.map.cameraPosition;vn!==void 0&&vn.setValue(I,Kt.setFromMatrixPosition(A.matrixWorld)),Ne.logarithmicDepthBuffer&&ze.setValue(I,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(rt.isMeshPhongMaterial||rt.isMeshToonMaterial||rt.isMeshLambertMaterial||rt.isMeshBasicMaterial||rt.isMeshStandardMaterial||rt.isShaderMaterial)&&ze.setValue(I,"isOrthographic",A.isOrthographicCamera===!0),C!==A&&(C=A,Dn=!0,dn=!0)}if(X.isSkinnedMesh){ze.setOptional(I,X,"bindMatrix"),ze.setOptional(I,X,"bindMatrixInverse");const Ke=X.skeleton;Ke&&(Ke.boneTexture===null&&Ke.computeBoneTexture(),ze.setValue(I,"boneTexture",Ke.boneTexture,ie))}X.isBatchedMesh&&(ze.setOptional(I,X,"batchingTexture"),ze.setValue(I,"batchingTexture",X._matricesTexture,ie),ze.setOptional(I,X,"batchingIdTexture"),ze.setValue(I,"batchingIdTexture",X._indirectTexture,ie),ze.setOptional(I,X,"batchingColorTexture"),X._colorsTexture!==null&&ze.setValue(I,"batchingColorTexture",X._colorsTexture,ie));const An=it.morphAttributes;if((An.position!==void 0||An.normal!==void 0||An.color!==void 0)&&Rt.update(X,it,bn),(Dn||Zt.receiveShadow!==X.receiveShadow)&&(Zt.receiveShadow=X.receiveShadow,ze.setValue(I,"receiveShadow",X.receiveShadow)),rt.isMeshGouraudMaterial&&rt.envMap!==null&&(Un.envMap.value=Nt,Un.flipEnvMap.value=Nt.isCubeTexture&&Nt.isRenderTargetTexture===!1?-1:1),rt.isMeshStandardMaterial&&rt.envMap===null&&q.environment!==null&&(Un.envMapIntensity.value=q.environmentIntensity),Dn&&(ze.setValue(I,"toneMappingExposure",D.toneMappingExposure),Zt.needsLights&&zu(Un,dn),bt&&rt.fog===!0&&lt.refreshFogUniforms(Un,bt),lt.refreshMaterialUniforms(Un,rt,Z,K,g.state.transmissionRenderTarget[A.id]),Tu.upload(I,_n(Zt),Un,ie)),rt.isShaderMaterial&&rt.uniformsNeedUpdate===!0&&(Tu.upload(I,_n(Zt),Un,ie),rt.uniformsNeedUpdate=!1),rt.isSpriteMaterial&&ze.setValue(I,"center",X.center),ze.setValue(I,"modelViewMatrix",X.modelViewMatrix),ze.setValue(I,"normalMatrix",X.normalMatrix),ze.setValue(I,"modelMatrix",X.matrixWorld),rt.isShaderMaterial||rt.isRawShaderMaterial){const Ke=rt.uniformsGroups;for(let vn=0,Er=Ke.length;vn<Er;vn++){const On=Ke[vn];V.update(On,bn),V.bind(On,bn)}}return bn}function zu(A,q){A.ambientLightColor.needsUpdate=q,A.lightProbe.needsUpdate=q,A.directionalLights.needsUpdate=q,A.directionalLightShadows.needsUpdate=q,A.pointLights.needsUpdate=q,A.pointLightShadows.needsUpdate=q,A.spotLights.needsUpdate=q,A.spotLightShadows.needsUpdate=q,A.rectAreaLights.needsUpdate=q,A.hemisphereLights.needsUpdate=q}function Pu(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return F},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return k},this.setRenderTargetTextures=function(A,q,it){const rt=Yt.get(A);rt.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,rt.__autoAllocateDepthBuffer===!1&&(rt.__useRenderToTexture=!1),Yt.get(A.texture).__webglTexture=q,Yt.get(A.depthTexture).__webglTexture=rt.__autoAllocateDepthBuffer?void 0:it,rt.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,q){const it=Yt.get(A);it.__webglFramebuffer=q,it.__useDefaultFramebuffer=q===void 0};const Ho=I.createFramebuffer();this.setRenderTarget=function(A,q=0,it=0){k=A,F=q,O=it;let rt=!0,X=null,bt=!1,Ut=!1;if(A){const Nt=Yt.get(A);if(Nt.__useDefaultFramebuffer!==void 0)Vt.bindFramebuffer(I.FRAMEBUFFER,null),rt=!1;else if(Nt.__webglFramebuffer===void 0)ie.setupRenderTarget(A);else if(Nt.__hasExternalTextures)ie.rebindTextures(A,Yt.get(A.texture).__webglTexture,Yt.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){const qt=A.depthTexture;if(Nt.__boundDepthTexture!==qt){if(qt!==null&&Yt.has(qt)&&(A.width!==qt.image.width||A.height!==qt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ie.setupDepthRenderbuffer(A)}}const $t=A.texture;($t.isData3DTexture||$t.isDataArrayTexture||$t.isCompressedArrayTexture)&&(Ut=!0);const te=Yt.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(te[q])?X=te[q][it]:X=te[q],bt=!0):A.samples>0&&ie.useMultisampledRTT(A)===!1?X=Yt.get(A).__webglMultisampledFramebuffer:Array.isArray(te)?X=te[it]:X=te,H.copy(A.viewport),st.copy(A.scissor),at=A.scissorTest}else H.copy(U).multiplyScalar(Z).floor(),st.copy(nt).multiplyScalar(Z).floor(),at=St;if(it!==0&&(X=Ho),Vt.bindFramebuffer(I.FRAMEBUFFER,X)&&rt&&Vt.drawBuffers(A,X),Vt.viewport(H),Vt.scissor(st),Vt.setScissorTest(at),bt){const Nt=Yt.get(A.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+q,Nt.__webglTexture,it)}else if(Ut){const Nt=Yt.get(A.texture),$t=q;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,Nt.__webglTexture,it,$t)}else if(A!==null&&it!==0){const Nt=Yt.get(A.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Nt.__webglTexture,it)}w=-1},this.readRenderTargetPixels=function(A,q,it,rt,X,bt,Ut,zt=0){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Nt=Yt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ut!==void 0&&(Nt=Nt[Ut]),Nt){Vt.bindFramebuffer(I.FRAMEBUFFER,Nt);try{const $t=A.textures[zt],te=$t.format,qt=$t.type;if(!Ne.textureFormatReadable(te)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ne.textureTypeReadable(qt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}q>=0&&q<=A.width-rt&&it>=0&&it<=A.height-X&&(A.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+zt),I.readPixels(q,it,rt,X,wt.convert(te),wt.convert(qt),bt))}finally{const $t=k!==null?Yt.get(k).__webglFramebuffer:null;Vt.bindFramebuffer(I.FRAMEBUFFER,$t)}}},this.readRenderTargetPixelsAsync=async function(A,q,it,rt,X,bt,Ut,zt=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Nt=Yt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ut!==void 0&&(Nt=Nt[Ut]),Nt)if(q>=0&&q<=A.width-rt&&it>=0&&it<=A.height-X){Vt.bindFramebuffer(I.FRAMEBUFFER,Nt);const $t=A.textures[zt],te=$t.format,qt=$t.type;if(!Ne.textureFormatReadable(te))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ne.textureTypeReadable(qt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ce=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,ce),I.bufferData(I.PIXEL_PACK_BUFFER,bt.byteLength,I.STREAM_READ),A.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+zt),I.readPixels(q,it,rt,X,wt.convert(te),wt.convert(qt),0);const Te=k!==null?Yt.get(k).__webglFramebuffer:null;Vt.bindFramebuffer(I.FRAMEBUFFER,Te);const Ge=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await dy(I,Ge,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,ce),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,bt),I.deleteBuffer(ce),I.deleteSync(Ge),bt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,q=null,it=0){const rt=Math.pow(2,-it),X=Math.floor(A.image.width*rt),bt=Math.floor(A.image.height*rt),Ut=q!==null?q.x:0,zt=q!==null?q.y:0;ie.setTexture2D(A,0),I.copyTexSubImage2D(I.TEXTURE_2D,it,0,0,Ut,zt,X,bt),Vt.unbindTexture()};const Wa=I.createFramebuffer(),Ls=I.createFramebuffer();this.copyTextureToTexture=function(A,q,it=null,rt=null,X=0,bt=null){bt===null&&(X!==0?(_s("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),bt=X,X=0):bt=0);let Ut,zt,Nt,$t,te,qt,ce,Te,Ge;const ve=A.isCompressedTexture?A.mipmaps[bt]:A.image;if(it!==null)Ut=it.max.x-it.min.x,zt=it.max.y-it.min.y,Nt=it.isBox3?it.max.z-it.min.z:1,$t=it.min.x,te=it.min.y,qt=it.isBox3?it.min.z:0;else{const An=Math.pow(2,-X);Ut=Math.floor(ve.width*An),zt=Math.floor(ve.height*An),A.isDataArrayTexture?Nt=ve.depth:A.isData3DTexture?Nt=Math.floor(ve.depth*An):Nt=1,$t=0,te=0,qt=0}rt!==null?(ce=rt.x,Te=rt.y,Ge=rt.z):(ce=0,Te=0,Ge=0);const le=wt.convert(q.format),Zt=wt.convert(q.type);let ke;q.isData3DTexture?(ie.setTexture3D(q,0),ke=I.TEXTURE_3D):q.isDataArrayTexture||q.isCompressedArrayTexture?(ie.setTexture2DArray(q,0),ke=I.TEXTURE_2D_ARRAY):(ie.setTexture2D(q,0),ke=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,q.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,q.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,q.unpackAlignment);const pe=I.getParameter(I.UNPACK_ROW_LENGTH),bn=I.getParameter(I.UNPACK_IMAGE_HEIGHT),hi=I.getParameter(I.UNPACK_SKIP_PIXELS),Dn=I.getParameter(I.UNPACK_SKIP_ROWS),dn=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,ve.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,ve.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,$t),I.pixelStorei(I.UNPACK_SKIP_ROWS,te),I.pixelStorei(I.UNPACK_SKIP_IMAGES,qt);const ze=A.isDataArrayTexture||A.isData3DTexture,Un=q.isDataArrayTexture||q.isData3DTexture;if(A.isDepthTexture){const An=Yt.get(A),Ke=Yt.get(q),vn=Yt.get(An.__renderTarget),Er=Yt.get(Ke.__renderTarget);Vt.bindFramebuffer(I.READ_FRAMEBUFFER,vn.__webglFramebuffer),Vt.bindFramebuffer(I.DRAW_FRAMEBUFFER,Er.__webglFramebuffer);for(let On=0;On<Nt;On++)ze&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Yt.get(A).__webglTexture,X,qt+On),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Yt.get(q).__webglTexture,bt,Ge+On)),I.blitFramebuffer($t,te,Ut,zt,ce,Te,Ut,zt,I.DEPTH_BUFFER_BIT,I.NEAREST);Vt.bindFramebuffer(I.READ_FRAMEBUFFER,null),Vt.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(X!==0||A.isRenderTargetTexture||Yt.has(A)){const An=Yt.get(A),Ke=Yt.get(q);Vt.bindFramebuffer(I.READ_FRAMEBUFFER,Wa),Vt.bindFramebuffer(I.DRAW_FRAMEBUFFER,Ls);for(let vn=0;vn<Nt;vn++)ze?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,An.__webglTexture,X,qt+vn):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,An.__webglTexture,X),Un?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ke.__webglTexture,bt,Ge+vn):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Ke.__webglTexture,bt),X!==0?I.blitFramebuffer($t,te,Ut,zt,ce,Te,Ut,zt,I.COLOR_BUFFER_BIT,I.NEAREST):Un?I.copyTexSubImage3D(ke,bt,ce,Te,Ge+vn,$t,te,Ut,zt):I.copyTexSubImage2D(ke,bt,ce,Te,$t,te,Ut,zt);Vt.bindFramebuffer(I.READ_FRAMEBUFFER,null),Vt.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else Un?A.isDataTexture||A.isData3DTexture?I.texSubImage3D(ke,bt,ce,Te,Ge,Ut,zt,Nt,le,Zt,ve.data):q.isCompressedArrayTexture?I.compressedTexSubImage3D(ke,bt,ce,Te,Ge,Ut,zt,Nt,le,ve.data):I.texSubImage3D(ke,bt,ce,Te,Ge,Ut,zt,Nt,le,Zt,ve):A.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,bt,ce,Te,Ut,zt,le,Zt,ve.data):A.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,bt,ce,Te,ve.width,ve.height,le,ve.data):I.texSubImage2D(I.TEXTURE_2D,bt,ce,Te,Ut,zt,le,Zt,ve);I.pixelStorei(I.UNPACK_ROW_LENGTH,pe),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,bn),I.pixelStorei(I.UNPACK_SKIP_PIXELS,hi),I.pixelStorei(I.UNPACK_SKIP_ROWS,Dn),I.pixelStorei(I.UNPACK_SKIP_IMAGES,dn),bt===0&&q.generateMipmaps&&I.generateMipmap(ke),Vt.unbindTexture()},this.copyTextureToTexture3D=function(A,q,it=null,rt=null,X=0){return _s('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(A,q,it,rt,X)},this.initRenderTarget=function(A){Yt.get(A).__webglFramebuffer===void 0&&ie.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?ie.setTextureCube(A,0):A.isData3DTexture?ie.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?ie.setTexture2DArray(A,0):ie.setTexture2D(A,0),Vt.unbindTexture()},this.resetState=function(){F=0,O=0,k=null,Vt.reset(),ee.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return oa}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const i=this.getContext();i.drawingBufferColorSpace=Re._getDrawingBufferColorSpace(e),i.unpackColorSpace=Re._getUnpackColorSpace()}}const xv=o=>{let e;const i=new Set,r=(p,v)=>{const S=typeof p=="function"?p(e):p;if(!Object.is(S,e)){const x=e;e=v??(typeof S!="object"||S===null)?S:Object.assign({},e,S),i.forEach(M=>M(e,x))}},l=()=>e,d={setState:r,getState:l,getInitialState:()=>m,subscribe:p=>(i.add(p),()=>i.delete(p))},m=e=o(r,l,d);return d},IA=(o=>o?xv(o):xv),FA=o=>o;function HA(o,e=FA){const i=wo.useSyncExternalStore(o.subscribe,wo.useCallback(()=>e(o.getState()),[o,e]),wo.useCallback(()=>e(o.getInitialState()),[o,e]));return wo.useDebugValue(i),i}const yv=o=>{const e=IA(o),i=r=>HA(e,r);return Object.assign(i,e),i},GA=(o=>o?yv(o):yv);let VA=0;const r0=o=>({id:`scene-object-${++VA}`,type:o.type,position:o.position??[0,0,0],color:o.color??"#4f8cff",scale:o.scale??[1,1,1]}),XA=()=>[r0({type:"box",position:[0,0,0],color:"#4f8cff",scale:[1,1,1]})],Mv=XA(),Rh=o=>o.map(e=>({...e,position:[...e.position],scale:[...e.scale]})),bu=GA(o=>({objects:Rh(Mv),addObject:e=>o(i=>({objects:[...i.objects,r0(e)]})),updateObject:(e,i)=>o(r=>({objects:r.objects.map(l=>l.id===e?{...l,...i}:l)})),removeObject:e=>o(i=>({objects:i.objects.filter(r=>r.id!==e)})),setObjects:e=>o({objects:Rh(e)}),resetObjects:()=>o({objects:Rh(Mv)})})),Ev=new ye("#0b1020"),kA=o=>{switch(o.type){case"sphere":return new Ad(.5,32,16);case"cylinder":return new bd(.5,.5,1,32);default:return new As(1,1,1)}},WA=o=>{const e=new yi(kA(o),new qy({color:o.color}));return e.position.set(...o.position),e.scale.set(...o.scale),e},Tv=o=>{o.children.forEach(e=>{if(e instanceof yi){e.geometry.dispose();const i=e.material;Array.isArray(i)?i.forEach(r=>r.dispose()):i.dispose()}}),o.clear()};function qA(){const o=ia.useRef(null),e=ia.useRef(null),i=ia.useRef(null),r=ia.useRef(null),l=ia.useRef(null),c=ia.useRef(null),h=bu(d=>d.objects);return ia.useEffect(()=>{const d=o.current;if(!d)return;const m=new Hy;m.background=Ev;const p=new ui(45,1,.1,100);p.position.set(4,3,6),p.lookAt(0,0,0);const v=new BA({antialias:!0,alpha:!0});v.setPixelRatio(window.devicePixelRatio||1),v.setClearColor(Ev,1),v.outputColorSpace=$n;const S=new Jy(16777215,1.2),x=new Qy(16777215,2.2);x.position.set(5,8,4);const M=new tM(20,20,3359061,2042167),b=new Do;m.add(S),m.add(x),m.add(M),m.add(b),e.current=m,i.current=p,r.current=v,l.current=b,d.appendChild(v.domElement);const R=()=>{const y=d.clientWidth||1,g=d.clientHeight||1;p.aspect=y/g,p.updateProjectionMatrix(),v.setSize(y,g,!1),v.render(m,p)};return c.current=new ResizeObserver(()=>{R()}),c.current.observe(d),R(),()=>{c.current?.disconnect(),c.current=null,Tv(b),m.remove(M),m.remove(S),m.remove(x),m.remove(b),v.dispose(),v.domElement.remove(),e.current=null,i.current=null,r.current=null,l.current=null}},[]),ia.useEffect(()=>{const d=e.current,m=i.current,p=r.current,v=l.current;!d||!m||!p||!v||(Tv(v),h.forEach(S=>{v.add(WA(S))}),p.render(d,m))},[h]),Xe.jsx("div",{ref:o,style:{position:"relative",width:"100%",height:"100%",minHeight:"360px",overflow:"hidden",borderRadius:"24px",background:"#0b1020"}})}function YA(){const o=bu(l=>l.objects),e=bu(l=>l.addObject),i=bu(l=>l.resetObjects),r=`${o.length} object${o.length===1?"":"s"}`;return Xe.jsxs("div",{className:"editor-shell",children:[Xe.jsx(Ex,{title:"Walking Skeleton",subtitle:"A minimal scene editor shell for primitives, materials, and export work.",children:Xe.jsxs("div",{style:{display:"grid",gap:"0.75rem"},children:[Xe.jsx("div",{className:"editor-meta",children:r}),Xe.jsxs("div",{className:"editor-actions",children:[Xe.jsx("button",{className:"editor-action",type:"button",onClick:()=>e({type:"box"}),children:"Add Box"}),Xe.jsx("button",{className:"editor-action",type:"button",onClick:()=>e({type:"sphere",color:"#3DFFA0"}),children:"Add Sphere"}),Xe.jsx("button",{className:"editor-action",type:"button",onClick:()=>e({type:"cylinder",color:"#FF7AE0"}),children:"Add Cylinder"}),Xe.jsx("button",{className:"editor-action",type:"button",onClick:i,children:"Reset"})]})]})}),Xe.jsx("main",{className:"editor-main",children:Xe.jsx(qA,{})})]})}const s0=document.getElementById("root");if(!s0)throw new Error("Root element #root was not found.");Mx.createRoot(s0).render(Xe.jsx(wo.StrictMode,{children:Xe.jsx(YA,{})}));
