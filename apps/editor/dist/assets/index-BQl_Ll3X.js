(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))s(l);new MutationObserver(l=>{for(const c of l)if(c.type==="childList")for(const d of c.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function i(l){const c={};return l.integrity&&(c.integrity=l.integrity),l.referrerPolicy&&(c.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?c.credentials="include":l.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function s(l){if(l.ep)return;l.ep=!0;const c=i(l);fetch(l.href,c)}})();function V_(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var rd={exports:{}},Qo={};var Mv;function Cy(){if(Mv)return Qo;Mv=1;var r=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function i(s,l,c){var d=null;if(c!==void 0&&(d=""+c),l.key!==void 0&&(d=""+l.key),"key"in l){c={};for(var h in l)h!=="key"&&(c[h]=l[h])}else c=l;return l=c.ref,{$$typeof:r,type:s,key:d,ref:l!==void 0?l:null,props:c}}return Qo.Fragment=e,Qo.jsx=i,Qo.jsxs=i,Qo}var Ev;function wy(){return Ev||(Ev=1,rd.exports=Cy()),rd.exports}var g=wy(),od={exports:{}},lt={};var bv;function Ny(){if(bv)return lt;bv=1;var r=Symbol.for("react.transitional.element"),e=Symbol.for("react.portal"),i=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),l=Symbol.for("react.profiler"),c=Symbol.for("react.consumer"),d=Symbol.for("react.context"),h=Symbol.for("react.forward_ref"),p=Symbol.for("react.suspense"),m=Symbol.for("react.memo"),_=Symbol.for("react.lazy"),x=Symbol.for("react.activity"),S=Symbol.iterator;function M(O){return O===null||typeof O!="object"?null:(O=S&&O[S]||O["@@iterator"],typeof O=="function"?O:null)}var T={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},R=Object.assign,E={};function v(O,se,Me){this.props=O,this.context=se,this.refs=E,this.updater=Me||T}v.prototype.isReactComponent={},v.prototype.setState=function(O,se){if(typeof O!="object"&&typeof O!="function"&&O!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,O,se,"setState")},v.prototype.forceUpdate=function(O){this.updater.enqueueForceUpdate(this,O,"forceUpdate")};function B(){}B.prototype=v.prototype;function L(O,se,Me){this.props=O,this.context=se,this.refs=E,this.updater=Me||T}var N=L.prototype=new B;N.constructor=L,R(N,v.prototype),N.isPureReactComponent=!0;var W=Array.isArray;function G(){}var z={H:null,A:null,T:null,S:null},J=Object.prototype.hasOwnProperty;function D(O,se,Me){var K=Me.ref;return{$$typeof:r,type:O,key:se,ref:K!==void 0?K:null,props:Me}}function w(O,se){return D(O.type,se,O.props)}function k(O){return typeof O=="object"&&O!==null&&O.$$typeof===r}function ue(O){var se={"=":"=0",":":"=2"};return"$"+O.replace(/[=:]/g,function(Me){return se[Me]})}var q=/\/+/g;function le(O,se){return typeof O=="object"&&O!==null&&O.key!=null?ue(""+O.key):se.toString(36)}function _e(O){switch(O.status){case"fulfilled":return O.value;case"rejected":throw O.reason;default:switch(typeof O.status=="string"?O.then(G,G):(O.status="pending",O.then(function(se){O.status==="pending"&&(O.status="fulfilled",O.value=se)},function(se){O.status==="pending"&&(O.status="rejected",O.reason=se)})),O.status){case"fulfilled":return O.value;case"rejected":throw O.reason}}throw O}function U(O,se,Me,K,he){var Re=typeof O;(Re==="undefined"||Re==="boolean")&&(O=null);var Ee=!1;if(O===null)Ee=!0;else switch(Re){case"bigint":case"string":case"number":Ee=!0;break;case"object":switch(O.$$typeof){case r:case e:Ee=!0;break;case _:return Ee=O._init,U(Ee(O._payload),se,Me,K,he)}}if(Ee)return he=he(O),Ee=K===""?"."+le(O,0):K,W(he)?(Me="",Ee!=null&&(Me=Ee.replace(q,"$&/")+"/"),U(he,se,Me,"",function($e){return $e})):he!=null&&(k(he)&&(he=w(he,Me+(he.key==null||O&&O.key===he.key?"":(""+he.key).replace(q,"$&/")+"/")+Ee)),se.push(he)),1;Ee=0;var ze=K===""?".":K+":";if(W(O))for(var Je=0;Je<O.length;Je++)K=O[Je],Re=ze+le(K,Je),Ee+=U(K,se,Me,Re,he);else if(Je=M(O),typeof Je=="function")for(O=Je.call(O),Je=0;!(K=O.next()).done;)K=K.value,Re=ze+le(K,Je++),Ee+=U(K,se,Me,Re,he);else if(Re==="object"){if(typeof O.then=="function")return U(_e(O),se,Me,K,he);throw se=String(O),Error("Objects are not valid as a React child (found: "+(se==="[object Object]"?"object with keys {"+Object.keys(O).join(", ")+"}":se)+"). If you meant to render a collection of children, use an array instead.")}return Ee}function $(O,se,Me){if(O==null)return O;var K=[],he=0;return U(O,K,"","",function(Re){return se.call(Me,Re,he++)}),K}function Z(O){if(O._status===-1){var se=O._result;se=se(),se.then(function(Me){(O._status===0||O._status===-1)&&(O._status=1,O._result=Me)},function(Me){(O._status===0||O._status===-1)&&(O._status=2,O._result=Me)}),O._status===-1&&(O._status=0,O._result=se)}if(O._status===1)return O._result.default;throw O._result}var xe=typeof reportError=="function"?reportError:function(O){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var se=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof O=="object"&&O!==null&&typeof O.message=="string"?String(O.message):String(O),error:O});if(!window.dispatchEvent(se))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",O);return}console.error(O)},Ae={map:$,forEach:function(O,se,Me){$(O,function(){se.apply(this,arguments)},Me)},count:function(O){var se=0;return $(O,function(){se++}),se},toArray:function(O){return $(O,function(se){return se})||[]},only:function(O){if(!k(O))throw Error("React.Children.only expected to receive a single React element child.");return O}};return lt.Activity=x,lt.Children=Ae,lt.Component=v,lt.Fragment=i,lt.Profiler=l,lt.PureComponent=L,lt.StrictMode=s,lt.Suspense=p,lt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=z,lt.__COMPILER_RUNTIME={__proto__:null,c:function(O){return z.H.useMemoCache(O)}},lt.cache=function(O){return function(){return O.apply(null,arguments)}},lt.cacheSignal=function(){return null},lt.cloneElement=function(O,se,Me){if(O==null)throw Error("The argument must be a React element, but you passed "+O+".");var K=R({},O.props),he=O.key;if(se!=null)for(Re in se.key!==void 0&&(he=""+se.key),se)!J.call(se,Re)||Re==="key"||Re==="__self"||Re==="__source"||Re==="ref"&&se.ref===void 0||(K[Re]=se[Re]);var Re=arguments.length-2;if(Re===1)K.children=Me;else if(1<Re){for(var Ee=Array(Re),ze=0;ze<Re;ze++)Ee[ze]=arguments[ze+2];K.children=Ee}return D(O.type,he,K)},lt.createContext=function(O){return O={$$typeof:d,_currentValue:O,_currentValue2:O,_threadCount:0,Provider:null,Consumer:null},O.Provider=O,O.Consumer={$$typeof:c,_context:O},O},lt.createElement=function(O,se,Me){var K,he={},Re=null;if(se!=null)for(K in se.key!==void 0&&(Re=""+se.key),se)J.call(se,K)&&K!=="key"&&K!=="__self"&&K!=="__source"&&(he[K]=se[K]);var Ee=arguments.length-2;if(Ee===1)he.children=Me;else if(1<Ee){for(var ze=Array(Ee),Je=0;Je<Ee;Je++)ze[Je]=arguments[Je+2];he.children=ze}if(O&&O.defaultProps)for(K in Ee=O.defaultProps,Ee)he[K]===void 0&&(he[K]=Ee[K]);return D(O,Re,he)},lt.createRef=function(){return{current:null}},lt.forwardRef=function(O){return{$$typeof:h,render:O}},lt.isValidElement=k,lt.lazy=function(O){return{$$typeof:_,_payload:{_status:-1,_result:O},_init:Z}},lt.memo=function(O,se){return{$$typeof:m,type:O,compare:se===void 0?null:se}},lt.startTransition=function(O){var se=z.T,Me={};z.T=Me;try{var K=O(),he=z.S;he!==null&&he(Me,K),typeof K=="object"&&K!==null&&typeof K.then=="function"&&K.then(G,xe)}catch(Re){xe(Re)}finally{se!==null&&Me.types!==null&&(se.types=Me.types),z.T=se}},lt.unstable_useCacheRefresh=function(){return z.H.useCacheRefresh()},lt.use=function(O){return z.H.use(O)},lt.useActionState=function(O,se,Me){return z.H.useActionState(O,se,Me)},lt.useCallback=function(O,se){return z.H.useCallback(O,se)},lt.useContext=function(O){return z.H.useContext(O)},lt.useDebugValue=function(){},lt.useDeferredValue=function(O,se){return z.H.useDeferredValue(O,se)},lt.useEffect=function(O,se){return z.H.useEffect(O,se)},lt.useEffectEvent=function(O){return z.H.useEffectEvent(O)},lt.useId=function(){return z.H.useId()},lt.useImperativeHandle=function(O,se,Me){return z.H.useImperativeHandle(O,se,Me)},lt.useInsertionEffect=function(O,se){return z.H.useInsertionEffect(O,se)},lt.useLayoutEffect=function(O,se){return z.H.useLayoutEffect(O,se)},lt.useMemo=function(O,se){return z.H.useMemo(O,se)},lt.useOptimistic=function(O,se){return z.H.useOptimistic(O,se)},lt.useReducer=function(O,se,Me){return z.H.useReducer(O,se,Me)},lt.useRef=function(O){return z.H.useRef(O)},lt.useState=function(O){return z.H.useState(O)},lt.useSyncExternalStore=function(O,se,Me){return z.H.useSyncExternalStore(O,se,Me)},lt.useTransition=function(){return z.H.useTransition()},lt.version="19.2.7",lt}var Tv;function Uh(){return Tv||(Tv=1,od.exports=Ny()),od.exports}var we=Uh();const sl=V_(we);var ld={exports:{}},Jo={},cd={exports:{}},ud={};var Av;function Dy(){return Av||(Av=1,(function(r){function e(U,$){var Z=U.length;U.push($);e:for(;0<Z;){var xe=Z-1>>>1,Ae=U[xe];if(0<l(Ae,$))U[xe]=$,U[Z]=Ae,Z=xe;else break e}}function i(U){return U.length===0?null:U[0]}function s(U){if(U.length===0)return null;var $=U[0],Z=U.pop();if(Z!==$){U[0]=Z;e:for(var xe=0,Ae=U.length,O=Ae>>>1;xe<O;){var se=2*(xe+1)-1,Me=U[se],K=se+1,he=U[K];if(0>l(Me,Z))K<Ae&&0>l(he,Me)?(U[xe]=he,U[K]=Z,xe=K):(U[xe]=Me,U[se]=Z,xe=se);else if(K<Ae&&0>l(he,Z))U[xe]=he,U[K]=Z,xe=K;else break e}}return $}function l(U,$){var Z=U.sortIndex-$.sortIndex;return Z!==0?Z:U.id-$.id}if(r.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var c=performance;r.unstable_now=function(){return c.now()}}else{var d=Date,h=d.now();r.unstable_now=function(){return d.now()-h}}var p=[],m=[],_=1,x=null,S=3,M=!1,T=!1,R=!1,E=!1,v=typeof setTimeout=="function"?setTimeout:null,B=typeof clearTimeout=="function"?clearTimeout:null,L=typeof setImmediate<"u"?setImmediate:null;function N(U){for(var $=i(m);$!==null;){if($.callback===null)s(m);else if($.startTime<=U)s(m),$.sortIndex=$.expirationTime,e(p,$);else break;$=i(m)}}function W(U){if(R=!1,N(U),!T)if(i(p)!==null)T=!0,G||(G=!0,ue());else{var $=i(m);$!==null&&_e(W,$.startTime-U)}}var G=!1,z=-1,J=5,D=-1;function w(){return E?!0:!(r.unstable_now()-D<J)}function k(){if(E=!1,G){var U=r.unstable_now();D=U;var $=!0;try{e:{T=!1,R&&(R=!1,B(z),z=-1),M=!0;var Z=S;try{t:{for(N(U),x=i(p);x!==null&&!(x.expirationTime>U&&w());){var xe=x.callback;if(typeof xe=="function"){x.callback=null,S=x.priorityLevel;var Ae=xe(x.expirationTime<=U);if(U=r.unstable_now(),typeof Ae=="function"){x.callback=Ae,N(U),$=!0;break t}x===i(p)&&s(p),N(U)}else s(p);x=i(p)}if(x!==null)$=!0;else{var O=i(m);O!==null&&_e(W,O.startTime-U),$=!1}}break e}finally{x=null,S=Z,M=!1}$=void 0}}finally{$?ue():G=!1}}}var ue;if(typeof L=="function")ue=function(){L(k)};else if(typeof MessageChannel<"u"){var q=new MessageChannel,le=q.port2;q.port1.onmessage=k,ue=function(){le.postMessage(null)}}else ue=function(){v(k,0)};function _e(U,$){z=v(function(){U(r.unstable_now())},$)}r.unstable_IdlePriority=5,r.unstable_ImmediatePriority=1,r.unstable_LowPriority=4,r.unstable_NormalPriority=3,r.unstable_Profiling=null,r.unstable_UserBlockingPriority=2,r.unstable_cancelCallback=function(U){U.callback=null},r.unstable_forceFrameRate=function(U){0>U||125<U?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):J=0<U?Math.floor(1e3/U):5},r.unstable_getCurrentPriorityLevel=function(){return S},r.unstable_next=function(U){switch(S){case 1:case 2:case 3:var $=3;break;default:$=S}var Z=S;S=$;try{return U()}finally{S=Z}},r.unstable_requestPaint=function(){E=!0},r.unstable_runWithPriority=function(U,$){switch(U){case 1:case 2:case 3:case 4:case 5:break;default:U=3}var Z=S;S=U;try{return $()}finally{S=Z}},r.unstable_scheduleCallback=function(U,$,Z){var xe=r.unstable_now();switch(typeof Z=="object"&&Z!==null?(Z=Z.delay,Z=typeof Z=="number"&&0<Z?xe+Z:xe):Z=xe,U){case 1:var Ae=-1;break;case 2:Ae=250;break;case 5:Ae=1073741823;break;case 4:Ae=1e4;break;default:Ae=5e3}return Ae=Z+Ae,U={id:_++,callback:$,priorityLevel:U,startTime:Z,expirationTime:Ae,sortIndex:-1},Z>xe?(U.sortIndex=Z,e(m,U),i(p)===null&&U===i(m)&&(R?(B(z),z=-1):R=!0,_e(W,Z-xe))):(U.sortIndex=Ae,e(p,U),T||M||(T=!0,G||(G=!0,ue()))),U},r.unstable_shouldYield=w,r.unstable_wrapCallback=function(U){var $=S;return function(){var Z=S;S=$;try{return U.apply(this,arguments)}finally{S=Z}}}})(ud)),ud}var Rv;function Uy(){return Rv||(Rv=1,cd.exports=Dy()),cd.exports}var fd={exports:{}},zn={};var Cv;function Ly(){if(Cv)return zn;Cv=1;var r=Uh();function e(p){var m="https://react.dev/errors/"+p;if(1<arguments.length){m+="?args[]="+encodeURIComponent(arguments[1]);for(var _=2;_<arguments.length;_++)m+="&args[]="+encodeURIComponent(arguments[_])}return"Minified React error #"+p+"; visit "+m+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function i(){}var s={d:{f:i,r:function(){throw Error(e(522))},D:i,C:i,L:i,m:i,X:i,S:i,M:i},p:0,findDOMNode:null},l=Symbol.for("react.portal");function c(p,m,_){var x=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:l,key:x==null?null:""+x,children:p,containerInfo:m,implementation:_}}var d=r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function h(p,m){if(p==="font")return"";if(typeof m=="string")return m==="use-credentials"?m:""}return zn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=s,zn.createPortal=function(p,m){var _=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!m||m.nodeType!==1&&m.nodeType!==9&&m.nodeType!==11)throw Error(e(299));return c(p,m,null,_)},zn.flushSync=function(p){var m=d.T,_=s.p;try{if(d.T=null,s.p=2,p)return p()}finally{d.T=m,s.p=_,s.d.f()}},zn.preconnect=function(p,m){typeof p=="string"&&(m?(m=m.crossOrigin,m=typeof m=="string"?m==="use-credentials"?m:"":void 0):m=null,s.d.C(p,m))},zn.prefetchDNS=function(p){typeof p=="string"&&s.d.D(p)},zn.preinit=function(p,m){if(typeof p=="string"&&m&&typeof m.as=="string"){var _=m.as,x=h(_,m.crossOrigin),S=typeof m.integrity=="string"?m.integrity:void 0,M=typeof m.fetchPriority=="string"?m.fetchPriority:void 0;_==="style"?s.d.S(p,typeof m.precedence=="string"?m.precedence:void 0,{crossOrigin:x,integrity:S,fetchPriority:M}):_==="script"&&s.d.X(p,{crossOrigin:x,integrity:S,fetchPriority:M,nonce:typeof m.nonce=="string"?m.nonce:void 0})}},zn.preinitModule=function(p,m){if(typeof p=="string")if(typeof m=="object"&&m!==null){if(m.as==null||m.as==="script"){var _=h(m.as,m.crossOrigin);s.d.M(p,{crossOrigin:_,integrity:typeof m.integrity=="string"?m.integrity:void 0,nonce:typeof m.nonce=="string"?m.nonce:void 0})}}else m==null&&s.d.M(p)},zn.preload=function(p,m){if(typeof p=="string"&&typeof m=="object"&&m!==null&&typeof m.as=="string"){var _=m.as,x=h(_,m.crossOrigin);s.d.L(p,_,{crossOrigin:x,integrity:typeof m.integrity=="string"?m.integrity:void 0,nonce:typeof m.nonce=="string"?m.nonce:void 0,type:typeof m.type=="string"?m.type:void 0,fetchPriority:typeof m.fetchPriority=="string"?m.fetchPriority:void 0,referrerPolicy:typeof m.referrerPolicy=="string"?m.referrerPolicy:void 0,imageSrcSet:typeof m.imageSrcSet=="string"?m.imageSrcSet:void 0,imageSizes:typeof m.imageSizes=="string"?m.imageSizes:void 0,media:typeof m.media=="string"?m.media:void 0})}},zn.preloadModule=function(p,m){if(typeof p=="string")if(m){var _=h(m.as,m.crossOrigin);s.d.m(p,{as:typeof m.as=="string"&&m.as!=="script"?m.as:void 0,crossOrigin:_,integrity:typeof m.integrity=="string"?m.integrity:void 0})}else s.d.m(p)},zn.requestFormReset=function(p){s.d.r(p)},zn.unstable_batchedUpdates=function(p,m){return p(m)},zn.useFormState=function(p,m,_){return d.H.useFormState(p,m,_)},zn.useFormStatus=function(){return d.H.useHostTransitionStatus()},zn.version="19.2.7",zn}var wv;function Oy(){if(wv)return fd.exports;wv=1;function r(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(r)}catch(e){console.error(e)}}return r(),fd.exports=Ly(),fd.exports}var Nv;function Py(){if(Nv)return Jo;Nv=1;var r=Uy(),e=Uh(),i=Oy();function s(t){var n="https://react.dev/errors/"+t;if(1<arguments.length){n+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)n+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+t+"; visit "+n+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function l(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function c(t){var n=t,a=t;if(t.alternate)for(;n.return;)n=n.return;else{t=n;do n=t,(n.flags&4098)!==0&&(a=n.return),t=n.return;while(t)}return n.tag===3?a:null}function d(t){if(t.tag===13){var n=t.memoizedState;if(n===null&&(t=t.alternate,t!==null&&(n=t.memoizedState)),n!==null)return n.dehydrated}return null}function h(t){if(t.tag===31){var n=t.memoizedState;if(n===null&&(t=t.alternate,t!==null&&(n=t.memoizedState)),n!==null)return n.dehydrated}return null}function p(t){if(c(t)!==t)throw Error(s(188))}function m(t){var n=t.alternate;if(!n){if(n=c(t),n===null)throw Error(s(188));return n!==t?null:t}for(var a=t,o=n;;){var u=a.return;if(u===null)break;var f=u.alternate;if(f===null){if(o=u.return,o!==null){a=o;continue}break}if(u.child===f.child){for(f=u.child;f;){if(f===a)return p(u),t;if(f===o)return p(u),n;f=f.sibling}throw Error(s(188))}if(a.return!==o.return)a=u,o=f;else{for(var y=!1,A=u.child;A;){if(A===a){y=!0,a=u,o=f;break}if(A===o){y=!0,o=u,a=f;break}A=A.sibling}if(!y){for(A=f.child;A;){if(A===a){y=!0,a=f,o=u;break}if(A===o){y=!0,o=f,a=u;break}A=A.sibling}if(!y)throw Error(s(189))}}if(a.alternate!==o)throw Error(s(190))}if(a.tag!==3)throw Error(s(188));return a.stateNode.current===a?t:n}function _(t){var n=t.tag;if(n===5||n===26||n===27||n===6)return t;for(t=t.child;t!==null;){if(n=_(t),n!==null)return n;t=t.sibling}return null}var x=Object.assign,S=Symbol.for("react.element"),M=Symbol.for("react.transitional.element"),T=Symbol.for("react.portal"),R=Symbol.for("react.fragment"),E=Symbol.for("react.strict_mode"),v=Symbol.for("react.profiler"),B=Symbol.for("react.consumer"),L=Symbol.for("react.context"),N=Symbol.for("react.forward_ref"),W=Symbol.for("react.suspense"),G=Symbol.for("react.suspense_list"),z=Symbol.for("react.memo"),J=Symbol.for("react.lazy"),D=Symbol.for("react.activity"),w=Symbol.for("react.memo_cache_sentinel"),k=Symbol.iterator;function ue(t){return t===null||typeof t!="object"?null:(t=k&&t[k]||t["@@iterator"],typeof t=="function"?t:null)}var q=Symbol.for("react.client.reference");function le(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===q?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case R:return"Fragment";case v:return"Profiler";case E:return"StrictMode";case W:return"Suspense";case G:return"SuspenseList";case D:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case T:return"Portal";case L:return t.displayName||"Context";case B:return(t._context.displayName||"Context")+".Consumer";case N:var n=t.render;return t=t.displayName,t||(t=n.displayName||n.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case z:return n=t.displayName||null,n!==null?n:le(t.type)||"Memo";case J:n=t._payload,t=t._init;try{return le(t(n))}catch{}}return null}var _e=Array.isArray,U=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,$=i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Z={pending:!1,data:null,method:null,action:null},xe=[],Ae=-1;function O(t){return{current:t}}function se(t){0>Ae||(t.current=xe[Ae],xe[Ae]=null,Ae--)}function Me(t,n){Ae++,xe[Ae]=t.current,t.current=n}var K=O(null),he=O(null),Re=O(null),Ee=O(null);function ze(t,n){switch(Me(Re,n),Me(he,t),Me(K,null),n.nodeType){case 9:case 11:t=(t=n.documentElement)&&(t=t.namespaceURI)?Xg(t):0;break;default:if(t=n.tagName,n=n.namespaceURI)n=Xg(n),t=Wg(n,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}se(K),Me(K,t)}function Je(){se(K),se(he),se(Re)}function $e(t){t.memoizedState!==null&&Me(Ee,t);var n=K.current,a=Wg(n,t.type);n!==a&&(Me(he,t),Me(K,a))}function zt(t){he.current===t&&(se(K),se(he)),Ee.current===t&&(se(Ee),qo._currentValue=Z)}var It,_t;function H(t){if(It===void 0)try{throw Error()}catch(a){var n=a.stack.trim().match(/\n( *(at )?)/);It=n&&n[1]||"",_t=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+It+t+_t}var un=!1;function xt(t,n){if(!t||un)return"";un=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var o={DetermineComponentFrameRoot:function(){try{if(n){var ve=function(){throw Error()};if(Object.defineProperty(ve.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(ve,[])}catch(ce){var ie=ce}Reflect.construct(t,[],ve)}else{try{ve.call()}catch(ce){ie=ce}t.call(ve.prototype)}}else{try{throw Error()}catch(ce){ie=ce}(ve=t())&&typeof ve.catch=="function"&&ve.catch(function(){})}}catch(ce){if(ce&&ie&&typeof ce.stack=="string")return[ce.stack,ie.stack]}return[null,null]}};o.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var u=Object.getOwnPropertyDescriptor(o.DetermineComponentFrameRoot,"name");u&&u.configurable&&Object.defineProperty(o.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var f=o.DetermineComponentFrameRoot(),y=f[0],A=f[1];if(y&&A){var I=y.split(`
`),te=A.split(`
`);for(u=o=0;o<I.length&&!I[o].includes("DetermineComponentFrameRoot");)o++;for(;u<te.length&&!te[u].includes("DetermineComponentFrameRoot");)u++;if(o===I.length||u===te.length)for(o=I.length-1,u=te.length-1;1<=o&&0<=u&&I[o]!==te[u];)u--;for(;1<=o&&0<=u;o--,u--)if(I[o]!==te[u]){if(o!==1||u!==1)do if(o--,u--,0>u||I[o]!==te[u]){var de=`
`+I[o].replace(" at new "," at ");return t.displayName&&de.includes("<anonymous>")&&(de=de.replace("<anonymous>",t.displayName)),de}while(1<=o&&0<=u);break}}}finally{un=!1,Error.prepareStackTrace=a}return(a=t?t.displayName||t.name:"")?H(a):""}function Ft(t,n){switch(t.tag){case 26:case 27:case 5:return H(t.type);case 16:return H("Lazy");case 13:return t.child!==n&&n!==null?H("Suspense Fallback"):H("Suspense");case 19:return H("SuspenseList");case 0:case 15:return xt(t.type,!1);case 11:return xt(t.type.render,!1);case 1:return xt(t.type,!0);case 31:return H("Activity");default:return""}}function ke(t){try{var n="",a=null;do n+=Ft(t,a),a=t,t=t.return;while(t);return n}catch(o){return`
Error generating stack: `+o.message+`
`+o.stack}}var gt=Object.prototype.hasOwnProperty,Qe=r.unstable_scheduleCallback,rt=r.unstable_cancelCallback,an=r.unstable_shouldYield,P=r.unstable_requestPaint,b=r.unstable_now,ne=r.unstable_getCurrentPriorityLevel,me=r.unstable_ImmediatePriority,ye=r.unstable_UserBlockingPriority,fe=r.unstable_NormalPriority,We=r.unstable_LowPriority,Ue=r.unstable_IdlePriority,je=r.log,qe=r.unstable_setDisableYieldValue,Se=null,Ne=null;function Ye(t){if(typeof je=="function"&&qe(t),Ne&&typeof Ne.setStrictMode=="function")try{Ne.setStrictMode(Se,t)}catch{}}var Ge=Math.clz32?Math.clz32:j,Le=Math.log,at=Math.LN2;function j(t){return t>>>=0,t===0?32:31-(Le(t)/at|0)|0}var De=256,be=262144,Ie=4194304;function Te(t){var n=t&42;if(n!==0)return n;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function ge(t,n,a){var o=t.pendingLanes;if(o===0)return 0;var u=0,f=t.suspendedLanes,y=t.pingedLanes;t=t.warmLanes;var A=o&134217727;return A!==0?(o=A&~f,o!==0?u=Te(o):(y&=A,y!==0?u=Te(y):a||(a=A&~t,a!==0&&(u=Te(a))))):(A=o&~f,A!==0?u=Te(A):y!==0?u=Te(y):a||(a=o&~t,a!==0&&(u=Te(a)))),u===0?0:n!==0&&n!==u&&(n&f)===0&&(f=u&-u,a=n&-n,f>=a||f===32&&(a&4194048)!==0)?n:u}function He(t,n){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&n)===0}function st(t,n){switch(t){case 1:case 2:case 4:case 8:case 64:return n+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ht(){var t=Ie;return Ie<<=1,(Ie&62914560)===0&&(Ie=4194304),t}function Et(t){for(var n=[],a=0;31>a;a++)n.push(t);return n}function yn(t,n){t.pendingLanes|=n,n!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function Qn(t,n,a,o,u,f){var y=t.pendingLanes;t.pendingLanes=a,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=a,t.entangledLanes&=a,t.errorRecoveryDisabledLanes&=a,t.shellSuspendCounter=0;var A=t.entanglements,I=t.expirationTimes,te=t.hiddenUpdates;for(a=y&~a;0<a;){var de=31-Ge(a),ve=1<<de;A[de]=0,I[de]=-1;var ie=te[de];if(ie!==null)for(te[de]=null,de=0;de<ie.length;de++){var ce=ie[de];ce!==null&&(ce.lane&=-536870913)}a&=~ve}o!==0&&us(t,o,0),f!==0&&u===0&&t.tag!==0&&(t.suspendedLanes|=f&~(y&~n))}function us(t,n,a){t.pendingLanes|=n,t.suspendedLanes&=~n;var o=31-Ge(n);t.entangledLanes|=n,t.entanglements[o]=t.entanglements[o]|1073741824|a&261930}function Ra(t,n){var a=t.entangledLanes|=n;for(t=t.entanglements;a;){var o=31-Ge(a),u=1<<o;u&n|t[o]&n&&(t[o]|=n),a&=~u}}function ui(t,n){var a=n&-n;return a=(a&42)!==0?1:Ii(a),(a&(t.suspendedLanes|n))!==0?0:a}function Ii(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Ca(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function fs(){var t=$.p;return t!==0?t:(t=window.event,t===void 0?32:mv(t.type))}function Ki(t,n){var a=$.p;try{return $.p=t,n()}finally{$.p=a}}var kn=Math.random().toString(36).slice(2),tn="__reactFiber$"+kn,Sn="__reactProps$"+kn,Ei="__reactContainer$"+kn,wa="__reactEvents$"+kn,so="__reactListeners$"+kn,ro="__reactHandles$"+kn,Ys="__reactResources$"+kn,Fi="__reactMarker$"+kn;function ds(t){delete t[tn],delete t[Sn],delete t[wa],delete t[so],delete t[ro]}function C(t){var n=t[tn];if(n)return n;for(var a=t.parentNode;a;){if(n=a[Ei]||a[tn]){if(a=n.alternate,n.child!==null||a!==null&&a.child!==null)for(t=$g(t);t!==null;){if(a=t[tn])return a;t=$g(t)}return n}t=a,a=t.parentNode}return null}function Y(t){if(t=t[tn]||t[Ei]){var n=t.tag;if(n===5||n===6||n===13||n===31||n===26||n===27||n===3)return t}return null}function re(t){var n=t.tag;if(n===5||n===26||n===27||n===6)return t.stateNode;throw Error(s(33))}function oe(t){var n=t[Ys];return n||(n=t[Ys]={hoistableStyles:new Map,hoistableScripts:new Map}),n}function X(t){t[Fi]=!0}var Ce=new Set,Oe={};function Fe(t,n){Be(t,n),Be(t+"Capture",n)}function Be(t,n){for(Oe[t]=n,t=0;t<n.length;t++)Ce.add(n[t])}var it=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),tt={},Ze={};function ut(t){return gt.call(Ze,t)?!0:gt.call(tt,t)?!1:it.test(t)?Ze[t]=!0:(tt[t]=!0,!1)}function Rt(t,n,a){if(ut(n))if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":t.removeAttribute(n);return;case"boolean":var o=n.toLowerCase().slice(0,5);if(o!=="data-"&&o!=="aria-"){t.removeAttribute(n);return}}t.setAttribute(n,""+a)}}function Gt(t,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttribute(n,""+a)}}function yt(t,n,a,o){if(o===null)t.removeAttribute(a);else{switch(typeof o){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(a);return}t.setAttributeNS(n,a,""+o)}}function ot(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Ke(t){var n=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(n==="checkbox"||n==="radio")}function Xt(t,n,a){var o=Object.getOwnPropertyDescriptor(t.constructor.prototype,n);if(!t.hasOwnProperty(n)&&typeof o<"u"&&typeof o.get=="function"&&typeof o.set=="function"){var u=o.get,f=o.set;return Object.defineProperty(t,n,{configurable:!0,get:function(){return u.call(this)},set:function(y){a=""+y,f.call(this,y)}}),Object.defineProperty(t,n,{enumerable:o.enumerable}),{getValue:function(){return a},setValue:function(y){a=""+y},stopTracking:function(){t._valueTracker=null,delete t[n]}}}}function vt(t){if(!t._valueTracker){var n=Ke(t)?"checked":"value";t._valueTracker=Xt(t,n,""+t[n])}}function Tn(t){if(!t)return!1;var n=t._valueTracker;if(!n)return!0;var a=n.getValue(),o="";return t&&(o=Ke(t)?t.checked?"true":"false":t.value),t=o,t!==a?(n.setValue(t),!0):!1}function Jn(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var Cn=/[\n"\\]/g;function Jt(t){return t.replace(Cn,function(n){return"\\"+n.charCodeAt(0).toString(16)+" "})}function Lt(t,n,a,o,u,f,y,A){t.name="",y!=null&&typeof y!="function"&&typeof y!="symbol"&&typeof y!="boolean"?t.type=y:t.removeAttribute("type"),n!=null?y==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+ot(n)):t.value!==""+ot(n)&&(t.value=""+ot(n)):y!=="submit"&&y!=="reset"||t.removeAttribute("value"),n!=null?fn(t,y,ot(n)):a!=null?fn(t,y,ot(a)):o!=null&&t.removeAttribute("value"),u==null&&f!=null&&(t.defaultChecked=!!f),u!=null&&(t.checked=u&&typeof u!="function"&&typeof u!="symbol"),A!=null&&typeof A!="function"&&typeof A!="symbol"&&typeof A!="boolean"?t.name=""+ot(A):t.removeAttribute("name")}function rn(t,n,a,o,u,f,y,A){if(f!=null&&typeof f!="function"&&typeof f!="symbol"&&typeof f!="boolean"&&(t.type=f),n!=null||a!=null){if(!(f!=="submit"&&f!=="reset"||n!=null)){vt(t);return}a=a!=null?""+ot(a):"",n=n!=null?""+ot(n):a,A||n===t.value||(t.value=n),t.defaultValue=n}o=o??u,o=typeof o!="function"&&typeof o!="symbol"&&!!o,t.checked=A?t.checked:!!o,t.defaultChecked=!!o,y!=null&&typeof y!="function"&&typeof y!="symbol"&&typeof y!="boolean"&&(t.name=y),vt(t)}function fn(t,n,a){n==="number"&&Jn(t.ownerDocument)===t||t.defaultValue===""+a||(t.defaultValue=""+a)}function Ot(t,n,a,o){if(t=t.options,n){n={};for(var u=0;u<a.length;u++)n["$"+a[u]]=!0;for(a=0;a<t.length;a++)u=n.hasOwnProperty("$"+t[a].value),t[a].selected!==u&&(t[a].selected=u),u&&o&&(t[a].defaultSelected=!0)}else{for(a=""+ot(a),n=null,u=0;u<t.length;u++){if(t[u].value===a){t[u].selected=!0,o&&(t[u].defaultSelected=!0);return}n!==null||t[u].disabled||(n=t[u])}n!==null&&(n.selected=!0)}}function pn(t,n,a){if(n!=null&&(n=""+ot(n),n!==t.value&&(t.value=n),a==null)){t.defaultValue!==n&&(t.defaultValue=n);return}t.defaultValue=a!=null?""+ot(a):""}function fi(t,n,a,o){if(n==null){if(o!=null){if(a!=null)throw Error(s(92));if(_e(o)){if(1<o.length)throw Error(s(93));o=o[0]}a=o}a==null&&(a=""),n=a}a=ot(n),t.defaultValue=a,o=t.textContent,o===a&&o!==""&&o!==null&&(t.value=o),vt(t)}function wn(t,n){if(n){var a=t.firstChild;if(a&&a===t.lastChild&&a.nodeType===3){a.nodeValue=n;return}}t.textContent=n}var hs=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function oo(t,n,a){var o=n.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?o?t.setProperty(n,""):n==="float"?t.cssFloat="":t[n]="":o?t.setProperty(n,a):typeof a!="number"||a===0||hs.has(n)?n==="float"?t.cssFloat=a:t[n]=(""+a).trim():t[n]=a+"px"}function lo(t,n,a){if(n!=null&&typeof n!="object")throw Error(s(62));if(t=t.style,a!=null){for(var o in a)!a.hasOwnProperty(o)||n!=null&&n.hasOwnProperty(o)||(o.indexOf("--")===0?t.setProperty(o,""):o==="float"?t.cssFloat="":t[o]="");for(var u in n)o=n[u],n.hasOwnProperty(u)&&a[u]!==o&&oo(t,u,o)}else for(var f in n)n.hasOwnProperty(f)&&oo(t,f,n[f])}function ps(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Zs=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),co=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Qi(t){return co.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function di(){}var ms=null;function Ks(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Ji=null,$i=null;function uo(t){var n=Y(t);if(n&&(t=n.stateNode)){var a=t[Sn]||null;e:switch(t=n.stateNode,n.type){case"input":if(Lt(t,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),n=a.name,a.type==="radio"&&n!=null){for(a=t;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Jt(""+n)+'"][type="radio"]'),n=0;n<a.length;n++){var o=a[n];if(o!==t&&o.form===t.form){var u=o[Sn]||null;if(!u)throw Error(s(90));Lt(o,u.value,u.defaultValue,u.defaultValue,u.checked,u.defaultChecked,u.type,u.name)}}for(n=0;n<a.length;n++)o=a[n],o.form===t.form&&Tn(o)}break e;case"textarea":pn(t,a.value,a.defaultValue);break e;case"select":n=a.value,n!=null&&Ot(t,!!a.multiple,n,!1)}}}var Qs=!1;function fo(t,n,a){if(Qs)return t(n,a);Qs=!0;try{var o=t(n);return o}finally{if(Qs=!1,(Ji!==null||$i!==null)&&(tc(),Ji&&(n=Ji,t=$i,$i=Ji=null,uo(n),t)))for(n=0;n<t.length;n++)uo(t[n])}}function Na(t,n){var a=t.stateNode;if(a===null)return null;var o=a[Sn]||null;if(o===null)return null;a=o[n];e:switch(n){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(o=!o.disabled)||(t=t.type,o=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!o;break e;default:t=!1}if(t)return null;if(a&&typeof a!="function")throw Error(s(231,n,typeof a));return a}var bi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Hi=!1;if(bi)try{var ea={};Object.defineProperty(ea,"passive",{get:function(){Hi=!0}}),window.addEventListener("test",ea,ea),window.removeEventListener("test",ea,ea)}catch{Hi=!1}var $n=null,ta=null,gs=null;function vs(){if(gs)return gs;var t,n=ta,a=n.length,o,u="value"in $n?$n.value:$n.textContent,f=u.length;for(t=0;t<a&&n[t]===u[t];t++);var y=a-t;for(o=1;o<=y&&n[a-o]===u[f-o];o++);return gs=u.slice(t,1<o?1-o:void 0)}function _s(t){var n=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&n===13&&(t=13)):t=n,t===10&&(t=13),32<=t||t===13?t:0}function Js(){return!0}function _l(){return!1}function Bn(t){function n(a,o,u,f,y){this._reactName=a,this._targetInst=u,this.type=o,this.nativeEvent=f,this.target=y,this.currentTarget=null;for(var A in t)t.hasOwnProperty(A)&&(a=t[A],this[A]=a?a(f):f[A]);return this.isDefaultPrevented=(f.defaultPrevented!=null?f.defaultPrevented:f.returnValue===!1)?Js:_l,this.isPropagationStopped=_l,this}return x(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Js)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Js)},persist:function(){},isPersistent:Js}),n}var wt={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},F=Bn(wt),Vt=x({},wt,{view:0,detail:0}),Ti=Bn(Vt),Ai,lu,ho,xl=x({},Vt,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:uu,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==ho&&(ho&&t.type==="mousemove"?(Ai=t.screenX-ho.screenX,lu=t.screenY-ho.screenY):lu=Ai=0,ho=t),Ai)},movementY:function(t){return"movementY"in t?t.movementY:lu}}),Yh=Bn(xl),R0=x({},xl,{dataTransfer:0}),C0=Bn(R0),w0=x({},Vt,{relatedTarget:0}),cu=Bn(w0),N0=x({},wt,{animationName:0,elapsedTime:0,pseudoElement:0}),D0=Bn(N0),U0=x({},wt,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),L0=Bn(U0),O0=x({},wt,{data:0}),Zh=Bn(O0),P0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},B0={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},z0={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function I0(t){var n=this.nativeEvent;return n.getModifierState?n.getModifierState(t):(t=z0[t])?!!n[t]:!1}function uu(){return I0}var F0=x({},Vt,{key:function(t){if(t.key){var n=P0[t.key]||t.key;if(n!=="Unidentified")return n}return t.type==="keypress"?(t=_s(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?B0[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:uu,charCode:function(t){return t.type==="keypress"?_s(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?_s(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),H0=Bn(F0),G0=x({},xl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Kh=Bn(G0),V0=x({},Vt,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:uu}),j0=Bn(V0),k0=x({},wt,{propertyName:0,elapsedTime:0,pseudoElement:0}),X0=Bn(k0),W0=x({},xl,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),q0=Bn(W0),Y0=x({},wt,{newState:0,oldState:0}),Z0=Bn(Y0),K0=[9,13,27,32],fu=bi&&"CompositionEvent"in window,po=null;bi&&"documentMode"in document&&(po=document.documentMode);var Q0=bi&&"TextEvent"in window&&!po,Qh=bi&&(!fu||po&&8<po&&11>=po),Jh=" ",$h=!1;function ep(t,n){switch(t){case"keyup":return K0.indexOf(n.keyCode)!==-1;case"keydown":return n.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function tp(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var $s=!1;function J0(t,n){switch(t){case"compositionend":return tp(n);case"keypress":return n.which!==32?null:($h=!0,Jh);case"textInput":return t=n.data,t===Jh&&$h?null:t;default:return null}}function $0(t,n){if($s)return t==="compositionend"||!fu&&ep(t,n)?(t=vs(),gs=ta=$n=null,$s=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(n.ctrlKey||n.altKey||n.metaKey)||n.ctrlKey&&n.altKey){if(n.char&&1<n.char.length)return n.char;if(n.which)return String.fromCharCode(n.which)}return null;case"compositionend":return Qh&&n.locale!=="ko"?null:n.data;default:return null}}var ex={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function np(t){var n=t&&t.nodeName&&t.nodeName.toLowerCase();return n==="input"?!!ex[t.type]:n==="textarea"}function ip(t,n,a,o){Ji?$i?$i.push(o):$i=[o]:Ji=o,n=lc(n,"onChange"),0<n.length&&(a=new F("onChange","change",null,a,o),t.push({event:a,listeners:n}))}var mo=null,go=null;function tx(t){Fg(t,0)}function yl(t){var n=re(t);if(Tn(n))return t}function ap(t,n){if(t==="change")return n}var sp=!1;if(bi){var du;if(bi){var hu="oninput"in document;if(!hu){var rp=document.createElement("div");rp.setAttribute("oninput","return;"),hu=typeof rp.oninput=="function"}du=hu}else du=!1;sp=du&&(!document.documentMode||9<document.documentMode)}function op(){mo&&(mo.detachEvent("onpropertychange",lp),go=mo=null)}function lp(t){if(t.propertyName==="value"&&yl(go)){var n=[];ip(n,go,t,Ks(t)),fo(tx,n)}}function nx(t,n,a){t==="focusin"?(op(),mo=n,go=a,mo.attachEvent("onpropertychange",lp)):t==="focusout"&&op()}function ix(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return yl(go)}function ax(t,n){if(t==="click")return yl(n)}function sx(t,n){if(t==="input"||t==="change")return yl(n)}function rx(t,n){return t===n&&(t!==0||1/t===1/n)||t!==t&&n!==n}var ei=typeof Object.is=="function"?Object.is:rx;function vo(t,n){if(ei(t,n))return!0;if(typeof t!="object"||t===null||typeof n!="object"||n===null)return!1;var a=Object.keys(t),o=Object.keys(n);if(a.length!==o.length)return!1;for(o=0;o<a.length;o++){var u=a[o];if(!gt.call(n,u)||!ei(t[u],n[u]))return!1}return!0}function cp(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function up(t,n){var a=cp(t);t=0;for(var o;a;){if(a.nodeType===3){if(o=t+a.textContent.length,t<=n&&o>=n)return{node:a,offset:n-t};t=o}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=cp(a)}}function fp(t,n){return t&&n?t===n?!0:t&&t.nodeType===3?!1:n&&n.nodeType===3?fp(t,n.parentNode):"contains"in t?t.contains(n):t.compareDocumentPosition?!!(t.compareDocumentPosition(n)&16):!1:!1}function dp(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var n=Jn(t.document);n instanceof t.HTMLIFrameElement;){try{var a=typeof n.contentWindow.location.href=="string"}catch{a=!1}if(a)t=n.contentWindow;else break;n=Jn(t.document)}return n}function pu(t){var n=t&&t.nodeName&&t.nodeName.toLowerCase();return n&&(n==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||n==="textarea"||t.contentEditable==="true")}var ox=bi&&"documentMode"in document&&11>=document.documentMode,er=null,mu=null,_o=null,gu=!1;function hp(t,n,a){var o=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;gu||er==null||er!==Jn(o)||(o=er,"selectionStart"in o&&pu(o)?o={start:o.selectionStart,end:o.selectionEnd}:(o=(o.ownerDocument&&o.ownerDocument.defaultView||window).getSelection(),o={anchorNode:o.anchorNode,anchorOffset:o.anchorOffset,focusNode:o.focusNode,focusOffset:o.focusOffset}),_o&&vo(_o,o)||(_o=o,o=lc(mu,"onSelect"),0<o.length&&(n=new F("onSelect","select",null,n,a),t.push({event:n,listeners:o}),n.target=er)))}function xs(t,n){var a={};return a[t.toLowerCase()]=n.toLowerCase(),a["Webkit"+t]="webkit"+n,a["Moz"+t]="moz"+n,a}var tr={animationend:xs("Animation","AnimationEnd"),animationiteration:xs("Animation","AnimationIteration"),animationstart:xs("Animation","AnimationStart"),transitionrun:xs("Transition","TransitionRun"),transitionstart:xs("Transition","TransitionStart"),transitioncancel:xs("Transition","TransitionCancel"),transitionend:xs("Transition","TransitionEnd")},vu={},pp={};bi&&(pp=document.createElement("div").style,"AnimationEvent"in window||(delete tr.animationend.animation,delete tr.animationiteration.animation,delete tr.animationstart.animation),"TransitionEvent"in window||delete tr.transitionend.transition);function ys(t){if(vu[t])return vu[t];if(!tr[t])return t;var n=tr[t],a;for(a in n)if(n.hasOwnProperty(a)&&a in pp)return vu[t]=n[a];return t}var mp=ys("animationend"),gp=ys("animationiteration"),vp=ys("animationstart"),lx=ys("transitionrun"),cx=ys("transitionstart"),ux=ys("transitioncancel"),_p=ys("transitionend"),xp=new Map,_u="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");_u.push("scrollEnd");function Ri(t,n){xp.set(t,n),Fe(n,[t])}var Sl=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var n=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(n))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},hi=[],nr=0,xu=0;function Ml(){for(var t=nr,n=xu=nr=0;n<t;){var a=hi[n];hi[n++]=null;var o=hi[n];hi[n++]=null;var u=hi[n];hi[n++]=null;var f=hi[n];if(hi[n++]=null,o!==null&&u!==null){var y=o.pending;y===null?u.next=u:(u.next=y.next,y.next=u),o.pending=u}f!==0&&yp(a,u,f)}}function El(t,n,a,o){hi[nr++]=t,hi[nr++]=n,hi[nr++]=a,hi[nr++]=o,xu|=o,t.lanes|=o,t=t.alternate,t!==null&&(t.lanes|=o)}function yu(t,n,a,o){return El(t,n,a,o),bl(t)}function Ss(t,n){return El(t,null,null,n),bl(t)}function yp(t,n,a){t.lanes|=a;var o=t.alternate;o!==null&&(o.lanes|=a);for(var u=!1,f=t.return;f!==null;)f.childLanes|=a,o=f.alternate,o!==null&&(o.childLanes|=a),f.tag===22&&(t=f.stateNode,t===null||t._visibility&1||(u=!0)),t=f,f=f.return;return t.tag===3?(f=t.stateNode,u&&n!==null&&(u=31-Ge(a),t=f.hiddenUpdates,o=t[u],o===null?t[u]=[n]:o.push(n),n.lane=a|536870912),f):null}function bl(t){if(50<Ho)throw Ho=0,Nf=null,Error(s(185));for(var n=t.return;n!==null;)t=n,n=t.return;return t.tag===3?t.stateNode:null}var ir={};function fx(t,n,a,o){this.tag=t,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=n,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=o,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ti(t,n,a,o){return new fx(t,n,a,o)}function Su(t){return t=t.prototype,!(!t||!t.isReactComponent)}function na(t,n){var a=t.alternate;return a===null?(a=ti(t.tag,n,t.key,t.mode),a.elementType=t.elementType,a.type=t.type,a.stateNode=t.stateNode,a.alternate=t,t.alternate=a):(a.pendingProps=n,a.type=t.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=t.flags&65011712,a.childLanes=t.childLanes,a.lanes=t.lanes,a.child=t.child,a.memoizedProps=t.memoizedProps,a.memoizedState=t.memoizedState,a.updateQueue=t.updateQueue,n=t.dependencies,a.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext},a.sibling=t.sibling,a.index=t.index,a.ref=t.ref,a.refCleanup=t.refCleanup,a}function Sp(t,n){t.flags&=65011714;var a=t.alternate;return a===null?(t.childLanes=0,t.lanes=n,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=a.childLanes,t.lanes=a.lanes,t.child=a.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=a.memoizedProps,t.memoizedState=a.memoizedState,t.updateQueue=a.updateQueue,t.type=a.type,n=a.dependencies,t.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),t}function Tl(t,n,a,o,u,f){var y=0;if(o=t,typeof t=="function")Su(t)&&(y=1);else if(typeof t=="string")y=gy(t,a,K.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case D:return t=ti(31,a,n,u),t.elementType=D,t.lanes=f,t;case R:return Ms(a.children,u,f,n);case E:y=8,u|=24;break;case v:return t=ti(12,a,n,u|2),t.elementType=v,t.lanes=f,t;case W:return t=ti(13,a,n,u),t.elementType=W,t.lanes=f,t;case G:return t=ti(19,a,n,u),t.elementType=G,t.lanes=f,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case L:y=10;break e;case B:y=9;break e;case N:y=11;break e;case z:y=14;break e;case J:y=16,o=null;break e}y=29,a=Error(s(130,t===null?"null":typeof t,"")),o=null}return n=ti(y,a,n,u),n.elementType=t,n.type=o,n.lanes=f,n}function Ms(t,n,a,o){return t=ti(7,t,o,n),t.lanes=a,t}function Mu(t,n,a){return t=ti(6,t,null,n),t.lanes=a,t}function Mp(t){var n=ti(18,null,null,0);return n.stateNode=t,n}function Eu(t,n,a){return n=ti(4,t.children!==null?t.children:[],t.key,n),n.lanes=a,n.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},n}var Ep=new WeakMap;function pi(t,n){if(typeof t=="object"&&t!==null){var a=Ep.get(t);return a!==void 0?a:(n={value:t,source:n,stack:ke(n)},Ep.set(t,n),n)}return{value:t,source:n,stack:ke(n)}}var ar=[],sr=0,Al=null,xo=0,mi=[],gi=0,Da=null,Gi=1,Vi="";function ia(t,n){ar[sr++]=xo,ar[sr++]=Al,Al=t,xo=n}function bp(t,n,a){mi[gi++]=Gi,mi[gi++]=Vi,mi[gi++]=Da,Da=t;var o=Gi;t=Vi;var u=32-Ge(o)-1;o&=~(1<<u),a+=1;var f=32-Ge(n)+u;if(30<f){var y=u-u%5;f=(o&(1<<y)-1).toString(32),o>>=y,u-=y,Gi=1<<32-Ge(n)+u|a<<u|o,Vi=f+t}else Gi=1<<f|a<<u|o,Vi=t}function bu(t){t.return!==null&&(ia(t,1),bp(t,1,0))}function Tu(t){for(;t===Al;)Al=ar[--sr],ar[sr]=null,xo=ar[--sr],ar[sr]=null;for(;t===Da;)Da=mi[--gi],mi[gi]=null,Vi=mi[--gi],mi[gi]=null,Gi=mi[--gi],mi[gi]=null}function Tp(t,n){mi[gi++]=Gi,mi[gi++]=Vi,mi[gi++]=Da,Gi=n.id,Vi=n.overflow,Da=t}var Nn=null,$t=null,Ct=!1,Ua=null,vi=!1,Au=Error(s(519));function La(t){var n=Error(s(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw yo(pi(n,t)),Au}function Ap(t){var n=t.stateNode,a=t.type,o=t.memoizedProps;switch(n[tn]=t,n[Sn]=o,a){case"dialog":Mt("cancel",n),Mt("close",n);break;case"iframe":case"object":case"embed":Mt("load",n);break;case"video":case"audio":for(a=0;a<Vo.length;a++)Mt(Vo[a],n);break;case"source":Mt("error",n);break;case"img":case"image":case"link":Mt("error",n),Mt("load",n);break;case"details":Mt("toggle",n);break;case"input":Mt("invalid",n),rn(n,o.value,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name,!0);break;case"select":Mt("invalid",n);break;case"textarea":Mt("invalid",n),fi(n,o.value,o.defaultValue,o.children)}a=o.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||n.textContent===""+a||o.suppressHydrationWarning===!0||jg(n.textContent,a)?(o.popover!=null&&(Mt("beforetoggle",n),Mt("toggle",n)),o.onScroll!=null&&Mt("scroll",n),o.onScrollEnd!=null&&Mt("scrollend",n),o.onClick!=null&&(n.onclick=di),n=!0):n=!1,n||La(t,!0)}function Rp(t){for(Nn=t.return;Nn;)switch(Nn.tag){case 5:case 31:case 13:vi=!1;return;case 27:case 3:vi=!0;return;default:Nn=Nn.return}}function rr(t){if(t!==Nn)return!1;if(!Ct)return Rp(t),Ct=!0,!1;var n=t.tag,a;if((a=n!==3&&n!==27)&&((a=n===5)&&(a=t.type,a=!(a!=="form"&&a!=="button")||Xf(t.type,t.memoizedProps)),a=!a),a&&$t&&La(t),Rp(t),n===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(s(317));$t=Jg(t)}else if(n===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(s(317));$t=Jg(t)}else n===27?(n=$t,qa(t.type)?(t=Kf,Kf=null,$t=t):$t=n):$t=Nn?xi(t.stateNode.nextSibling):null;return!0}function Es(){$t=Nn=null,Ct=!1}function Ru(){var t=Ua;return t!==null&&(Yn===null?Yn=t:Yn.push.apply(Yn,t),Ua=null),t}function yo(t){Ua===null?Ua=[t]:Ua.push(t)}var Cu=O(null),bs=null,aa=null;function Oa(t,n,a){Me(Cu,n._currentValue),n._currentValue=a}function sa(t){t._currentValue=Cu.current,se(Cu)}function wu(t,n,a){for(;t!==null;){var o=t.alternate;if((t.childLanes&n)!==n?(t.childLanes|=n,o!==null&&(o.childLanes|=n)):o!==null&&(o.childLanes&n)!==n&&(o.childLanes|=n),t===a)break;t=t.return}}function Nu(t,n,a,o){var u=t.child;for(u!==null&&(u.return=t);u!==null;){var f=u.dependencies;if(f!==null){var y=u.child;f=f.firstContext;e:for(;f!==null;){var A=f;f=u;for(var I=0;I<n.length;I++)if(A.context===n[I]){f.lanes|=a,A=f.alternate,A!==null&&(A.lanes|=a),wu(f.return,a,t),o||(y=null);break e}f=A.next}}else if(u.tag===18){if(y=u.return,y===null)throw Error(s(341));y.lanes|=a,f=y.alternate,f!==null&&(f.lanes|=a),wu(y,a,t),y=null}else y=u.child;if(y!==null)y.return=u;else for(y=u;y!==null;){if(y===t){y=null;break}if(u=y.sibling,u!==null){u.return=y.return,y=u;break}y=y.return}u=y}}function or(t,n,a,o){t=null;for(var u=n,f=!1;u!==null;){if(!f){if((u.flags&524288)!==0)f=!0;else if((u.flags&262144)!==0)break}if(u.tag===10){var y=u.alternate;if(y===null)throw Error(s(387));if(y=y.memoizedProps,y!==null){var A=u.type;ei(u.pendingProps.value,y.value)||(t!==null?t.push(A):t=[A])}}else if(u===Ee.current){if(y=u.alternate,y===null)throw Error(s(387));y.memoizedState.memoizedState!==u.memoizedState.memoizedState&&(t!==null?t.push(qo):t=[qo])}u=u.return}t!==null&&Nu(n,t,a,o),n.flags|=262144}function Rl(t){for(t=t.firstContext;t!==null;){if(!ei(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Ts(t){bs=t,aa=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function Dn(t){return Cp(bs,t)}function Cl(t,n){return bs===null&&Ts(t),Cp(t,n)}function Cp(t,n){var a=n._currentValue;if(n={context:n,memoizedValue:a,next:null},aa===null){if(t===null)throw Error(s(308));aa=n,t.dependencies={lanes:0,firstContext:n},t.flags|=524288}else aa=aa.next=n;return a}var dx=typeof AbortController<"u"?AbortController:function(){var t=[],n=this.signal={aborted:!1,addEventListener:function(a,o){t.push(o)}};this.abort=function(){n.aborted=!0,t.forEach(function(a){return a()})}},hx=r.unstable_scheduleCallback,px=r.unstable_NormalPriority,mn={$$typeof:L,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Du(){return{controller:new dx,data:new Map,refCount:0}}function So(t){t.refCount--,t.refCount===0&&hx(px,function(){t.controller.abort()})}var Mo=null,Uu=0,lr=0,cr=null;function mx(t,n){if(Mo===null){var a=Mo=[];Uu=0,lr=Bf(),cr={status:"pending",value:void 0,then:function(o){a.push(o)}}}return Uu++,n.then(wp,wp),n}function wp(){if(--Uu===0&&Mo!==null){cr!==null&&(cr.status="fulfilled");var t=Mo;Mo=null,lr=0,cr=null;for(var n=0;n<t.length;n++)(0,t[n])()}}function gx(t,n){var a=[],o={status:"pending",value:null,reason:null,then:function(u){a.push(u)}};return t.then(function(){o.status="fulfilled",o.value=n;for(var u=0;u<a.length;u++)(0,a[u])(n)},function(u){for(o.status="rejected",o.reason=u,u=0;u<a.length;u++)(0,a[u])(void 0)}),o}var Np=U.S;U.S=function(t,n){hg=b(),typeof n=="object"&&n!==null&&typeof n.then=="function"&&mx(t,n),Np!==null&&Np(t,n)};var As=O(null);function Lu(){var t=As.current;return t!==null?t:Qt.pooledCache}function wl(t,n){n===null?Me(As,As.current):Me(As,n.pool)}function Dp(){var t=Lu();return t===null?null:{parent:mn._currentValue,pool:t}}var ur=Error(s(460)),Ou=Error(s(474)),Nl=Error(s(542)),Dl={then:function(){}};function Up(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Lp(t,n,a){switch(a=t[a],a===void 0?t.push(n):a!==n&&(n.then(di,di),n=a),n.status){case"fulfilled":return n.value;case"rejected":throw t=n.reason,Pp(t),t;default:if(typeof n.status=="string")n.then(di,di);else{if(t=Qt,t!==null&&100<t.shellSuspendCounter)throw Error(s(482));t=n,t.status="pending",t.then(function(o){if(n.status==="pending"){var u=n;u.status="fulfilled",u.value=o}},function(o){if(n.status==="pending"){var u=n;u.status="rejected",u.reason=o}})}switch(n.status){case"fulfilled":return n.value;case"rejected":throw t=n.reason,Pp(t),t}throw Cs=n,ur}}function Rs(t){try{var n=t._init;return n(t._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Cs=a,ur):a}}var Cs=null;function Op(){if(Cs===null)throw Error(s(459));var t=Cs;return Cs=null,t}function Pp(t){if(t===ur||t===Nl)throw Error(s(483))}var fr=null,Eo=0;function Ul(t){var n=Eo;return Eo+=1,fr===null&&(fr=[]),Lp(fr,t,n)}function bo(t,n){n=n.props.ref,t.ref=n!==void 0?n:null}function Ll(t,n){throw n.$$typeof===S?Error(s(525)):(t=Object.prototype.toString.call(n),Error(s(31,t==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":t)))}function Bp(t){function n(Q,V){if(t){var ee=Q.deletions;ee===null?(Q.deletions=[V],Q.flags|=16):ee.push(V)}}function a(Q,V){if(!t)return null;for(;V!==null;)n(Q,V),V=V.sibling;return null}function o(Q){for(var V=new Map;Q!==null;)Q.key!==null?V.set(Q.key,Q):V.set(Q.index,Q),Q=Q.sibling;return V}function u(Q,V){return Q=na(Q,V),Q.index=0,Q.sibling=null,Q}function f(Q,V,ee){return Q.index=ee,t?(ee=Q.alternate,ee!==null?(ee=ee.index,ee<V?(Q.flags|=67108866,V):ee):(Q.flags|=67108866,V)):(Q.flags|=1048576,V)}function y(Q){return t&&Q.alternate===null&&(Q.flags|=67108866),Q}function A(Q,V,ee,pe){return V===null||V.tag!==6?(V=Mu(ee,Q.mode,pe),V.return=Q,V):(V=u(V,ee),V.return=Q,V)}function I(Q,V,ee,pe){var et=ee.type;return et===R?de(Q,V,ee.props.children,pe,ee.key):V!==null&&(V.elementType===et||typeof et=="object"&&et!==null&&et.$$typeof===J&&Rs(et)===V.type)?(V=u(V,ee.props),bo(V,ee),V.return=Q,V):(V=Tl(ee.type,ee.key,ee.props,null,Q.mode,pe),bo(V,ee),V.return=Q,V)}function te(Q,V,ee,pe){return V===null||V.tag!==4||V.stateNode.containerInfo!==ee.containerInfo||V.stateNode.implementation!==ee.implementation?(V=Eu(ee,Q.mode,pe),V.return=Q,V):(V=u(V,ee.children||[]),V.return=Q,V)}function de(Q,V,ee,pe,et){return V===null||V.tag!==7?(V=Ms(ee,Q.mode,pe,et),V.return=Q,V):(V=u(V,ee),V.return=Q,V)}function ve(Q,V,ee){if(typeof V=="string"&&V!==""||typeof V=="number"||typeof V=="bigint")return V=Mu(""+V,Q.mode,ee),V.return=Q,V;if(typeof V=="object"&&V!==null){switch(V.$$typeof){case M:return ee=Tl(V.type,V.key,V.props,null,Q.mode,ee),bo(ee,V),ee.return=Q,ee;case T:return V=Eu(V,Q.mode,ee),V.return=Q,V;case J:return V=Rs(V),ve(Q,V,ee)}if(_e(V)||ue(V))return V=Ms(V,Q.mode,ee,null),V.return=Q,V;if(typeof V.then=="function")return ve(Q,Ul(V),ee);if(V.$$typeof===L)return ve(Q,Cl(Q,V),ee);Ll(Q,V)}return null}function ie(Q,V,ee,pe){var et=V!==null?V.key:null;if(typeof ee=="string"&&ee!==""||typeof ee=="number"||typeof ee=="bigint")return et!==null?null:A(Q,V,""+ee,pe);if(typeof ee=="object"&&ee!==null){switch(ee.$$typeof){case M:return ee.key===et?I(Q,V,ee,pe):null;case T:return ee.key===et?te(Q,V,ee,pe):null;case J:return ee=Rs(ee),ie(Q,V,ee,pe)}if(_e(ee)||ue(ee))return et!==null?null:de(Q,V,ee,pe,null);if(typeof ee.then=="function")return ie(Q,V,Ul(ee),pe);if(ee.$$typeof===L)return ie(Q,V,Cl(Q,ee),pe);Ll(Q,ee)}return null}function ce(Q,V,ee,pe,et){if(typeof pe=="string"&&pe!==""||typeof pe=="number"||typeof pe=="bigint")return Q=Q.get(ee)||null,A(V,Q,""+pe,et);if(typeof pe=="object"&&pe!==null){switch(pe.$$typeof){case M:return Q=Q.get(pe.key===null?ee:pe.key)||null,I(V,Q,pe,et);case T:return Q=Q.get(pe.key===null?ee:pe.key)||null,te(V,Q,pe,et);case J:return pe=Rs(pe),ce(Q,V,ee,pe,et)}if(_e(pe)||ue(pe))return Q=Q.get(ee)||null,de(V,Q,pe,et,null);if(typeof pe.then=="function")return ce(Q,V,ee,Ul(pe),et);if(pe.$$typeof===L)return ce(Q,V,ee,Cl(V,pe),et);Ll(V,pe)}return null}function Ve(Q,V,ee,pe){for(var et=null,Nt=null,Xe=V,ft=V=0,Tt=null;Xe!==null&&ft<ee.length;ft++){Xe.index>ft?(Tt=Xe,Xe=null):Tt=Xe.sibling;var Dt=ie(Q,Xe,ee[ft],pe);if(Dt===null){Xe===null&&(Xe=Tt);break}t&&Xe&&Dt.alternate===null&&n(Q,Xe),V=f(Dt,V,ft),Nt===null?et=Dt:Nt.sibling=Dt,Nt=Dt,Xe=Tt}if(ft===ee.length)return a(Q,Xe),Ct&&ia(Q,ft),et;if(Xe===null){for(;ft<ee.length;ft++)Xe=ve(Q,ee[ft],pe),Xe!==null&&(V=f(Xe,V,ft),Nt===null?et=Xe:Nt.sibling=Xe,Nt=Xe);return Ct&&ia(Q,ft),et}for(Xe=o(Xe);ft<ee.length;ft++)Tt=ce(Xe,Q,ft,ee[ft],pe),Tt!==null&&(t&&Tt.alternate!==null&&Xe.delete(Tt.key===null?ft:Tt.key),V=f(Tt,V,ft),Nt===null?et=Tt:Nt.sibling=Tt,Nt=Tt);return t&&Xe.forEach(function(Ja){return n(Q,Ja)}),Ct&&ia(Q,ft),et}function nt(Q,V,ee,pe){if(ee==null)throw Error(s(151));for(var et=null,Nt=null,Xe=V,ft=V=0,Tt=null,Dt=ee.next();Xe!==null&&!Dt.done;ft++,Dt=ee.next()){Xe.index>ft?(Tt=Xe,Xe=null):Tt=Xe.sibling;var Ja=ie(Q,Xe,Dt.value,pe);if(Ja===null){Xe===null&&(Xe=Tt);break}t&&Xe&&Ja.alternate===null&&n(Q,Xe),V=f(Ja,V,ft),Nt===null?et=Ja:Nt.sibling=Ja,Nt=Ja,Xe=Tt}if(Dt.done)return a(Q,Xe),Ct&&ia(Q,ft),et;if(Xe===null){for(;!Dt.done;ft++,Dt=ee.next())Dt=ve(Q,Dt.value,pe),Dt!==null&&(V=f(Dt,V,ft),Nt===null?et=Dt:Nt.sibling=Dt,Nt=Dt);return Ct&&ia(Q,ft),et}for(Xe=o(Xe);!Dt.done;ft++,Dt=ee.next())Dt=ce(Xe,Q,ft,Dt.value,pe),Dt!==null&&(t&&Dt.alternate!==null&&Xe.delete(Dt.key===null?ft:Dt.key),V=f(Dt,V,ft),Nt===null?et=Dt:Nt.sibling=Dt,Nt=Dt);return t&&Xe.forEach(function(Ry){return n(Q,Ry)}),Ct&&ia(Q,ft),et}function Yt(Q,V,ee,pe){if(typeof ee=="object"&&ee!==null&&ee.type===R&&ee.key===null&&(ee=ee.props.children),typeof ee=="object"&&ee!==null){switch(ee.$$typeof){case M:e:{for(var et=ee.key;V!==null;){if(V.key===et){if(et=ee.type,et===R){if(V.tag===7){a(Q,V.sibling),pe=u(V,ee.props.children),pe.return=Q,Q=pe;break e}}else if(V.elementType===et||typeof et=="object"&&et!==null&&et.$$typeof===J&&Rs(et)===V.type){a(Q,V.sibling),pe=u(V,ee.props),bo(pe,ee),pe.return=Q,Q=pe;break e}a(Q,V);break}else n(Q,V);V=V.sibling}ee.type===R?(pe=Ms(ee.props.children,Q.mode,pe,ee.key),pe.return=Q,Q=pe):(pe=Tl(ee.type,ee.key,ee.props,null,Q.mode,pe),bo(pe,ee),pe.return=Q,Q=pe)}return y(Q);case T:e:{for(et=ee.key;V!==null;){if(V.key===et)if(V.tag===4&&V.stateNode.containerInfo===ee.containerInfo&&V.stateNode.implementation===ee.implementation){a(Q,V.sibling),pe=u(V,ee.children||[]),pe.return=Q,Q=pe;break e}else{a(Q,V);break}else n(Q,V);V=V.sibling}pe=Eu(ee,Q.mode,pe),pe.return=Q,Q=pe}return y(Q);case J:return ee=Rs(ee),Yt(Q,V,ee,pe)}if(_e(ee))return Ve(Q,V,ee,pe);if(ue(ee)){if(et=ue(ee),typeof et!="function")throw Error(s(150));return ee=et.call(ee),nt(Q,V,ee,pe)}if(typeof ee.then=="function")return Yt(Q,V,Ul(ee),pe);if(ee.$$typeof===L)return Yt(Q,V,Cl(Q,ee),pe);Ll(Q,ee)}return typeof ee=="string"&&ee!==""||typeof ee=="number"||typeof ee=="bigint"?(ee=""+ee,V!==null&&V.tag===6?(a(Q,V.sibling),pe=u(V,ee),pe.return=Q,Q=pe):(a(Q,V),pe=Mu(ee,Q.mode,pe),pe.return=Q,Q=pe),y(Q)):a(Q,V)}return function(Q,V,ee,pe){try{Eo=0;var et=Yt(Q,V,ee,pe);return fr=null,et}catch(Xe){if(Xe===ur||Xe===Nl)throw Xe;var Nt=ti(29,Xe,null,Q.mode);return Nt.lanes=pe,Nt.return=Q,Nt}}}var ws=Bp(!0),zp=Bp(!1),Pa=!1;function Pu(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Bu(t,n){t=t.updateQueue,n.updateQueue===t&&(n.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function Ba(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function za(t,n,a){var o=t.updateQueue;if(o===null)return null;if(o=o.shared,(Pt&2)!==0){var u=o.pending;return u===null?n.next=n:(n.next=u.next,u.next=n),o.pending=n,n=bl(t),yp(t,null,a),n}return El(t,o,n,a),bl(t)}function To(t,n,a){if(n=n.updateQueue,n!==null&&(n=n.shared,(a&4194048)!==0)){var o=n.lanes;o&=t.pendingLanes,a|=o,n.lanes=a,Ra(t,a)}}function zu(t,n){var a=t.updateQueue,o=t.alternate;if(o!==null&&(o=o.updateQueue,a===o)){var u=null,f=null;if(a=a.firstBaseUpdate,a!==null){do{var y={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};f===null?u=f=y:f=f.next=y,a=a.next}while(a!==null);f===null?u=f=n:f=f.next=n}else u=f=n;a={baseState:o.baseState,firstBaseUpdate:u,lastBaseUpdate:f,shared:o.shared,callbacks:o.callbacks},t.updateQueue=a;return}t=a.lastBaseUpdate,t===null?a.firstBaseUpdate=n:t.next=n,a.lastBaseUpdate=n}var Iu=!1;function Ao(){if(Iu){var t=cr;if(t!==null)throw t}}function Ro(t,n,a,o){Iu=!1;var u=t.updateQueue;Pa=!1;var f=u.firstBaseUpdate,y=u.lastBaseUpdate,A=u.shared.pending;if(A!==null){u.shared.pending=null;var I=A,te=I.next;I.next=null,y===null?f=te:y.next=te,y=I;var de=t.alternate;de!==null&&(de=de.updateQueue,A=de.lastBaseUpdate,A!==y&&(A===null?de.firstBaseUpdate=te:A.next=te,de.lastBaseUpdate=I))}if(f!==null){var ve=u.baseState;y=0,de=te=I=null,A=f;do{var ie=A.lane&-536870913,ce=ie!==A.lane;if(ce?(bt&ie)===ie:(o&ie)===ie){ie!==0&&ie===lr&&(Iu=!0),de!==null&&(de=de.next={lane:0,tag:A.tag,payload:A.payload,callback:null,next:null});e:{var Ve=t,nt=A;ie=n;var Yt=a;switch(nt.tag){case 1:if(Ve=nt.payload,typeof Ve=="function"){ve=Ve.call(Yt,ve,ie);break e}ve=Ve;break e;case 3:Ve.flags=Ve.flags&-65537|128;case 0:if(Ve=nt.payload,ie=typeof Ve=="function"?Ve.call(Yt,ve,ie):Ve,ie==null)break e;ve=x({},ve,ie);break e;case 2:Pa=!0}}ie=A.callback,ie!==null&&(t.flags|=64,ce&&(t.flags|=8192),ce=u.callbacks,ce===null?u.callbacks=[ie]:ce.push(ie))}else ce={lane:ie,tag:A.tag,payload:A.payload,callback:A.callback,next:null},de===null?(te=de=ce,I=ve):de=de.next=ce,y|=ie;if(A=A.next,A===null){if(A=u.shared.pending,A===null)break;ce=A,A=ce.next,ce.next=null,u.lastBaseUpdate=ce,u.shared.pending=null}}while(!0);de===null&&(I=ve),u.baseState=I,u.firstBaseUpdate=te,u.lastBaseUpdate=de,f===null&&(u.shared.lanes=0),Va|=y,t.lanes=y,t.memoizedState=ve}}function Ip(t,n){if(typeof t!="function")throw Error(s(191,t));t.call(n)}function Fp(t,n){var a=t.callbacks;if(a!==null)for(t.callbacks=null,t=0;t<a.length;t++)Ip(a[t],n)}var dr=O(null),Ol=O(0);function Hp(t,n){t=pa,Me(Ol,t),Me(dr,n),pa=t|n.baseLanes}function Fu(){Me(Ol,pa),Me(dr,dr.current)}function Hu(){pa=Ol.current,se(dr),se(Ol)}var ni=O(null),_i=null;function Ia(t){var n=t.alternate;Me(dn,dn.current&1),Me(ni,t),_i===null&&(n===null||dr.current!==null||n.memoizedState!==null)&&(_i=t)}function Gu(t){Me(dn,dn.current),Me(ni,t),_i===null&&(_i=t)}function Gp(t){t.tag===22?(Me(dn,dn.current),Me(ni,t),_i===null&&(_i=t)):Fa()}function Fa(){Me(dn,dn.current),Me(ni,ni.current)}function ii(t){se(ni),_i===t&&(_i=null),se(dn)}var dn=O(0);function Pl(t){for(var n=t;n!==null;){if(n.tag===13){var a=n.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Yf(a)||Zf(a)))return n}else if(n.tag===19&&(n.memoizedProps.revealOrder==="forwards"||n.memoizedProps.revealOrder==="backwards"||n.memoizedProps.revealOrder==="unstable_legacy-backwards"||n.memoizedProps.revealOrder==="together")){if((n.flags&128)!==0)return n}else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return null;n=n.return}n.sibling.return=n.return,n=n.sibling}return null}var ra=0,ct=null,Wt=null,gn=null,Bl=!1,hr=!1,Ns=!1,zl=0,Co=0,pr=null,vx=0;function on(){throw Error(s(321))}function Vu(t,n){if(n===null)return!1;for(var a=0;a<n.length&&a<t.length;a++)if(!ei(t[a],n[a]))return!1;return!0}function ju(t,n,a,o,u,f){return ra=f,ct=n,n.memoizedState=null,n.updateQueue=null,n.lanes=0,U.H=t===null||t.memoizedState===null?bm:sf,Ns=!1,f=a(o,u),Ns=!1,hr&&(f=jp(n,a,o,u)),Vp(t),f}function Vp(t){U.H=Do;var n=Wt!==null&&Wt.next!==null;if(ra=0,gn=Wt=ct=null,Bl=!1,Co=0,pr=null,n)throw Error(s(300));t===null||vn||(t=t.dependencies,t!==null&&Rl(t)&&(vn=!0))}function jp(t,n,a,o){ct=t;var u=0;do{if(hr&&(pr=null),Co=0,hr=!1,25<=u)throw Error(s(301));if(u+=1,gn=Wt=null,t.updateQueue!=null){var f=t.updateQueue;f.lastEffect=null,f.events=null,f.stores=null,f.memoCache!=null&&(f.memoCache.index=0)}U.H=Tm,f=n(a,o)}while(hr);return f}function _x(){var t=U.H,n=t.useState()[0];return n=typeof n.then=="function"?wo(n):n,t=t.useState()[0],(Wt!==null?Wt.memoizedState:null)!==t&&(ct.flags|=1024),n}function ku(){var t=zl!==0;return zl=0,t}function Xu(t,n,a){n.updateQueue=t.updateQueue,n.flags&=-2053,t.lanes&=~a}function Wu(t){if(Bl){for(t=t.memoizedState;t!==null;){var n=t.queue;n!==null&&(n.pending=null),t=t.next}Bl=!1}ra=0,gn=Wt=ct=null,hr=!1,Co=zl=0,pr=null}function Hn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return gn===null?ct.memoizedState=gn=t:gn=gn.next=t,gn}function hn(){if(Wt===null){var t=ct.alternate;t=t!==null?t.memoizedState:null}else t=Wt.next;var n=gn===null?ct.memoizedState:gn.next;if(n!==null)gn=n,Wt=t;else{if(t===null)throw ct.alternate===null?Error(s(467)):Error(s(310));Wt=t,t={memoizedState:Wt.memoizedState,baseState:Wt.baseState,baseQueue:Wt.baseQueue,queue:Wt.queue,next:null},gn===null?ct.memoizedState=gn=t:gn=gn.next=t}return gn}function Il(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function wo(t){var n=Co;return Co+=1,pr===null&&(pr=[]),t=Lp(pr,t,n),n=ct,(gn===null?n.memoizedState:gn.next)===null&&(n=n.alternate,U.H=n===null||n.memoizedState===null?bm:sf),t}function Fl(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return wo(t);if(t.$$typeof===L)return Dn(t)}throw Error(s(438,String(t)))}function qu(t){var n=null,a=ct.updateQueue;if(a!==null&&(n=a.memoCache),n==null){var o=ct.alternate;o!==null&&(o=o.updateQueue,o!==null&&(o=o.memoCache,o!=null&&(n={data:o.data.map(function(u){return u.slice()}),index:0})))}if(n==null&&(n={data:[],index:0}),a===null&&(a=Il(),ct.updateQueue=a),a.memoCache=n,a=n.data[n.index],a===void 0)for(a=n.data[n.index]=Array(t),o=0;o<t;o++)a[o]=w;return n.index++,a}function oa(t,n){return typeof n=="function"?n(t):n}function Hl(t){var n=hn();return Yu(n,Wt,t)}function Yu(t,n,a){var o=t.queue;if(o===null)throw Error(s(311));o.lastRenderedReducer=a;var u=t.baseQueue,f=o.pending;if(f!==null){if(u!==null){var y=u.next;u.next=f.next,f.next=y}n.baseQueue=u=f,o.pending=null}if(f=t.baseState,u===null)t.memoizedState=f;else{n=u.next;var A=y=null,I=null,te=n,de=!1;do{var ve=te.lane&-536870913;if(ve!==te.lane?(bt&ve)===ve:(ra&ve)===ve){var ie=te.revertLane;if(ie===0)I!==null&&(I=I.next={lane:0,revertLane:0,gesture:null,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null}),ve===lr&&(de=!0);else if((ra&ie)===ie){te=te.next,ie===lr&&(de=!0);continue}else ve={lane:0,revertLane:te.revertLane,gesture:null,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null},I===null?(A=I=ve,y=f):I=I.next=ve,ct.lanes|=ie,Va|=ie;ve=te.action,Ns&&a(f,ve),f=te.hasEagerState?te.eagerState:a(f,ve)}else ie={lane:ve,revertLane:te.revertLane,gesture:te.gesture,action:te.action,hasEagerState:te.hasEagerState,eagerState:te.eagerState,next:null},I===null?(A=I=ie,y=f):I=I.next=ie,ct.lanes|=ve,Va|=ve;te=te.next}while(te!==null&&te!==n);if(I===null?y=f:I.next=A,!ei(f,t.memoizedState)&&(vn=!0,de&&(a=cr,a!==null)))throw a;t.memoizedState=f,t.baseState=y,t.baseQueue=I,o.lastRenderedState=f}return u===null&&(o.lanes=0),[t.memoizedState,o.dispatch]}function Zu(t){var n=hn(),a=n.queue;if(a===null)throw Error(s(311));a.lastRenderedReducer=t;var o=a.dispatch,u=a.pending,f=n.memoizedState;if(u!==null){a.pending=null;var y=u=u.next;do f=t(f,y.action),y=y.next;while(y!==u);ei(f,n.memoizedState)||(vn=!0),n.memoizedState=f,n.baseQueue===null&&(n.baseState=f),a.lastRenderedState=f}return[f,o]}function kp(t,n,a){var o=ct,u=hn(),f=Ct;if(f){if(a===void 0)throw Error(s(407));a=a()}else a=n();var y=!ei((Wt||u).memoizedState,a);if(y&&(u.memoizedState=a,vn=!0),u=u.queue,Ju(qp.bind(null,o,u,t),[t]),u.getSnapshot!==n||y||gn!==null&&gn.memoizedState.tag&1){if(o.flags|=2048,mr(9,{destroy:void 0},Wp.bind(null,o,u,a,n),null),Qt===null)throw Error(s(349));f||(ra&127)!==0||Xp(o,n,a)}return a}function Xp(t,n,a){t.flags|=16384,t={getSnapshot:n,value:a},n=ct.updateQueue,n===null?(n=Il(),ct.updateQueue=n,n.stores=[t]):(a=n.stores,a===null?n.stores=[t]:a.push(t))}function Wp(t,n,a,o){n.value=a,n.getSnapshot=o,Yp(n)&&Zp(t)}function qp(t,n,a){return a(function(){Yp(n)&&Zp(t)})}function Yp(t){var n=t.getSnapshot;t=t.value;try{var a=n();return!ei(t,a)}catch{return!0}}function Zp(t){var n=Ss(t,2);n!==null&&Zn(n,t,2)}function Ku(t){var n=Hn();if(typeof t=="function"){var a=t;if(t=a(),Ns){Ye(!0);try{a()}finally{Ye(!1)}}}return n.memoizedState=n.baseState=t,n.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:oa,lastRenderedState:t},n}function Kp(t,n,a,o){return t.baseState=a,Yu(t,Wt,typeof o=="function"?o:oa)}function xx(t,n,a,o,u){if(jl(t))throw Error(s(485));if(t=n.action,t!==null){var f={payload:u,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(y){f.listeners.push(y)}};U.T!==null?a(!0):f.isTransition=!1,o(f),a=n.pending,a===null?(f.next=n.pending=f,Qp(n,f)):(f.next=a.next,n.pending=a.next=f)}}function Qp(t,n){var a=n.action,o=n.payload,u=t.state;if(n.isTransition){var f=U.T,y={};U.T=y;try{var A=a(u,o),I=U.S;I!==null&&I(y,A),Jp(t,n,A)}catch(te){Qu(t,n,te)}finally{f!==null&&y.types!==null&&(f.types=y.types),U.T=f}}else try{f=a(u,o),Jp(t,n,f)}catch(te){Qu(t,n,te)}}function Jp(t,n,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(o){$p(t,n,o)},function(o){return Qu(t,n,o)}):$p(t,n,a)}function $p(t,n,a){n.status="fulfilled",n.value=a,em(n),t.state=a,n=t.pending,n!==null&&(a=n.next,a===n?t.pending=null:(a=a.next,n.next=a,Qp(t,a)))}function Qu(t,n,a){var o=t.pending;if(t.pending=null,o!==null){o=o.next;do n.status="rejected",n.reason=a,em(n),n=n.next;while(n!==o)}t.action=null}function em(t){t=t.listeners;for(var n=0;n<t.length;n++)(0,t[n])()}function tm(t,n){return n}function nm(t,n){if(Ct){var a=Qt.formState;if(a!==null){e:{var o=ct;if(Ct){if($t){t:{for(var u=$t,f=vi;u.nodeType!==8;){if(!f){u=null;break t}if(u=xi(u.nextSibling),u===null){u=null;break t}}f=u.data,u=f==="F!"||f==="F"?u:null}if(u){$t=xi(u.nextSibling),o=u.data==="F!";break e}}La(o)}o=!1}o&&(n=a[0])}}return a=Hn(),a.memoizedState=a.baseState=n,o={pending:null,lanes:0,dispatch:null,lastRenderedReducer:tm,lastRenderedState:n},a.queue=o,a=Sm.bind(null,ct,o),o.dispatch=a,o=Ku(!1),f=af.bind(null,ct,!1,o.queue),o=Hn(),u={state:n,dispatch:null,action:t,pending:null},o.queue=u,a=xx.bind(null,ct,u,f,a),u.dispatch=a,o.memoizedState=t,[n,a,!1]}function im(t){var n=hn();return am(n,Wt,t)}function am(t,n,a){if(n=Yu(t,n,tm)[0],t=Hl(oa)[0],typeof n=="object"&&n!==null&&typeof n.then=="function")try{var o=wo(n)}catch(y){throw y===ur?Nl:y}else o=n;n=hn();var u=n.queue,f=u.dispatch;return a!==n.memoizedState&&(ct.flags|=2048,mr(9,{destroy:void 0},yx.bind(null,u,a),null)),[o,f,t]}function yx(t,n){t.action=n}function sm(t){var n=hn(),a=Wt;if(a!==null)return am(n,a,t);hn(),n=n.memoizedState,a=hn();var o=a.queue.dispatch;return a.memoizedState=t,[n,o,!1]}function mr(t,n,a,o){return t={tag:t,create:a,deps:o,inst:n,next:null},n=ct.updateQueue,n===null&&(n=Il(),ct.updateQueue=n),a=n.lastEffect,a===null?n.lastEffect=t.next=t:(o=a.next,a.next=t,t.next=o,n.lastEffect=t),t}function rm(){return hn().memoizedState}function Gl(t,n,a,o){var u=Hn();ct.flags|=t,u.memoizedState=mr(1|n,{destroy:void 0},a,o===void 0?null:o)}function Vl(t,n,a,o){var u=hn();o=o===void 0?null:o;var f=u.memoizedState.inst;Wt!==null&&o!==null&&Vu(o,Wt.memoizedState.deps)?u.memoizedState=mr(n,f,a,o):(ct.flags|=t,u.memoizedState=mr(1|n,f,a,o))}function om(t,n){Gl(8390656,8,t,n)}function Ju(t,n){Vl(2048,8,t,n)}function Sx(t){ct.flags|=4;var n=ct.updateQueue;if(n===null)n=Il(),ct.updateQueue=n,n.events=[t];else{var a=n.events;a===null?n.events=[t]:a.push(t)}}function lm(t){var n=hn().memoizedState;return Sx({ref:n,nextImpl:t}),function(){if((Pt&2)!==0)throw Error(s(440));return n.impl.apply(void 0,arguments)}}function cm(t,n){return Vl(4,2,t,n)}function um(t,n){return Vl(4,4,t,n)}function fm(t,n){if(typeof n=="function"){t=t();var a=n(t);return function(){typeof a=="function"?a():n(null)}}if(n!=null)return t=t(),n.current=t,function(){n.current=null}}function dm(t,n,a){a=a!=null?a.concat([t]):null,Vl(4,4,fm.bind(null,n,t),a)}function $u(){}function hm(t,n){var a=hn();n=n===void 0?null:n;var o=a.memoizedState;return n!==null&&Vu(n,o[1])?o[0]:(a.memoizedState=[t,n],t)}function pm(t,n){var a=hn();n=n===void 0?null:n;var o=a.memoizedState;if(n!==null&&Vu(n,o[1]))return o[0];if(o=t(),Ns){Ye(!0);try{t()}finally{Ye(!1)}}return a.memoizedState=[o,n],o}function ef(t,n,a){return a===void 0||(ra&1073741824)!==0&&(bt&261930)===0?t.memoizedState=n:(t.memoizedState=a,t=mg(),ct.lanes|=t,Va|=t,a)}function mm(t,n,a,o){return ei(a,n)?a:dr.current!==null?(t=ef(t,a,o),ei(t,n)||(vn=!0),t):(ra&42)===0||(ra&1073741824)!==0&&(bt&261930)===0?(vn=!0,t.memoizedState=a):(t=mg(),ct.lanes|=t,Va|=t,n)}function gm(t,n,a,o,u){var f=$.p;$.p=f!==0&&8>f?f:8;var y=U.T,A={};U.T=A,af(t,!1,n,a);try{var I=u(),te=U.S;if(te!==null&&te(A,I),I!==null&&typeof I=="object"&&typeof I.then=="function"){var de=gx(I,o);No(t,n,de,ri(t))}else No(t,n,o,ri(t))}catch(ve){No(t,n,{then:function(){},status:"rejected",reason:ve},ri())}finally{$.p=f,y!==null&&A.types!==null&&(y.types=A.types),U.T=y}}function Mx(){}function tf(t,n,a,o){if(t.tag!==5)throw Error(s(476));var u=vm(t).queue;gm(t,u,n,Z,a===null?Mx:function(){return _m(t),a(o)})}function vm(t){var n=t.memoizedState;if(n!==null)return n;n={memoizedState:Z,baseState:Z,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:oa,lastRenderedState:Z},next:null};var a={};return n.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:oa,lastRenderedState:a},next:null},t.memoizedState=n,t=t.alternate,t!==null&&(t.memoizedState=n),n}function _m(t){var n=vm(t);n.next===null&&(n=t.alternate.memoizedState),No(t,n.next.queue,{},ri())}function nf(){return Dn(qo)}function xm(){return hn().memoizedState}function ym(){return hn().memoizedState}function Ex(t){for(var n=t.return;n!==null;){switch(n.tag){case 24:case 3:var a=ri();t=Ba(a);var o=za(n,t,a);o!==null&&(Zn(o,n,a),To(o,n,a)),n={cache:Du()},t.payload=n;return}n=n.return}}function bx(t,n,a){var o=ri();a={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},jl(t)?Mm(n,a):(a=yu(t,n,a,o),a!==null&&(Zn(a,t,o),Em(a,n,o)))}function Sm(t,n,a){var o=ri();No(t,n,a,o)}function No(t,n,a,o){var u={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(jl(t))Mm(n,u);else{var f=t.alternate;if(t.lanes===0&&(f===null||f.lanes===0)&&(f=n.lastRenderedReducer,f!==null))try{var y=n.lastRenderedState,A=f(y,a);if(u.hasEagerState=!0,u.eagerState=A,ei(A,y))return El(t,n,u,0),Qt===null&&Ml(),!1}catch{}if(a=yu(t,n,u,o),a!==null)return Zn(a,t,o),Em(a,n,o),!0}return!1}function af(t,n,a,o){if(o={lane:2,revertLane:Bf(),gesture:null,action:o,hasEagerState:!1,eagerState:null,next:null},jl(t)){if(n)throw Error(s(479))}else n=yu(t,a,o,2),n!==null&&Zn(n,t,2)}function jl(t){var n=t.alternate;return t===ct||n!==null&&n===ct}function Mm(t,n){hr=Bl=!0;var a=t.pending;a===null?n.next=n:(n.next=a.next,a.next=n),t.pending=n}function Em(t,n,a){if((a&4194048)!==0){var o=n.lanes;o&=t.pendingLanes,a|=o,n.lanes=a,Ra(t,a)}}var Do={readContext:Dn,use:Fl,useCallback:on,useContext:on,useEffect:on,useImperativeHandle:on,useLayoutEffect:on,useInsertionEffect:on,useMemo:on,useReducer:on,useRef:on,useState:on,useDebugValue:on,useDeferredValue:on,useTransition:on,useSyncExternalStore:on,useId:on,useHostTransitionStatus:on,useFormState:on,useActionState:on,useOptimistic:on,useMemoCache:on,useCacheRefresh:on};Do.useEffectEvent=on;var bm={readContext:Dn,use:Fl,useCallback:function(t,n){return Hn().memoizedState=[t,n===void 0?null:n],t},useContext:Dn,useEffect:om,useImperativeHandle:function(t,n,a){a=a!=null?a.concat([t]):null,Gl(4194308,4,fm.bind(null,n,t),a)},useLayoutEffect:function(t,n){return Gl(4194308,4,t,n)},useInsertionEffect:function(t,n){Gl(4,2,t,n)},useMemo:function(t,n){var a=Hn();n=n===void 0?null:n;var o=t();if(Ns){Ye(!0);try{t()}finally{Ye(!1)}}return a.memoizedState=[o,n],o},useReducer:function(t,n,a){var o=Hn();if(a!==void 0){var u=a(n);if(Ns){Ye(!0);try{a(n)}finally{Ye(!1)}}}else u=n;return o.memoizedState=o.baseState=u,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:u},o.queue=t,t=t.dispatch=bx.bind(null,ct,t),[o.memoizedState,t]},useRef:function(t){var n=Hn();return t={current:t},n.memoizedState=t},useState:function(t){t=Ku(t);var n=t.queue,a=Sm.bind(null,ct,n);return n.dispatch=a,[t.memoizedState,a]},useDebugValue:$u,useDeferredValue:function(t,n){var a=Hn();return ef(a,t,n)},useTransition:function(){var t=Ku(!1);return t=gm.bind(null,ct,t.queue,!0,!1),Hn().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,n,a){var o=ct,u=Hn();if(Ct){if(a===void 0)throw Error(s(407));a=a()}else{if(a=n(),Qt===null)throw Error(s(349));(bt&127)!==0||Xp(o,n,a)}u.memoizedState=a;var f={value:a,getSnapshot:n};return u.queue=f,om(qp.bind(null,o,f,t),[t]),o.flags|=2048,mr(9,{destroy:void 0},Wp.bind(null,o,f,a,n),null),a},useId:function(){var t=Hn(),n=Qt.identifierPrefix;if(Ct){var a=Vi,o=Gi;a=(o&~(1<<32-Ge(o)-1)).toString(32)+a,n="_"+n+"R_"+a,a=zl++,0<a&&(n+="H"+a.toString(32)),n+="_"}else a=vx++,n="_"+n+"r_"+a.toString(32)+"_";return t.memoizedState=n},useHostTransitionStatus:nf,useFormState:nm,useActionState:nm,useOptimistic:function(t){var n=Hn();n.memoizedState=n.baseState=t;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return n.queue=a,n=af.bind(null,ct,!0,a),a.dispatch=n,[t,n]},useMemoCache:qu,useCacheRefresh:function(){return Hn().memoizedState=Ex.bind(null,ct)},useEffectEvent:function(t){var n=Hn(),a={impl:t};return n.memoizedState=a,function(){if((Pt&2)!==0)throw Error(s(440));return a.impl.apply(void 0,arguments)}}},sf={readContext:Dn,use:Fl,useCallback:hm,useContext:Dn,useEffect:Ju,useImperativeHandle:dm,useInsertionEffect:cm,useLayoutEffect:um,useMemo:pm,useReducer:Hl,useRef:rm,useState:function(){return Hl(oa)},useDebugValue:$u,useDeferredValue:function(t,n){var a=hn();return mm(a,Wt.memoizedState,t,n)},useTransition:function(){var t=Hl(oa)[0],n=hn().memoizedState;return[typeof t=="boolean"?t:wo(t),n]},useSyncExternalStore:kp,useId:xm,useHostTransitionStatus:nf,useFormState:im,useActionState:im,useOptimistic:function(t,n){var a=hn();return Kp(a,Wt,t,n)},useMemoCache:qu,useCacheRefresh:ym};sf.useEffectEvent=lm;var Tm={readContext:Dn,use:Fl,useCallback:hm,useContext:Dn,useEffect:Ju,useImperativeHandle:dm,useInsertionEffect:cm,useLayoutEffect:um,useMemo:pm,useReducer:Zu,useRef:rm,useState:function(){return Zu(oa)},useDebugValue:$u,useDeferredValue:function(t,n){var a=hn();return Wt===null?ef(a,t,n):mm(a,Wt.memoizedState,t,n)},useTransition:function(){var t=Zu(oa)[0],n=hn().memoizedState;return[typeof t=="boolean"?t:wo(t),n]},useSyncExternalStore:kp,useId:xm,useHostTransitionStatus:nf,useFormState:sm,useActionState:sm,useOptimistic:function(t,n){var a=hn();return Wt!==null?Kp(a,Wt,t,n):(a.baseState=t,[t,a.queue.dispatch])},useMemoCache:qu,useCacheRefresh:ym};Tm.useEffectEvent=lm;function rf(t,n,a,o){n=t.memoizedState,a=a(o,n),a=a==null?n:x({},n,a),t.memoizedState=a,t.lanes===0&&(t.updateQueue.baseState=a)}var of={enqueueSetState:function(t,n,a){t=t._reactInternals;var o=ri(),u=Ba(o);u.payload=n,a!=null&&(u.callback=a),n=za(t,u,o),n!==null&&(Zn(n,t,o),To(n,t,o))},enqueueReplaceState:function(t,n,a){t=t._reactInternals;var o=ri(),u=Ba(o);u.tag=1,u.payload=n,a!=null&&(u.callback=a),n=za(t,u,o),n!==null&&(Zn(n,t,o),To(n,t,o))},enqueueForceUpdate:function(t,n){t=t._reactInternals;var a=ri(),o=Ba(a);o.tag=2,n!=null&&(o.callback=n),n=za(t,o,a),n!==null&&(Zn(n,t,a),To(n,t,a))}};function Am(t,n,a,o,u,f,y){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(o,f,y):n.prototype&&n.prototype.isPureReactComponent?!vo(a,o)||!vo(u,f):!0}function Rm(t,n,a,o){t=n.state,typeof n.componentWillReceiveProps=="function"&&n.componentWillReceiveProps(a,o),typeof n.UNSAFE_componentWillReceiveProps=="function"&&n.UNSAFE_componentWillReceiveProps(a,o),n.state!==t&&of.enqueueReplaceState(n,n.state,null)}function Ds(t,n){var a=n;if("ref"in n){a={};for(var o in n)o!=="ref"&&(a[o]=n[o])}if(t=t.defaultProps){a===n&&(a=x({},a));for(var u in t)a[u]===void 0&&(a[u]=t[u])}return a}function Cm(t){Sl(t)}function wm(t){console.error(t)}function Nm(t){Sl(t)}function kl(t,n){try{var a=t.onUncaughtError;a(n.value,{componentStack:n.stack})}catch(o){setTimeout(function(){throw o})}}function Dm(t,n,a){try{var o=t.onCaughtError;o(a.value,{componentStack:a.stack,errorBoundary:n.tag===1?n.stateNode:null})}catch(u){setTimeout(function(){throw u})}}function lf(t,n,a){return a=Ba(a),a.tag=3,a.payload={element:null},a.callback=function(){kl(t,n)},a}function Um(t){return t=Ba(t),t.tag=3,t}function Lm(t,n,a,o){var u=a.type.getDerivedStateFromError;if(typeof u=="function"){var f=o.value;t.payload=function(){return u(f)},t.callback=function(){Dm(n,a,o)}}var y=a.stateNode;y!==null&&typeof y.componentDidCatch=="function"&&(t.callback=function(){Dm(n,a,o),typeof u!="function"&&(ja===null?ja=new Set([this]):ja.add(this));var A=o.stack;this.componentDidCatch(o.value,{componentStack:A!==null?A:""})})}function Tx(t,n,a,o,u){if(a.flags|=32768,o!==null&&typeof o=="object"&&typeof o.then=="function"){if(n=a.alternate,n!==null&&or(n,a,u,!0),a=ni.current,a!==null){switch(a.tag){case 31:case 13:return _i===null?nc():a.alternate===null&&ln===0&&(ln=3),a.flags&=-257,a.flags|=65536,a.lanes=u,o===Dl?a.flags|=16384:(n=a.updateQueue,n===null?a.updateQueue=new Set([o]):n.add(o),Lf(t,o,u)),!1;case 22:return a.flags|=65536,o===Dl?a.flags|=16384:(n=a.updateQueue,n===null?(n={transitions:null,markerInstances:null,retryQueue:new Set([o])},a.updateQueue=n):(a=n.retryQueue,a===null?n.retryQueue=new Set([o]):a.add(o)),Lf(t,o,u)),!1}throw Error(s(435,a.tag))}return Lf(t,o,u),nc(),!1}if(Ct)return n=ni.current,n!==null?((n.flags&65536)===0&&(n.flags|=256),n.flags|=65536,n.lanes=u,o!==Au&&(t=Error(s(422),{cause:o}),yo(pi(t,a)))):(o!==Au&&(n=Error(s(423),{cause:o}),yo(pi(n,a))),t=t.current.alternate,t.flags|=65536,u&=-u,t.lanes|=u,o=pi(o,a),u=lf(t.stateNode,o,u),zu(t,u),ln!==4&&(ln=2)),!1;var f=Error(s(520),{cause:o});if(f=pi(f,a),Fo===null?Fo=[f]:Fo.push(f),ln!==4&&(ln=2),n===null)return!0;o=pi(o,a),a=n;do{switch(a.tag){case 3:return a.flags|=65536,t=u&-u,a.lanes|=t,t=lf(a.stateNode,o,t),zu(a,t),!1;case 1:if(n=a.type,f=a.stateNode,(a.flags&128)===0&&(typeof n.getDerivedStateFromError=="function"||f!==null&&typeof f.componentDidCatch=="function"&&(ja===null||!ja.has(f))))return a.flags|=65536,u&=-u,a.lanes|=u,u=Um(u),Lm(u,t,a,o),zu(a,u),!1}a=a.return}while(a!==null);return!1}var cf=Error(s(461)),vn=!1;function Un(t,n,a,o){n.child=t===null?zp(n,null,a,o):ws(n,t.child,a,o)}function Om(t,n,a,o,u){a=a.render;var f=n.ref;if("ref"in o){var y={};for(var A in o)A!=="ref"&&(y[A]=o[A])}else y=o;return Ts(n),o=ju(t,n,a,y,f,u),A=ku(),t!==null&&!vn?(Xu(t,n,u),la(t,n,u)):(Ct&&A&&bu(n),n.flags|=1,Un(t,n,o,u),n.child)}function Pm(t,n,a,o,u){if(t===null){var f=a.type;return typeof f=="function"&&!Su(f)&&f.defaultProps===void 0&&a.compare===null?(n.tag=15,n.type=f,Bm(t,n,f,o,u)):(t=Tl(a.type,null,o,n,n.mode,u),t.ref=n.ref,t.return=n,n.child=t)}if(f=t.child,!vf(t,u)){var y=f.memoizedProps;if(a=a.compare,a=a!==null?a:vo,a(y,o)&&t.ref===n.ref)return la(t,n,u)}return n.flags|=1,t=na(f,o),t.ref=n.ref,t.return=n,n.child=t}function Bm(t,n,a,o,u){if(t!==null){var f=t.memoizedProps;if(vo(f,o)&&t.ref===n.ref)if(vn=!1,n.pendingProps=o=f,vf(t,u))(t.flags&131072)!==0&&(vn=!0);else return n.lanes=t.lanes,la(t,n,u)}return uf(t,n,a,o,u)}function zm(t,n,a,o){var u=o.children,f=t!==null?t.memoizedState:null;if(t===null&&n.stateNode===null&&(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),o.mode==="hidden"){if((n.flags&128)!==0){if(f=f!==null?f.baseLanes|a:a,t!==null){for(o=n.child=t.child,u=0;o!==null;)u=u|o.lanes|o.childLanes,o=o.sibling;o=u&~f}else o=0,n.child=null;return Im(t,n,f,a,o)}if((a&536870912)!==0)n.memoizedState={baseLanes:0,cachePool:null},t!==null&&wl(n,f!==null?f.cachePool:null),f!==null?Hp(n,f):Fu(),Gp(n);else return o=n.lanes=536870912,Im(t,n,f!==null?f.baseLanes|a:a,a,o)}else f!==null?(wl(n,f.cachePool),Hp(n,f),Fa(),n.memoizedState=null):(t!==null&&wl(n,null),Fu(),Fa());return Un(t,n,u,a),n.child}function Uo(t,n){return t!==null&&t.tag===22||n.stateNode!==null||(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.sibling}function Im(t,n,a,o,u){var f=Lu();return f=f===null?null:{parent:mn._currentValue,pool:f},n.memoizedState={baseLanes:a,cachePool:f},t!==null&&wl(n,null),Fu(),Gp(n),t!==null&&or(t,n,o,!0),n.childLanes=u,null}function Xl(t,n){return n=ql({mode:n.mode,children:n.children},t.mode),n.ref=t.ref,t.child=n,n.return=t,n}function Fm(t,n,a){return ws(n,t.child,null,a),t=Xl(n,n.pendingProps),t.flags|=2,ii(n),n.memoizedState=null,t}function Ax(t,n,a){var o=n.pendingProps,u=(n.flags&128)!==0;if(n.flags&=-129,t===null){if(Ct){if(o.mode==="hidden")return t=Xl(n,o),n.lanes=536870912,Uo(null,t);if(Gu(n),(t=$t)?(t=Qg(t,vi),t=t!==null&&t.data==="&"?t:null,t!==null&&(n.memoizedState={dehydrated:t,treeContext:Da!==null?{id:Gi,overflow:Vi}:null,retryLane:536870912,hydrationErrors:null},a=Mp(t),a.return=n,n.child=a,Nn=n,$t=null)):t=null,t===null)throw La(n);return n.lanes=536870912,null}return Xl(n,o)}var f=t.memoizedState;if(f!==null){var y=f.dehydrated;if(Gu(n),u)if(n.flags&256)n.flags&=-257,n=Fm(t,n,a);else if(n.memoizedState!==null)n.child=t.child,n.flags|=128,n=null;else throw Error(s(558));else if(vn||or(t,n,a,!1),u=(a&t.childLanes)!==0,vn||u){if(o=Qt,o!==null&&(y=ui(o,a),y!==0&&y!==f.retryLane))throw f.retryLane=y,Ss(t,y),Zn(o,t,y),cf;nc(),n=Fm(t,n,a)}else t=f.treeContext,$t=xi(y.nextSibling),Nn=n,Ct=!0,Ua=null,vi=!1,t!==null&&Tp(n,t),n=Xl(n,o),n.flags|=4096;return n}return t=na(t.child,{mode:o.mode,children:o.children}),t.ref=n.ref,n.child=t,t.return=n,t}function Wl(t,n){var a=n.ref;if(a===null)t!==null&&t.ref!==null&&(n.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(s(284));(t===null||t.ref!==a)&&(n.flags|=4194816)}}function uf(t,n,a,o,u){return Ts(n),a=ju(t,n,a,o,void 0,u),o=ku(),t!==null&&!vn?(Xu(t,n,u),la(t,n,u)):(Ct&&o&&bu(n),n.flags|=1,Un(t,n,a,u),n.child)}function Hm(t,n,a,o,u,f){return Ts(n),n.updateQueue=null,a=jp(n,o,a,u),Vp(t),o=ku(),t!==null&&!vn?(Xu(t,n,f),la(t,n,f)):(Ct&&o&&bu(n),n.flags|=1,Un(t,n,a,f),n.child)}function Gm(t,n,a,o,u){if(Ts(n),n.stateNode===null){var f=ir,y=a.contextType;typeof y=="object"&&y!==null&&(f=Dn(y)),f=new a(o,f),n.memoizedState=f.state!==null&&f.state!==void 0?f.state:null,f.updater=of,n.stateNode=f,f._reactInternals=n,f=n.stateNode,f.props=o,f.state=n.memoizedState,f.refs={},Pu(n),y=a.contextType,f.context=typeof y=="object"&&y!==null?Dn(y):ir,f.state=n.memoizedState,y=a.getDerivedStateFromProps,typeof y=="function"&&(rf(n,a,y,o),f.state=n.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof f.getSnapshotBeforeUpdate=="function"||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(y=f.state,typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount(),y!==f.state&&of.enqueueReplaceState(f,f.state,null),Ro(n,o,f,u),Ao(),f.state=n.memoizedState),typeof f.componentDidMount=="function"&&(n.flags|=4194308),o=!0}else if(t===null){f=n.stateNode;var A=n.memoizedProps,I=Ds(a,A);f.props=I;var te=f.context,de=a.contextType;y=ir,typeof de=="object"&&de!==null&&(y=Dn(de));var ve=a.getDerivedStateFromProps;de=typeof ve=="function"||typeof f.getSnapshotBeforeUpdate=="function",A=n.pendingProps!==A,de||typeof f.UNSAFE_componentWillReceiveProps!="function"&&typeof f.componentWillReceiveProps!="function"||(A||te!==y)&&Rm(n,f,o,y),Pa=!1;var ie=n.memoizedState;f.state=ie,Ro(n,o,f,u),Ao(),te=n.memoizedState,A||ie!==te||Pa?(typeof ve=="function"&&(rf(n,a,ve,o),te=n.memoizedState),(I=Pa||Am(n,a,I,o,ie,te,y))?(de||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount()),typeof f.componentDidMount=="function"&&(n.flags|=4194308)):(typeof f.componentDidMount=="function"&&(n.flags|=4194308),n.memoizedProps=o,n.memoizedState=te),f.props=o,f.state=te,f.context=y,o=I):(typeof f.componentDidMount=="function"&&(n.flags|=4194308),o=!1)}else{f=n.stateNode,Bu(t,n),y=n.memoizedProps,de=Ds(a,y),f.props=de,ve=n.pendingProps,ie=f.context,te=a.contextType,I=ir,typeof te=="object"&&te!==null&&(I=Dn(te)),A=a.getDerivedStateFromProps,(te=typeof A=="function"||typeof f.getSnapshotBeforeUpdate=="function")||typeof f.UNSAFE_componentWillReceiveProps!="function"&&typeof f.componentWillReceiveProps!="function"||(y!==ve||ie!==I)&&Rm(n,f,o,I),Pa=!1,ie=n.memoizedState,f.state=ie,Ro(n,o,f,u),Ao();var ce=n.memoizedState;y!==ve||ie!==ce||Pa||t!==null&&t.dependencies!==null&&Rl(t.dependencies)?(typeof A=="function"&&(rf(n,a,A,o),ce=n.memoizedState),(de=Pa||Am(n,a,de,o,ie,ce,I)||t!==null&&t.dependencies!==null&&Rl(t.dependencies))?(te||typeof f.UNSAFE_componentWillUpdate!="function"&&typeof f.componentWillUpdate!="function"||(typeof f.componentWillUpdate=="function"&&f.componentWillUpdate(o,ce,I),typeof f.UNSAFE_componentWillUpdate=="function"&&f.UNSAFE_componentWillUpdate(o,ce,I)),typeof f.componentDidUpdate=="function"&&(n.flags|=4),typeof f.getSnapshotBeforeUpdate=="function"&&(n.flags|=1024)):(typeof f.componentDidUpdate!="function"||y===t.memoizedProps&&ie===t.memoizedState||(n.flags|=4),typeof f.getSnapshotBeforeUpdate!="function"||y===t.memoizedProps&&ie===t.memoizedState||(n.flags|=1024),n.memoizedProps=o,n.memoizedState=ce),f.props=o,f.state=ce,f.context=I,o=de):(typeof f.componentDidUpdate!="function"||y===t.memoizedProps&&ie===t.memoizedState||(n.flags|=4),typeof f.getSnapshotBeforeUpdate!="function"||y===t.memoizedProps&&ie===t.memoizedState||(n.flags|=1024),o=!1)}return f=o,Wl(t,n),o=(n.flags&128)!==0,f||o?(f=n.stateNode,a=o&&typeof a.getDerivedStateFromError!="function"?null:f.render(),n.flags|=1,t!==null&&o?(n.child=ws(n,t.child,null,u),n.child=ws(n,null,a,u)):Un(t,n,a,u),n.memoizedState=f.state,t=n.child):t=la(t,n,u),t}function Vm(t,n,a,o){return Es(),n.flags|=256,Un(t,n,a,o),n.child}var ff={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function df(t){return{baseLanes:t,cachePool:Dp()}}function hf(t,n,a){return t=t!==null?t.childLanes&~a:0,n&&(t|=si),t}function jm(t,n,a){var o=n.pendingProps,u=!1,f=(n.flags&128)!==0,y;if((y=f)||(y=t!==null&&t.memoizedState===null?!1:(dn.current&2)!==0),y&&(u=!0,n.flags&=-129),y=(n.flags&32)!==0,n.flags&=-33,t===null){if(Ct){if(u?Ia(n):Fa(),(t=$t)?(t=Qg(t,vi),t=t!==null&&t.data!=="&"?t:null,t!==null&&(n.memoizedState={dehydrated:t,treeContext:Da!==null?{id:Gi,overflow:Vi}:null,retryLane:536870912,hydrationErrors:null},a=Mp(t),a.return=n,n.child=a,Nn=n,$t=null)):t=null,t===null)throw La(n);return Zf(t)?n.lanes=32:n.lanes=536870912,null}var A=o.children;return o=o.fallback,u?(Fa(),u=n.mode,A=ql({mode:"hidden",children:A},u),o=Ms(o,u,a,null),A.return=n,o.return=n,A.sibling=o,n.child=A,o=n.child,o.memoizedState=df(a),o.childLanes=hf(t,y,a),n.memoizedState=ff,Uo(null,o)):(Ia(n),pf(n,A))}var I=t.memoizedState;if(I!==null&&(A=I.dehydrated,A!==null)){if(f)n.flags&256?(Ia(n),n.flags&=-257,n=mf(t,n,a)):n.memoizedState!==null?(Fa(),n.child=t.child,n.flags|=128,n=null):(Fa(),A=o.fallback,u=n.mode,o=ql({mode:"visible",children:o.children},u),A=Ms(A,u,a,null),A.flags|=2,o.return=n,A.return=n,o.sibling=A,n.child=o,ws(n,t.child,null,a),o=n.child,o.memoizedState=df(a),o.childLanes=hf(t,y,a),n.memoizedState=ff,n=Uo(null,o));else if(Ia(n),Zf(A)){if(y=A.nextSibling&&A.nextSibling.dataset,y)var te=y.dgst;y=te,o=Error(s(419)),o.stack="",o.digest=y,yo({value:o,source:null,stack:null}),n=mf(t,n,a)}else if(vn||or(t,n,a,!1),y=(a&t.childLanes)!==0,vn||y){if(y=Qt,y!==null&&(o=ui(y,a),o!==0&&o!==I.retryLane))throw I.retryLane=o,Ss(t,o),Zn(y,t,o),cf;Yf(A)||nc(),n=mf(t,n,a)}else Yf(A)?(n.flags|=192,n.child=t.child,n=null):(t=I.treeContext,$t=xi(A.nextSibling),Nn=n,Ct=!0,Ua=null,vi=!1,t!==null&&Tp(n,t),n=pf(n,o.children),n.flags|=4096);return n}return u?(Fa(),A=o.fallback,u=n.mode,I=t.child,te=I.sibling,o=na(I,{mode:"hidden",children:o.children}),o.subtreeFlags=I.subtreeFlags&65011712,te!==null?A=na(te,A):(A=Ms(A,u,a,null),A.flags|=2),A.return=n,o.return=n,o.sibling=A,n.child=o,Uo(null,o),o=n.child,A=t.child.memoizedState,A===null?A=df(a):(u=A.cachePool,u!==null?(I=mn._currentValue,u=u.parent!==I?{parent:I,pool:I}:u):u=Dp(),A={baseLanes:A.baseLanes|a,cachePool:u}),o.memoizedState=A,o.childLanes=hf(t,y,a),n.memoizedState=ff,Uo(t.child,o)):(Ia(n),a=t.child,t=a.sibling,a=na(a,{mode:"visible",children:o.children}),a.return=n,a.sibling=null,t!==null&&(y=n.deletions,y===null?(n.deletions=[t],n.flags|=16):y.push(t)),n.child=a,n.memoizedState=null,a)}function pf(t,n){return n=ql({mode:"visible",children:n},t.mode),n.return=t,t.child=n}function ql(t,n){return t=ti(22,t,null,n),t.lanes=0,t}function mf(t,n,a){return ws(n,t.child,null,a),t=pf(n,n.pendingProps.children),t.flags|=2,n.memoizedState=null,t}function km(t,n,a){t.lanes|=n;var o=t.alternate;o!==null&&(o.lanes|=n),wu(t.return,n,a)}function gf(t,n,a,o,u,f){var y=t.memoizedState;y===null?t.memoizedState={isBackwards:n,rendering:null,renderingStartTime:0,last:o,tail:a,tailMode:u,treeForkCount:f}:(y.isBackwards=n,y.rendering=null,y.renderingStartTime=0,y.last=o,y.tail=a,y.tailMode=u,y.treeForkCount=f)}function Xm(t,n,a){var o=n.pendingProps,u=o.revealOrder,f=o.tail;o=o.children;var y=dn.current,A=(y&2)!==0;if(A?(y=y&1|2,n.flags|=128):y&=1,Me(dn,y),Un(t,n,o,a),o=Ct?xo:0,!A&&t!==null&&(t.flags&128)!==0)e:for(t=n.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&km(t,a,n);else if(t.tag===19)km(t,a,n);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===n)break e;for(;t.sibling===null;){if(t.return===null||t.return===n)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(u){case"forwards":for(a=n.child,u=null;a!==null;)t=a.alternate,t!==null&&Pl(t)===null&&(u=a),a=a.sibling;a=u,a===null?(u=n.child,n.child=null):(u=a.sibling,a.sibling=null),gf(n,!1,u,a,f,o);break;case"backwards":case"unstable_legacy-backwards":for(a=null,u=n.child,n.child=null;u!==null;){if(t=u.alternate,t!==null&&Pl(t)===null){n.child=u;break}t=u.sibling,u.sibling=a,a=u,u=t}gf(n,!0,a,null,f,o);break;case"together":gf(n,!1,null,null,void 0,o);break;default:n.memoizedState=null}return n.child}function la(t,n,a){if(t!==null&&(n.dependencies=t.dependencies),Va|=n.lanes,(a&n.childLanes)===0)if(t!==null){if(or(t,n,a,!1),(a&n.childLanes)===0)return null}else return null;if(t!==null&&n.child!==t.child)throw Error(s(153));if(n.child!==null){for(t=n.child,a=na(t,t.pendingProps),n.child=a,a.return=n;t.sibling!==null;)t=t.sibling,a=a.sibling=na(t,t.pendingProps),a.return=n;a.sibling=null}return n.child}function vf(t,n){return(t.lanes&n)!==0?!0:(t=t.dependencies,!!(t!==null&&Rl(t)))}function Rx(t,n,a){switch(n.tag){case 3:ze(n,n.stateNode.containerInfo),Oa(n,mn,t.memoizedState.cache),Es();break;case 27:case 5:$e(n);break;case 4:ze(n,n.stateNode.containerInfo);break;case 10:Oa(n,n.type,n.memoizedProps.value);break;case 31:if(n.memoizedState!==null)return n.flags|=128,Gu(n),null;break;case 13:var o=n.memoizedState;if(o!==null)return o.dehydrated!==null?(Ia(n),n.flags|=128,null):(a&n.child.childLanes)!==0?jm(t,n,a):(Ia(n),t=la(t,n,a),t!==null?t.sibling:null);Ia(n);break;case 19:var u=(t.flags&128)!==0;if(o=(a&n.childLanes)!==0,o||(or(t,n,a,!1),o=(a&n.childLanes)!==0),u){if(o)return Xm(t,n,a);n.flags|=128}if(u=n.memoizedState,u!==null&&(u.rendering=null,u.tail=null,u.lastEffect=null),Me(dn,dn.current),o)break;return null;case 22:return n.lanes=0,zm(t,n,a,n.pendingProps);case 24:Oa(n,mn,t.memoizedState.cache)}return la(t,n,a)}function Wm(t,n,a){if(t!==null)if(t.memoizedProps!==n.pendingProps)vn=!0;else{if(!vf(t,a)&&(n.flags&128)===0)return vn=!1,Rx(t,n,a);vn=(t.flags&131072)!==0}else vn=!1,Ct&&(n.flags&1048576)!==0&&bp(n,xo,n.index);switch(n.lanes=0,n.tag){case 16:e:{var o=n.pendingProps;if(t=Rs(n.elementType),n.type=t,typeof t=="function")Su(t)?(o=Ds(t,o),n.tag=1,n=Gm(null,n,t,o,a)):(n.tag=0,n=uf(null,n,t,o,a));else{if(t!=null){var u=t.$$typeof;if(u===N){n.tag=11,n=Om(null,n,t,o,a);break e}else if(u===z){n.tag=14,n=Pm(null,n,t,o,a);break e}}throw n=le(t)||t,Error(s(306,n,""))}}return n;case 0:return uf(t,n,n.type,n.pendingProps,a);case 1:return o=n.type,u=Ds(o,n.pendingProps),Gm(t,n,o,u,a);case 3:e:{if(ze(n,n.stateNode.containerInfo),t===null)throw Error(s(387));o=n.pendingProps;var f=n.memoizedState;u=f.element,Bu(t,n),Ro(n,o,null,a);var y=n.memoizedState;if(o=y.cache,Oa(n,mn,o),o!==f.cache&&Nu(n,[mn],a,!0),Ao(),o=y.element,f.isDehydrated)if(f={element:o,isDehydrated:!1,cache:y.cache},n.updateQueue.baseState=f,n.memoizedState=f,n.flags&256){n=Vm(t,n,o,a);break e}else if(o!==u){u=pi(Error(s(424)),n),yo(u),n=Vm(t,n,o,a);break e}else for(t=n.stateNode.containerInfo,t.nodeType===9?t=t.body:t=t.nodeName==="HTML"?t.ownerDocument.body:t,$t=xi(t.firstChild),Nn=n,Ct=!0,Ua=null,vi=!0,a=zp(n,null,o,a),n.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(Es(),o===u){n=la(t,n,a);break e}Un(t,n,o,a)}n=n.child}return n;case 26:return Wl(t,n),t===null?(a=iv(n.type,null,n.pendingProps,null))?n.memoizedState=a:Ct||(a=n.type,t=n.pendingProps,o=cc(Re.current).createElement(a),o[tn]=n,o[Sn]=t,Ln(o,a,t),X(o),n.stateNode=o):n.memoizedState=iv(n.type,t.memoizedProps,n.pendingProps,t.memoizedState),null;case 27:return $e(n),t===null&&Ct&&(o=n.stateNode=ev(n.type,n.pendingProps,Re.current),Nn=n,vi=!0,u=$t,qa(n.type)?(Kf=u,$t=xi(o.firstChild)):$t=u),Un(t,n,n.pendingProps.children,a),Wl(t,n),t===null&&(n.flags|=4194304),n.child;case 5:return t===null&&Ct&&((u=o=$t)&&(o=iy(o,n.type,n.pendingProps,vi),o!==null?(n.stateNode=o,Nn=n,$t=xi(o.firstChild),vi=!1,u=!0):u=!1),u||La(n)),$e(n),u=n.type,f=n.pendingProps,y=t!==null?t.memoizedProps:null,o=f.children,Xf(u,f)?o=null:y!==null&&Xf(u,y)&&(n.flags|=32),n.memoizedState!==null&&(u=ju(t,n,_x,null,null,a),qo._currentValue=u),Wl(t,n),Un(t,n,o,a),n.child;case 6:return t===null&&Ct&&((t=a=$t)&&(a=ay(a,n.pendingProps,vi),a!==null?(n.stateNode=a,Nn=n,$t=null,t=!0):t=!1),t||La(n)),null;case 13:return jm(t,n,a);case 4:return ze(n,n.stateNode.containerInfo),o=n.pendingProps,t===null?n.child=ws(n,null,o,a):Un(t,n,o,a),n.child;case 11:return Om(t,n,n.type,n.pendingProps,a);case 7:return Un(t,n,n.pendingProps,a),n.child;case 8:return Un(t,n,n.pendingProps.children,a),n.child;case 12:return Un(t,n,n.pendingProps.children,a),n.child;case 10:return o=n.pendingProps,Oa(n,n.type,o.value),Un(t,n,o.children,a),n.child;case 9:return u=n.type._context,o=n.pendingProps.children,Ts(n),u=Dn(u),o=o(u),n.flags|=1,Un(t,n,o,a),n.child;case 14:return Pm(t,n,n.type,n.pendingProps,a);case 15:return Bm(t,n,n.type,n.pendingProps,a);case 19:return Xm(t,n,a);case 31:return Ax(t,n,a);case 22:return zm(t,n,a,n.pendingProps);case 24:return Ts(n),o=Dn(mn),t===null?(u=Lu(),u===null&&(u=Qt,f=Du(),u.pooledCache=f,f.refCount++,f!==null&&(u.pooledCacheLanes|=a),u=f),n.memoizedState={parent:o,cache:u},Pu(n),Oa(n,mn,u)):((t.lanes&a)!==0&&(Bu(t,n),Ro(n,null,null,a),Ao()),u=t.memoizedState,f=n.memoizedState,u.parent!==o?(u={parent:o,cache:o},n.memoizedState=u,n.lanes===0&&(n.memoizedState=n.updateQueue.baseState=u),Oa(n,mn,o)):(o=f.cache,Oa(n,mn,o),o!==u.cache&&Nu(n,[mn],a,!0))),Un(t,n,n.pendingProps.children,a),n.child;case 29:throw n.pendingProps}throw Error(s(156,n.tag))}function ca(t){t.flags|=4}function _f(t,n,a,o,u){if((n=(t.mode&32)!==0)&&(n=!1),n){if(t.flags|=16777216,(u&335544128)===u)if(t.stateNode.complete)t.flags|=8192;else if(xg())t.flags|=8192;else throw Cs=Dl,Ou}else t.flags&=-16777217}function qm(t,n){if(n.type!=="stylesheet"||(n.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!lv(n))if(xg())t.flags|=8192;else throw Cs=Dl,Ou}function Yl(t,n){n!==null&&(t.flags|=4),t.flags&16384&&(n=t.tag!==22?Ht():536870912,t.lanes|=n,xr|=n)}function Lo(t,n){if(!Ct)switch(t.tailMode){case"hidden":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?t.tail=null:a.sibling=null;break;case"collapsed":a=t.tail;for(var o=null;a!==null;)a.alternate!==null&&(o=a),a=a.sibling;o===null?n||t.tail===null?t.tail=null:t.tail.sibling=null:o.sibling=null}}function en(t){var n=t.alternate!==null&&t.alternate.child===t.child,a=0,o=0;if(n)for(var u=t.child;u!==null;)a|=u.lanes|u.childLanes,o|=u.subtreeFlags&65011712,o|=u.flags&65011712,u.return=t,u=u.sibling;else for(u=t.child;u!==null;)a|=u.lanes|u.childLanes,o|=u.subtreeFlags,o|=u.flags,u.return=t,u=u.sibling;return t.subtreeFlags|=o,t.childLanes=a,n}function Cx(t,n,a){var o=n.pendingProps;switch(Tu(n),n.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return en(n),null;case 1:return en(n),null;case 3:return a=n.stateNode,o=null,t!==null&&(o=t.memoizedState.cache),n.memoizedState.cache!==o&&(n.flags|=2048),sa(mn),Je(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(t===null||t.child===null)&&(rr(n)?ca(n):t===null||t.memoizedState.isDehydrated&&(n.flags&256)===0||(n.flags|=1024,Ru())),en(n),null;case 26:var u=n.type,f=n.memoizedState;return t===null?(ca(n),f!==null?(en(n),qm(n,f)):(en(n),_f(n,u,null,o,a))):f?f!==t.memoizedState?(ca(n),en(n),qm(n,f)):(en(n),n.flags&=-16777217):(t=t.memoizedProps,t!==o&&ca(n),en(n),_f(n,u,t,o,a)),null;case 27:if(zt(n),a=Re.current,u=n.type,t!==null&&n.stateNode!=null)t.memoizedProps!==o&&ca(n);else{if(!o){if(n.stateNode===null)throw Error(s(166));return en(n),null}t=K.current,rr(n)?Ap(n):(t=ev(u,o,a),n.stateNode=t,ca(n))}return en(n),null;case 5:if(zt(n),u=n.type,t!==null&&n.stateNode!=null)t.memoizedProps!==o&&ca(n);else{if(!o){if(n.stateNode===null)throw Error(s(166));return en(n),null}if(f=K.current,rr(n))Ap(n);else{var y=cc(Re.current);switch(f){case 1:f=y.createElementNS("http://www.w3.org/2000/svg",u);break;case 2:f=y.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;default:switch(u){case"svg":f=y.createElementNS("http://www.w3.org/2000/svg",u);break;case"math":f=y.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;case"script":f=y.createElement("div"),f.innerHTML="<script><\/script>",f=f.removeChild(f.firstChild);break;case"select":f=typeof o.is=="string"?y.createElement("select",{is:o.is}):y.createElement("select"),o.multiple?f.multiple=!0:o.size&&(f.size=o.size);break;default:f=typeof o.is=="string"?y.createElement(u,{is:o.is}):y.createElement(u)}}f[tn]=n,f[Sn]=o;e:for(y=n.child;y!==null;){if(y.tag===5||y.tag===6)f.appendChild(y.stateNode);else if(y.tag!==4&&y.tag!==27&&y.child!==null){y.child.return=y,y=y.child;continue}if(y===n)break e;for(;y.sibling===null;){if(y.return===null||y.return===n)break e;y=y.return}y.sibling.return=y.return,y=y.sibling}n.stateNode=f;e:switch(Ln(f,u,o),u){case"button":case"input":case"select":case"textarea":o=!!o.autoFocus;break e;case"img":o=!0;break e;default:o=!1}o&&ca(n)}}return en(n),_f(n,n.type,t===null?null:t.memoizedProps,n.pendingProps,a),null;case 6:if(t&&n.stateNode!=null)t.memoizedProps!==o&&ca(n);else{if(typeof o!="string"&&n.stateNode===null)throw Error(s(166));if(t=Re.current,rr(n)){if(t=n.stateNode,a=n.memoizedProps,o=null,u=Nn,u!==null)switch(u.tag){case 27:case 5:o=u.memoizedProps}t[tn]=n,t=!!(t.nodeValue===a||o!==null&&o.suppressHydrationWarning===!0||jg(t.nodeValue,a)),t||La(n,!0)}else t=cc(t).createTextNode(o),t[tn]=n,n.stateNode=t}return en(n),null;case 31:if(a=n.memoizedState,t===null||t.memoizedState!==null){if(o=rr(n),a!==null){if(t===null){if(!o)throw Error(s(318));if(t=n.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(s(557));t[tn]=n}else Es(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;en(n),t=!1}else a=Ru(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=a),t=!0;if(!t)return n.flags&256?(ii(n),n):(ii(n),null);if((n.flags&128)!==0)throw Error(s(558))}return en(n),null;case 13:if(o=n.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(u=rr(n),o!==null&&o.dehydrated!==null){if(t===null){if(!u)throw Error(s(318));if(u=n.memoizedState,u=u!==null?u.dehydrated:null,!u)throw Error(s(317));u[tn]=n}else Es(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;en(n),u=!1}else u=Ru(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=u),u=!0;if(!u)return n.flags&256?(ii(n),n):(ii(n),null)}return ii(n),(n.flags&128)!==0?(n.lanes=a,n):(a=o!==null,t=t!==null&&t.memoizedState!==null,a&&(o=n.child,u=null,o.alternate!==null&&o.alternate.memoizedState!==null&&o.alternate.memoizedState.cachePool!==null&&(u=o.alternate.memoizedState.cachePool.pool),f=null,o.memoizedState!==null&&o.memoizedState.cachePool!==null&&(f=o.memoizedState.cachePool.pool),f!==u&&(o.flags|=2048)),a!==t&&a&&(n.child.flags|=8192),Yl(n,n.updateQueue),en(n),null);case 4:return Je(),t===null&&Hf(n.stateNode.containerInfo),en(n),null;case 10:return sa(n.type),en(n),null;case 19:if(se(dn),o=n.memoizedState,o===null)return en(n),null;if(u=(n.flags&128)!==0,f=o.rendering,f===null)if(u)Lo(o,!1);else{if(ln!==0||t!==null&&(t.flags&128)!==0)for(t=n.child;t!==null;){if(f=Pl(t),f!==null){for(n.flags|=128,Lo(o,!1),t=f.updateQueue,n.updateQueue=t,Yl(n,t),n.subtreeFlags=0,t=a,a=n.child;a!==null;)Sp(a,t),a=a.sibling;return Me(dn,dn.current&1|2),Ct&&ia(n,o.treeForkCount),n.child}t=t.sibling}o.tail!==null&&b()>$l&&(n.flags|=128,u=!0,Lo(o,!1),n.lanes=4194304)}else{if(!u)if(t=Pl(f),t!==null){if(n.flags|=128,u=!0,t=t.updateQueue,n.updateQueue=t,Yl(n,t),Lo(o,!0),o.tail===null&&o.tailMode==="hidden"&&!f.alternate&&!Ct)return en(n),null}else 2*b()-o.renderingStartTime>$l&&a!==536870912&&(n.flags|=128,u=!0,Lo(o,!1),n.lanes=4194304);o.isBackwards?(f.sibling=n.child,n.child=f):(t=o.last,t!==null?t.sibling=f:n.child=f,o.last=f)}return o.tail!==null?(t=o.tail,o.rendering=t,o.tail=t.sibling,o.renderingStartTime=b(),t.sibling=null,a=dn.current,Me(dn,u?a&1|2:a&1),Ct&&ia(n,o.treeForkCount),t):(en(n),null);case 22:case 23:return ii(n),Hu(),o=n.memoizedState!==null,t!==null?t.memoizedState!==null!==o&&(n.flags|=8192):o&&(n.flags|=8192),o?(a&536870912)!==0&&(n.flags&128)===0&&(en(n),n.subtreeFlags&6&&(n.flags|=8192)):en(n),a=n.updateQueue,a!==null&&Yl(n,a.retryQueue),a=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),o=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(o=n.memoizedState.cachePool.pool),o!==a&&(n.flags|=2048),t!==null&&se(As),null;case 24:return a=null,t!==null&&(a=t.memoizedState.cache),n.memoizedState.cache!==a&&(n.flags|=2048),sa(mn),en(n),null;case 25:return null;case 30:return null}throw Error(s(156,n.tag))}function wx(t,n){switch(Tu(n),n.tag){case 1:return t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 3:return sa(mn),Je(),t=n.flags,(t&65536)!==0&&(t&128)===0?(n.flags=t&-65537|128,n):null;case 26:case 27:case 5:return zt(n),null;case 31:if(n.memoizedState!==null){if(ii(n),n.alternate===null)throw Error(s(340));Es()}return t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 13:if(ii(n),t=n.memoizedState,t!==null&&t.dehydrated!==null){if(n.alternate===null)throw Error(s(340));Es()}return t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 19:return se(dn),null;case 4:return Je(),null;case 10:return sa(n.type),null;case 22:case 23:return ii(n),Hu(),t!==null&&se(As),t=n.flags,t&65536?(n.flags=t&-65537|128,n):null;case 24:return sa(mn),null;case 25:return null;default:return null}}function Ym(t,n){switch(Tu(n),n.tag){case 3:sa(mn),Je();break;case 26:case 27:case 5:zt(n);break;case 4:Je();break;case 31:n.memoizedState!==null&&ii(n);break;case 13:ii(n);break;case 19:se(dn);break;case 10:sa(n.type);break;case 22:case 23:ii(n),Hu(),t!==null&&se(As);break;case 24:sa(mn)}}function Oo(t,n){try{var a=n.updateQueue,o=a!==null?a.lastEffect:null;if(o!==null){var u=o.next;a=u;do{if((a.tag&t)===t){o=void 0;var f=a.create,y=a.inst;o=f(),y.destroy=o}a=a.next}while(a!==u)}}catch(A){kt(n,n.return,A)}}function Ha(t,n,a){try{var o=n.updateQueue,u=o!==null?o.lastEffect:null;if(u!==null){var f=u.next;o=f;do{if((o.tag&t)===t){var y=o.inst,A=y.destroy;if(A!==void 0){y.destroy=void 0,u=n;var I=a,te=A;try{te()}catch(de){kt(u,I,de)}}}o=o.next}while(o!==f)}}catch(de){kt(n,n.return,de)}}function Zm(t){var n=t.updateQueue;if(n!==null){var a=t.stateNode;try{Fp(n,a)}catch(o){kt(t,t.return,o)}}}function Km(t,n,a){a.props=Ds(t.type,t.memoizedProps),a.state=t.memoizedState;try{a.componentWillUnmount()}catch(o){kt(t,n,o)}}function Po(t,n){try{var a=t.ref;if(a!==null){switch(t.tag){case 26:case 27:case 5:var o=t.stateNode;break;case 30:o=t.stateNode;break;default:o=t.stateNode}typeof a=="function"?t.refCleanup=a(o):a.current=o}}catch(u){kt(t,n,u)}}function ji(t,n){var a=t.ref,o=t.refCleanup;if(a!==null)if(typeof o=="function")try{o()}catch(u){kt(t,n,u)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(u){kt(t,n,u)}else a.current=null}function Qm(t){var n=t.type,a=t.memoizedProps,o=t.stateNode;try{e:switch(n){case"button":case"input":case"select":case"textarea":a.autoFocus&&o.focus();break e;case"img":a.src?o.src=a.src:a.srcSet&&(o.srcset=a.srcSet)}}catch(u){kt(t,t.return,u)}}function xf(t,n,a){try{var o=t.stateNode;Qx(o,t.type,a,n),o[Sn]=n}catch(u){kt(t,t.return,u)}}function Jm(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&qa(t.type)||t.tag===4}function yf(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Jm(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&qa(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Sf(t,n,a){var o=t.tag;if(o===5||o===6)t=t.stateNode,n?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(t,n):(n=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,n.appendChild(t),a=a._reactRootContainer,a!=null||n.onclick!==null||(n.onclick=di));else if(o!==4&&(o===27&&qa(t.type)&&(a=t.stateNode,n=null),t=t.child,t!==null))for(Sf(t,n,a),t=t.sibling;t!==null;)Sf(t,n,a),t=t.sibling}function Zl(t,n,a){var o=t.tag;if(o===5||o===6)t=t.stateNode,n?a.insertBefore(t,n):a.appendChild(t);else if(o!==4&&(o===27&&qa(t.type)&&(a=t.stateNode),t=t.child,t!==null))for(Zl(t,n,a),t=t.sibling;t!==null;)Zl(t,n,a),t=t.sibling}function $m(t){var n=t.stateNode,a=t.memoizedProps;try{for(var o=t.type,u=n.attributes;u.length;)n.removeAttributeNode(u[0]);Ln(n,o,a),n[tn]=t,n[Sn]=a}catch(f){kt(t,t.return,f)}}var ua=!1,_n=!1,Mf=!1,eg=typeof WeakSet=="function"?WeakSet:Set,An=null;function Nx(t,n){if(t=t.containerInfo,jf=gc,t=dp(t),pu(t)){if("selectionStart"in t)var a={start:t.selectionStart,end:t.selectionEnd};else e:{a=(a=t.ownerDocument)&&a.defaultView||window;var o=a.getSelection&&a.getSelection();if(o&&o.rangeCount!==0){a=o.anchorNode;var u=o.anchorOffset,f=o.focusNode;o=o.focusOffset;try{a.nodeType,f.nodeType}catch{a=null;break e}var y=0,A=-1,I=-1,te=0,de=0,ve=t,ie=null;t:for(;;){for(var ce;ve!==a||u!==0&&ve.nodeType!==3||(A=y+u),ve!==f||o!==0&&ve.nodeType!==3||(I=y+o),ve.nodeType===3&&(y+=ve.nodeValue.length),(ce=ve.firstChild)!==null;)ie=ve,ve=ce;for(;;){if(ve===t)break t;if(ie===a&&++te===u&&(A=y),ie===f&&++de===o&&(I=y),(ce=ve.nextSibling)!==null)break;ve=ie,ie=ve.parentNode}ve=ce}a=A===-1||I===-1?null:{start:A,end:I}}else a=null}a=a||{start:0,end:0}}else a=null;for(kf={focusedElem:t,selectionRange:a},gc=!1,An=n;An!==null;)if(n=An,t=n.child,(n.subtreeFlags&1028)!==0&&t!==null)t.return=n,An=t;else for(;An!==null;){switch(n=An,f=n.alternate,t=n.flags,n.tag){case 0:if((t&4)!==0&&(t=n.updateQueue,t=t!==null?t.events:null,t!==null))for(a=0;a<t.length;a++)u=t[a],u.ref.impl=u.nextImpl;break;case 11:case 15:break;case 1:if((t&1024)!==0&&f!==null){t=void 0,a=n,u=f.memoizedProps,f=f.memoizedState,o=a.stateNode;try{var Ve=Ds(a.type,u);t=o.getSnapshotBeforeUpdate(Ve,f),o.__reactInternalSnapshotBeforeUpdate=t}catch(nt){kt(a,a.return,nt)}}break;case 3:if((t&1024)!==0){if(t=n.stateNode.containerInfo,a=t.nodeType,a===9)qf(t);else if(a===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":qf(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((t&1024)!==0)throw Error(s(163))}if(t=n.sibling,t!==null){t.return=n.return,An=t;break}An=n.return}}function tg(t,n,a){var o=a.flags;switch(a.tag){case 0:case 11:case 15:da(t,a),o&4&&Oo(5,a);break;case 1:if(da(t,a),o&4)if(t=a.stateNode,n===null)try{t.componentDidMount()}catch(y){kt(a,a.return,y)}else{var u=Ds(a.type,n.memoizedProps);n=n.memoizedState;try{t.componentDidUpdate(u,n,t.__reactInternalSnapshotBeforeUpdate)}catch(y){kt(a,a.return,y)}}o&64&&Zm(a),o&512&&Po(a,a.return);break;case 3:if(da(t,a),o&64&&(t=a.updateQueue,t!==null)){if(n=null,a.child!==null)switch(a.child.tag){case 27:case 5:n=a.child.stateNode;break;case 1:n=a.child.stateNode}try{Fp(t,n)}catch(y){kt(a,a.return,y)}}break;case 27:n===null&&o&4&&$m(a);case 26:case 5:da(t,a),n===null&&o&4&&Qm(a),o&512&&Po(a,a.return);break;case 12:da(t,a);break;case 31:da(t,a),o&4&&ag(t,a);break;case 13:da(t,a),o&4&&sg(t,a),o&64&&(t=a.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(a=Fx.bind(null,a),sy(t,a))));break;case 22:if(o=a.memoizedState!==null||ua,!o){n=n!==null&&n.memoizedState!==null||_n,u=ua;var f=_n;ua=o,(_n=n)&&!f?ha(t,a,(a.subtreeFlags&8772)!==0):da(t,a),ua=u,_n=f}break;case 30:break;default:da(t,a)}}function ng(t){var n=t.alternate;n!==null&&(t.alternate=null,ng(n)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(n=t.stateNode,n!==null&&ds(n)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var nn=null,Xn=!1;function fa(t,n,a){for(a=a.child;a!==null;)ig(t,n,a),a=a.sibling}function ig(t,n,a){if(Ne&&typeof Ne.onCommitFiberUnmount=="function")try{Ne.onCommitFiberUnmount(Se,a)}catch{}switch(a.tag){case 26:_n||ji(a,n),fa(t,n,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:_n||ji(a,n);var o=nn,u=Xn;qa(a.type)&&(nn=a.stateNode,Xn=!1),fa(t,n,a),ko(a.stateNode),nn=o,Xn=u;break;case 5:_n||ji(a,n);case 6:if(o=nn,u=Xn,nn=null,fa(t,n,a),nn=o,Xn=u,nn!==null)if(Xn)try{(nn.nodeType===9?nn.body:nn.nodeName==="HTML"?nn.ownerDocument.body:nn).removeChild(a.stateNode)}catch(f){kt(a,n,f)}else try{nn.removeChild(a.stateNode)}catch(f){kt(a,n,f)}break;case 18:nn!==null&&(Xn?(t=nn,Zg(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,a.stateNode),Rr(t)):Zg(nn,a.stateNode));break;case 4:o=nn,u=Xn,nn=a.stateNode.containerInfo,Xn=!0,fa(t,n,a),nn=o,Xn=u;break;case 0:case 11:case 14:case 15:Ha(2,a,n),_n||Ha(4,a,n),fa(t,n,a);break;case 1:_n||(ji(a,n),o=a.stateNode,typeof o.componentWillUnmount=="function"&&Km(a,n,o)),fa(t,n,a);break;case 21:fa(t,n,a);break;case 22:_n=(o=_n)||a.memoizedState!==null,fa(t,n,a),_n=o;break;default:fa(t,n,a)}}function ag(t,n){if(n.memoizedState===null&&(t=n.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{Rr(t)}catch(a){kt(n,n.return,a)}}}function sg(t,n){if(n.memoizedState===null&&(t=n.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{Rr(t)}catch(a){kt(n,n.return,a)}}function Dx(t){switch(t.tag){case 31:case 13:case 19:var n=t.stateNode;return n===null&&(n=t.stateNode=new eg),n;case 22:return t=t.stateNode,n=t._retryCache,n===null&&(n=t._retryCache=new eg),n;default:throw Error(s(435,t.tag))}}function Kl(t,n){var a=Dx(t);n.forEach(function(o){if(!a.has(o)){a.add(o);var u=Hx.bind(null,t,o);o.then(u,u)}})}function Wn(t,n){var a=n.deletions;if(a!==null)for(var o=0;o<a.length;o++){var u=a[o],f=t,y=n,A=y;e:for(;A!==null;){switch(A.tag){case 27:if(qa(A.type)){nn=A.stateNode,Xn=!1;break e}break;case 5:nn=A.stateNode,Xn=!1;break e;case 3:case 4:nn=A.stateNode.containerInfo,Xn=!0;break e}A=A.return}if(nn===null)throw Error(s(160));ig(f,y,u),nn=null,Xn=!1,f=u.alternate,f!==null&&(f.return=null),u.return=null}if(n.subtreeFlags&13886)for(n=n.child;n!==null;)rg(n,t),n=n.sibling}var Ci=null;function rg(t,n){var a=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:Wn(n,t),qn(t),o&4&&(Ha(3,t,t.return),Oo(3,t),Ha(5,t,t.return));break;case 1:Wn(n,t),qn(t),o&512&&(_n||a===null||ji(a,a.return)),o&64&&ua&&(t=t.updateQueue,t!==null&&(o=t.callbacks,o!==null&&(a=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=a===null?o:a.concat(o))));break;case 26:var u=Ci;if(Wn(n,t),qn(t),o&512&&(_n||a===null||ji(a,a.return)),o&4){var f=a!==null?a.memoizedState:null;if(o=t.memoizedState,a===null)if(o===null)if(t.stateNode===null){e:{o=t.type,a=t.memoizedProps,u=u.ownerDocument||u;t:switch(o){case"title":f=u.getElementsByTagName("title")[0],(!f||f[Fi]||f[tn]||f.namespaceURI==="http://www.w3.org/2000/svg"||f.hasAttribute("itemprop"))&&(f=u.createElement(o),u.head.insertBefore(f,u.querySelector("head > title"))),Ln(f,o,a),f[tn]=t,X(f),o=f;break e;case"link":var y=rv("link","href",u).get(o+(a.href||""));if(y){for(var A=0;A<y.length;A++)if(f=y[A],f.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&f.getAttribute("rel")===(a.rel==null?null:a.rel)&&f.getAttribute("title")===(a.title==null?null:a.title)&&f.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){y.splice(A,1);break t}}f=u.createElement(o),Ln(f,o,a),u.head.appendChild(f);break;case"meta":if(y=rv("meta","content",u).get(o+(a.content||""))){for(A=0;A<y.length;A++)if(f=y[A],f.getAttribute("content")===(a.content==null?null:""+a.content)&&f.getAttribute("name")===(a.name==null?null:a.name)&&f.getAttribute("property")===(a.property==null?null:a.property)&&f.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&f.getAttribute("charset")===(a.charSet==null?null:a.charSet)){y.splice(A,1);break t}}f=u.createElement(o),Ln(f,o,a),u.head.appendChild(f);break;default:throw Error(s(468,o))}f[tn]=t,X(f),o=f}t.stateNode=o}else ov(u,t.type,t.stateNode);else t.stateNode=sv(u,o,t.memoizedProps);else f!==o?(f===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):f.count--,o===null?ov(u,t.type,t.stateNode):sv(u,o,t.memoizedProps)):o===null&&t.stateNode!==null&&xf(t,t.memoizedProps,a.memoizedProps)}break;case 27:Wn(n,t),qn(t),o&512&&(_n||a===null||ji(a,a.return)),a!==null&&o&4&&xf(t,t.memoizedProps,a.memoizedProps);break;case 5:if(Wn(n,t),qn(t),o&512&&(_n||a===null||ji(a,a.return)),t.flags&32){u=t.stateNode;try{wn(u,"")}catch(Ve){kt(t,t.return,Ve)}}o&4&&t.stateNode!=null&&(u=t.memoizedProps,xf(t,u,a!==null?a.memoizedProps:u)),o&1024&&(Mf=!0);break;case 6:if(Wn(n,t),qn(t),o&4){if(t.stateNode===null)throw Error(s(162));o=t.memoizedProps,a=t.stateNode;try{a.nodeValue=o}catch(Ve){kt(t,t.return,Ve)}}break;case 3:if(dc=null,u=Ci,Ci=uc(n.containerInfo),Wn(n,t),Ci=u,qn(t),o&4&&a!==null&&a.memoizedState.isDehydrated)try{Rr(n.containerInfo)}catch(Ve){kt(t,t.return,Ve)}Mf&&(Mf=!1,og(t));break;case 4:o=Ci,Ci=uc(t.stateNode.containerInfo),Wn(n,t),qn(t),Ci=o;break;case 12:Wn(n,t),qn(t);break;case 31:Wn(n,t),qn(t),o&4&&(o=t.updateQueue,o!==null&&(t.updateQueue=null,Kl(t,o)));break;case 13:Wn(n,t),qn(t),t.child.flags&8192&&t.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(Jl=b()),o&4&&(o=t.updateQueue,o!==null&&(t.updateQueue=null,Kl(t,o)));break;case 22:u=t.memoizedState!==null;var I=a!==null&&a.memoizedState!==null,te=ua,de=_n;if(ua=te||u,_n=de||I,Wn(n,t),_n=de,ua=te,qn(t),o&8192)e:for(n=t.stateNode,n._visibility=u?n._visibility&-2:n._visibility|1,u&&(a===null||I||ua||_n||Us(t)),a=null,n=t;;){if(n.tag===5||n.tag===26){if(a===null){I=a=n;try{if(f=I.stateNode,u)y=f.style,typeof y.setProperty=="function"?y.setProperty("display","none","important"):y.display="none";else{A=I.stateNode;var ve=I.memoizedProps.style,ie=ve!=null&&ve.hasOwnProperty("display")?ve.display:null;A.style.display=ie==null||typeof ie=="boolean"?"":(""+ie).trim()}}catch(Ve){kt(I,I.return,Ve)}}}else if(n.tag===6){if(a===null){I=n;try{I.stateNode.nodeValue=u?"":I.memoizedProps}catch(Ve){kt(I,I.return,Ve)}}}else if(n.tag===18){if(a===null){I=n;try{var ce=I.stateNode;u?Kg(ce,!0):Kg(I.stateNode,!1)}catch(Ve){kt(I,I.return,Ve)}}}else if((n.tag!==22&&n.tag!==23||n.memoizedState===null||n===t)&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break e;for(;n.sibling===null;){if(n.return===null||n.return===t)break e;a===n&&(a=null),n=n.return}a===n&&(a=null),n.sibling.return=n.return,n=n.sibling}o&4&&(o=t.updateQueue,o!==null&&(a=o.retryQueue,a!==null&&(o.retryQueue=null,Kl(t,a))));break;case 19:Wn(n,t),qn(t),o&4&&(o=t.updateQueue,o!==null&&(t.updateQueue=null,Kl(t,o)));break;case 30:break;case 21:break;default:Wn(n,t),qn(t)}}function qn(t){var n=t.flags;if(n&2){try{for(var a,o=t.return;o!==null;){if(Jm(o)){a=o;break}o=o.return}if(a==null)throw Error(s(160));switch(a.tag){case 27:var u=a.stateNode,f=yf(t);Zl(t,f,u);break;case 5:var y=a.stateNode;a.flags&32&&(wn(y,""),a.flags&=-33);var A=yf(t);Zl(t,A,y);break;case 3:case 4:var I=a.stateNode.containerInfo,te=yf(t);Sf(t,te,I);break;default:throw Error(s(161))}}catch(de){kt(t,t.return,de)}t.flags&=-3}n&4096&&(t.flags&=-4097)}function og(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var n=t;og(n),n.tag===5&&n.flags&1024&&n.stateNode.reset(),t=t.sibling}}function da(t,n){if(n.subtreeFlags&8772)for(n=n.child;n!==null;)tg(t,n.alternate,n),n=n.sibling}function Us(t){for(t=t.child;t!==null;){var n=t;switch(n.tag){case 0:case 11:case 14:case 15:Ha(4,n,n.return),Us(n);break;case 1:ji(n,n.return);var a=n.stateNode;typeof a.componentWillUnmount=="function"&&Km(n,n.return,a),Us(n);break;case 27:ko(n.stateNode);case 26:case 5:ji(n,n.return),Us(n);break;case 22:n.memoizedState===null&&Us(n);break;case 30:Us(n);break;default:Us(n)}t=t.sibling}}function ha(t,n,a){for(a=a&&(n.subtreeFlags&8772)!==0,n=n.child;n!==null;){var o=n.alternate,u=t,f=n,y=f.flags;switch(f.tag){case 0:case 11:case 15:ha(u,f,a),Oo(4,f);break;case 1:if(ha(u,f,a),o=f,u=o.stateNode,typeof u.componentDidMount=="function")try{u.componentDidMount()}catch(te){kt(o,o.return,te)}if(o=f,u=o.updateQueue,u!==null){var A=o.stateNode;try{var I=u.shared.hiddenCallbacks;if(I!==null)for(u.shared.hiddenCallbacks=null,u=0;u<I.length;u++)Ip(I[u],A)}catch(te){kt(o,o.return,te)}}a&&y&64&&Zm(f),Po(f,f.return);break;case 27:$m(f);case 26:case 5:ha(u,f,a),a&&o===null&&y&4&&Qm(f),Po(f,f.return);break;case 12:ha(u,f,a);break;case 31:ha(u,f,a),a&&y&4&&ag(u,f);break;case 13:ha(u,f,a),a&&y&4&&sg(u,f);break;case 22:f.memoizedState===null&&ha(u,f,a),Po(f,f.return);break;case 30:break;default:ha(u,f,a)}n=n.sibling}}function Ef(t,n){var a=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),t=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(t=n.memoizedState.cachePool.pool),t!==a&&(t!=null&&t.refCount++,a!=null&&So(a))}function bf(t,n){t=null,n.alternate!==null&&(t=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==t&&(n.refCount++,t!=null&&So(t))}function wi(t,n,a,o){if(n.subtreeFlags&10256)for(n=n.child;n!==null;)lg(t,n,a,o),n=n.sibling}function lg(t,n,a,o){var u=n.flags;switch(n.tag){case 0:case 11:case 15:wi(t,n,a,o),u&2048&&Oo(9,n);break;case 1:wi(t,n,a,o);break;case 3:wi(t,n,a,o),u&2048&&(t=null,n.alternate!==null&&(t=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==t&&(n.refCount++,t!=null&&So(t)));break;case 12:if(u&2048){wi(t,n,a,o),t=n.stateNode;try{var f=n.memoizedProps,y=f.id,A=f.onPostCommit;typeof A=="function"&&A(y,n.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(I){kt(n,n.return,I)}}else wi(t,n,a,o);break;case 31:wi(t,n,a,o);break;case 13:wi(t,n,a,o);break;case 23:break;case 22:f=n.stateNode,y=n.alternate,n.memoizedState!==null?f._visibility&2?wi(t,n,a,o):Bo(t,n):f._visibility&2?wi(t,n,a,o):(f._visibility|=2,gr(t,n,a,o,(n.subtreeFlags&10256)!==0||!1)),u&2048&&Ef(y,n);break;case 24:wi(t,n,a,o),u&2048&&bf(n.alternate,n);break;default:wi(t,n,a,o)}}function gr(t,n,a,o,u){for(u=u&&((n.subtreeFlags&10256)!==0||!1),n=n.child;n!==null;){var f=t,y=n,A=a,I=o,te=y.flags;switch(y.tag){case 0:case 11:case 15:gr(f,y,A,I,u),Oo(8,y);break;case 23:break;case 22:var de=y.stateNode;y.memoizedState!==null?de._visibility&2?gr(f,y,A,I,u):Bo(f,y):(de._visibility|=2,gr(f,y,A,I,u)),u&&te&2048&&Ef(y.alternate,y);break;case 24:gr(f,y,A,I,u),u&&te&2048&&bf(y.alternate,y);break;default:gr(f,y,A,I,u)}n=n.sibling}}function Bo(t,n){if(n.subtreeFlags&10256)for(n=n.child;n!==null;){var a=t,o=n,u=o.flags;switch(o.tag){case 22:Bo(a,o),u&2048&&Ef(o.alternate,o);break;case 24:Bo(a,o),u&2048&&bf(o.alternate,o);break;default:Bo(a,o)}n=n.sibling}}var zo=8192;function vr(t,n,a){if(t.subtreeFlags&zo)for(t=t.child;t!==null;)cg(t,n,a),t=t.sibling}function cg(t,n,a){switch(t.tag){case 26:vr(t,n,a),t.flags&zo&&t.memoizedState!==null&&vy(a,Ci,t.memoizedState,t.memoizedProps);break;case 5:vr(t,n,a);break;case 3:case 4:var o=Ci;Ci=uc(t.stateNode.containerInfo),vr(t,n,a),Ci=o;break;case 22:t.memoizedState===null&&(o=t.alternate,o!==null&&o.memoizedState!==null?(o=zo,zo=16777216,vr(t,n,a),zo=o):vr(t,n,a));break;default:vr(t,n,a)}}function ug(t){var n=t.alternate;if(n!==null&&(t=n.child,t!==null)){n.child=null;do n=t.sibling,t.sibling=null,t=n;while(t!==null)}}function Io(t){var n=t.deletions;if((t.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var o=n[a];An=o,dg(o,t)}ug(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)fg(t),t=t.sibling}function fg(t){switch(t.tag){case 0:case 11:case 15:Io(t),t.flags&2048&&Ha(9,t,t.return);break;case 3:Io(t);break;case 12:Io(t);break;case 22:var n=t.stateNode;t.memoizedState!==null&&n._visibility&2&&(t.return===null||t.return.tag!==13)?(n._visibility&=-3,Ql(t)):Io(t);break;default:Io(t)}}function Ql(t){var n=t.deletions;if((t.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var o=n[a];An=o,dg(o,t)}ug(t)}for(t=t.child;t!==null;){switch(n=t,n.tag){case 0:case 11:case 15:Ha(8,n,n.return),Ql(n);break;case 22:a=n.stateNode,a._visibility&2&&(a._visibility&=-3,Ql(n));break;default:Ql(n)}t=t.sibling}}function dg(t,n){for(;An!==null;){var a=An;switch(a.tag){case 0:case 11:case 15:Ha(8,a,n);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var o=a.memoizedState.cachePool.pool;o!=null&&o.refCount++}break;case 24:So(a.memoizedState.cache)}if(o=a.child,o!==null)o.return=a,An=o;else e:for(a=t;An!==null;){o=An;var u=o.sibling,f=o.return;if(ng(o),o===a){An=null;break e}if(u!==null){u.return=f,An=u;break e}An=f}}}var Ux={getCacheForType:function(t){var n=Dn(mn),a=n.data.get(t);return a===void 0&&(a=t(),n.data.set(t,a)),a},cacheSignal:function(){return Dn(mn).controller.signal}},Lx=typeof WeakMap=="function"?WeakMap:Map,Pt=0,Qt=null,St=null,bt=0,jt=0,ai=null,Ga=!1,_r=!1,Tf=!1,pa=0,ln=0,Va=0,Ls=0,Af=0,si=0,xr=0,Fo=null,Yn=null,Rf=!1,Jl=0,hg=0,$l=1/0,ec=null,ja=null,Mn=0,ka=null,yr=null,ma=0,Cf=0,wf=null,pg=null,Ho=0,Nf=null;function ri(){return(Pt&2)!==0&&bt!==0?bt&-bt:U.T!==null?Bf():fs()}function mg(){if(si===0)if((bt&536870912)===0||Ct){var t=be;be<<=1,(be&3932160)===0&&(be=262144),si=t}else si=536870912;return t=ni.current,t!==null&&(t.flags|=32),si}function Zn(t,n,a){(t===Qt&&(jt===2||jt===9)||t.cancelPendingCommit!==null)&&(Sr(t,0),Xa(t,bt,si,!1)),yn(t,a),((Pt&2)===0||t!==Qt)&&(t===Qt&&((Pt&2)===0&&(Ls|=a),ln===4&&Xa(t,bt,si,!1)),ki(t))}function gg(t,n,a){if((Pt&6)!==0)throw Error(s(327));var o=!a&&(n&127)===0&&(n&t.expiredLanes)===0||He(t,n),u=o?Bx(t,n):Uf(t,n,!0),f=o;do{if(u===0){_r&&!o&&Xa(t,n,0,!1);break}else{if(a=t.current.alternate,f&&!Ox(a)){u=Uf(t,n,!1),f=!1;continue}if(u===2){if(f=n,t.errorRecoveryDisabledLanes&f)var y=0;else y=t.pendingLanes&-536870913,y=y!==0?y:y&536870912?536870912:0;if(y!==0){n=y;e:{var A=t;u=Fo;var I=A.current.memoizedState.isDehydrated;if(I&&(Sr(A,y).flags|=256),y=Uf(A,y,!1),y!==2){if(Tf&&!I){A.errorRecoveryDisabledLanes|=f,Ls|=f,u=4;break e}f=Yn,Yn=u,f!==null&&(Yn===null?Yn=f:Yn.push.apply(Yn,f))}u=y}if(f=!1,u!==2)continue}}if(u===1){Sr(t,0),Xa(t,n,0,!0);break}e:{switch(o=t,f=u,f){case 0:case 1:throw Error(s(345));case 4:if((n&4194048)!==n)break;case 6:Xa(o,n,si,!Ga);break e;case 2:Yn=null;break;case 3:case 5:break;default:throw Error(s(329))}if((n&62914560)===n&&(u=Jl+300-b(),10<u)){if(Xa(o,n,si,!Ga),ge(o,0,!0)!==0)break e;ma=n,o.timeoutHandle=qg(vg.bind(null,o,a,Yn,ec,Rf,n,si,Ls,xr,Ga,f,"Throttled",-0,0),u);break e}vg(o,a,Yn,ec,Rf,n,si,Ls,xr,Ga,f,null,-0,0)}}break}while(!0);ki(t)}function vg(t,n,a,o,u,f,y,A,I,te,de,ve,ie,ce){if(t.timeoutHandle=-1,ve=n.subtreeFlags,ve&8192||(ve&16785408)===16785408){ve={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:di},cg(n,f,ve);var Ve=(f&62914560)===f?Jl-b():(f&4194048)===f?hg-b():0;if(Ve=_y(ve,Ve),Ve!==null){ma=f,t.cancelPendingCommit=Ve(Tg.bind(null,t,n,f,a,o,u,y,A,I,de,ve,null,ie,ce)),Xa(t,f,y,!te);return}}Tg(t,n,f,a,o,u,y,A,I)}function Ox(t){for(var n=t;;){var a=n.tag;if((a===0||a===11||a===15)&&n.flags&16384&&(a=n.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var o=0;o<a.length;o++){var u=a[o],f=u.getSnapshot;u=u.value;try{if(!ei(f(),u))return!1}catch{return!1}}if(a=n.child,n.subtreeFlags&16384&&a!==null)a.return=n,n=a;else{if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return!0;n=n.return}n.sibling.return=n.return,n=n.sibling}}return!0}function Xa(t,n,a,o){n&=~Af,n&=~Ls,t.suspendedLanes|=n,t.pingedLanes&=~n,o&&(t.warmLanes|=n),o=t.expirationTimes;for(var u=n;0<u;){var f=31-Ge(u),y=1<<f;o[f]=-1,u&=~y}a!==0&&us(t,a,n)}function tc(){return(Pt&6)===0?(Go(0),!1):!0}function Df(){if(St!==null){if(jt===0)var t=St.return;else t=St,aa=bs=null,Wu(t),fr=null,Eo=0,t=St;for(;t!==null;)Ym(t.alternate,t),t=t.return;St=null}}function Sr(t,n){var a=t.timeoutHandle;a!==-1&&(t.timeoutHandle=-1,ey(a)),a=t.cancelPendingCommit,a!==null&&(t.cancelPendingCommit=null,a()),ma=0,Df(),Qt=t,St=a=na(t.current,null),bt=n,jt=0,ai=null,Ga=!1,_r=He(t,n),Tf=!1,xr=si=Af=Ls=Va=ln=0,Yn=Fo=null,Rf=!1,(n&8)!==0&&(n|=n&32);var o=t.entangledLanes;if(o!==0)for(t=t.entanglements,o&=n;0<o;){var u=31-Ge(o),f=1<<u;n|=t[u],o&=~f}return pa=n,Ml(),a}function _g(t,n){ct=null,U.H=Do,n===ur||n===Nl?(n=Op(),jt=3):n===Ou?(n=Op(),jt=4):jt=n===cf?8:n!==null&&typeof n=="object"&&typeof n.then=="function"?6:1,ai=n,St===null&&(ln=1,kl(t,pi(n,t.current)))}function xg(){var t=ni.current;return t===null?!0:(bt&4194048)===bt?_i===null:(bt&62914560)===bt||(bt&536870912)!==0?t===_i:!1}function yg(){var t=U.H;return U.H=Do,t===null?Do:t}function Sg(){var t=U.A;return U.A=Ux,t}function nc(){ln=4,Ga||(bt&4194048)!==bt&&ni.current!==null||(_r=!0),(Va&134217727)===0&&(Ls&134217727)===0||Qt===null||Xa(Qt,bt,si,!1)}function Uf(t,n,a){var o=Pt;Pt|=2;var u=yg(),f=Sg();(Qt!==t||bt!==n)&&(ec=null,Sr(t,n)),n=!1;var y=ln;e:do try{if(jt!==0&&St!==null){var A=St,I=ai;switch(jt){case 8:Df(),y=6;break e;case 3:case 2:case 9:case 6:ni.current===null&&(n=!0);var te=jt;if(jt=0,ai=null,Mr(t,A,I,te),a&&_r){y=0;break e}break;default:te=jt,jt=0,ai=null,Mr(t,A,I,te)}}Px(),y=ln;break}catch(de){_g(t,de)}while(!0);return n&&t.shellSuspendCounter++,aa=bs=null,Pt=o,U.H=u,U.A=f,St===null&&(Qt=null,bt=0,Ml()),y}function Px(){for(;St!==null;)Mg(St)}function Bx(t,n){var a=Pt;Pt|=2;var o=yg(),u=Sg();Qt!==t||bt!==n?(ec=null,$l=b()+500,Sr(t,n)):_r=He(t,n);e:do try{if(jt!==0&&St!==null){n=St;var f=ai;t:switch(jt){case 1:jt=0,ai=null,Mr(t,n,f,1);break;case 2:case 9:if(Up(f)){jt=0,ai=null,Eg(n);break}n=function(){jt!==2&&jt!==9||Qt!==t||(jt=7),ki(t)},f.then(n,n);break e;case 3:jt=7;break e;case 4:jt=5;break e;case 7:Up(f)?(jt=0,ai=null,Eg(n)):(jt=0,ai=null,Mr(t,n,f,7));break;case 5:var y=null;switch(St.tag){case 26:y=St.memoizedState;case 5:case 27:var A=St;if(y?lv(y):A.stateNode.complete){jt=0,ai=null;var I=A.sibling;if(I!==null)St=I;else{var te=A.return;te!==null?(St=te,ic(te)):St=null}break t}}jt=0,ai=null,Mr(t,n,f,5);break;case 6:jt=0,ai=null,Mr(t,n,f,6);break;case 8:Df(),ln=6;break e;default:throw Error(s(462))}}zx();break}catch(de){_g(t,de)}while(!0);return aa=bs=null,U.H=o,U.A=u,Pt=a,St!==null?0:(Qt=null,bt=0,Ml(),ln)}function zx(){for(;St!==null&&!an();)Mg(St)}function Mg(t){var n=Wm(t.alternate,t,pa);t.memoizedProps=t.pendingProps,n===null?ic(t):St=n}function Eg(t){var n=t,a=n.alternate;switch(n.tag){case 15:case 0:n=Hm(a,n,n.pendingProps,n.type,void 0,bt);break;case 11:n=Hm(a,n,n.pendingProps,n.type.render,n.ref,bt);break;case 5:Wu(n);default:Ym(a,n),n=St=Sp(n,pa),n=Wm(a,n,pa)}t.memoizedProps=t.pendingProps,n===null?ic(t):St=n}function Mr(t,n,a,o){aa=bs=null,Wu(n),fr=null,Eo=0;var u=n.return;try{if(Tx(t,u,n,a,bt)){ln=1,kl(t,pi(a,t.current)),St=null;return}}catch(f){if(u!==null)throw St=u,f;ln=1,kl(t,pi(a,t.current)),St=null;return}n.flags&32768?(Ct||o===1?t=!0:_r||(bt&536870912)!==0?t=!1:(Ga=t=!0,(o===2||o===9||o===3||o===6)&&(o=ni.current,o!==null&&o.tag===13&&(o.flags|=16384))),bg(n,t)):ic(n)}function ic(t){var n=t;do{if((n.flags&32768)!==0){bg(n,Ga);return}t=n.return;var a=Cx(n.alternate,n,pa);if(a!==null){St=a;return}if(n=n.sibling,n!==null){St=n;return}St=n=t}while(n!==null);ln===0&&(ln=5)}function bg(t,n){do{var a=wx(t.alternate,t);if(a!==null){a.flags&=32767,St=a;return}if(a=t.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!n&&(t=t.sibling,t!==null)){St=t;return}St=t=a}while(t!==null);ln=6,St=null}function Tg(t,n,a,o,u,f,y,A,I){t.cancelPendingCommit=null;do ac();while(Mn!==0);if((Pt&6)!==0)throw Error(s(327));if(n!==null){if(n===t.current)throw Error(s(177));if(f=n.lanes|n.childLanes,f|=xu,Qn(t,a,f,y,A,I),t===Qt&&(St=Qt=null,bt=0),yr=n,ka=t,ma=a,Cf=f,wf=u,pg=o,(n.subtreeFlags&10256)!==0||(n.flags&10256)!==0?(t.callbackNode=null,t.callbackPriority=0,Gx(fe,function(){return Ng(),null})):(t.callbackNode=null,t.callbackPriority=0),o=(n.flags&13878)!==0,(n.subtreeFlags&13878)!==0||o){o=U.T,U.T=null,u=$.p,$.p=2,y=Pt,Pt|=4;try{Nx(t,n,a)}finally{Pt=y,$.p=u,U.T=o}}Mn=1,Ag(),Rg(),Cg()}}function Ag(){if(Mn===1){Mn=0;var t=ka,n=yr,a=(n.flags&13878)!==0;if((n.subtreeFlags&13878)!==0||a){a=U.T,U.T=null;var o=$.p;$.p=2;var u=Pt;Pt|=4;try{rg(n,t);var f=kf,y=dp(t.containerInfo),A=f.focusedElem,I=f.selectionRange;if(y!==A&&A&&A.ownerDocument&&fp(A.ownerDocument.documentElement,A)){if(I!==null&&pu(A)){var te=I.start,de=I.end;if(de===void 0&&(de=te),"selectionStart"in A)A.selectionStart=te,A.selectionEnd=Math.min(de,A.value.length);else{var ve=A.ownerDocument||document,ie=ve&&ve.defaultView||window;if(ie.getSelection){var ce=ie.getSelection(),Ve=A.textContent.length,nt=Math.min(I.start,Ve),Yt=I.end===void 0?nt:Math.min(I.end,Ve);!ce.extend&&nt>Yt&&(y=Yt,Yt=nt,nt=y);var Q=up(A,nt),V=up(A,Yt);if(Q&&V&&(ce.rangeCount!==1||ce.anchorNode!==Q.node||ce.anchorOffset!==Q.offset||ce.focusNode!==V.node||ce.focusOffset!==V.offset)){var ee=ve.createRange();ee.setStart(Q.node,Q.offset),ce.removeAllRanges(),nt>Yt?(ce.addRange(ee),ce.extend(V.node,V.offset)):(ee.setEnd(V.node,V.offset),ce.addRange(ee))}}}}for(ve=[],ce=A;ce=ce.parentNode;)ce.nodeType===1&&ve.push({element:ce,left:ce.scrollLeft,top:ce.scrollTop});for(typeof A.focus=="function"&&A.focus(),A=0;A<ve.length;A++){var pe=ve[A];pe.element.scrollLeft=pe.left,pe.element.scrollTop=pe.top}}gc=!!jf,kf=jf=null}finally{Pt=u,$.p=o,U.T=a}}t.current=n,Mn=2}}function Rg(){if(Mn===2){Mn=0;var t=ka,n=yr,a=(n.flags&8772)!==0;if((n.subtreeFlags&8772)!==0||a){a=U.T,U.T=null;var o=$.p;$.p=2;var u=Pt;Pt|=4;try{tg(t,n.alternate,n)}finally{Pt=u,$.p=o,U.T=a}}Mn=3}}function Cg(){if(Mn===4||Mn===3){Mn=0,P();var t=ka,n=yr,a=ma,o=pg;(n.subtreeFlags&10256)!==0||(n.flags&10256)!==0?Mn=5:(Mn=0,yr=ka=null,wg(t,t.pendingLanes));var u=t.pendingLanes;if(u===0&&(ja=null),Ca(a),n=n.stateNode,Ne&&typeof Ne.onCommitFiberRoot=="function")try{Ne.onCommitFiberRoot(Se,n,void 0,(n.current.flags&128)===128)}catch{}if(o!==null){n=U.T,u=$.p,$.p=2,U.T=null;try{for(var f=t.onRecoverableError,y=0;y<o.length;y++){var A=o[y];f(A.value,{componentStack:A.stack})}}finally{U.T=n,$.p=u}}(ma&3)!==0&&ac(),ki(t),u=t.pendingLanes,(a&261930)!==0&&(u&42)!==0?t===Nf?Ho++:(Ho=0,Nf=t):Ho=0,Go(0)}}function wg(t,n){(t.pooledCacheLanes&=n)===0&&(n=t.pooledCache,n!=null&&(t.pooledCache=null,So(n)))}function ac(){return Ag(),Rg(),Cg(),Ng()}function Ng(){if(Mn!==5)return!1;var t=ka,n=Cf;Cf=0;var a=Ca(ma),o=U.T,u=$.p;try{$.p=32>a?32:a,U.T=null,a=wf,wf=null;var f=ka,y=ma;if(Mn=0,yr=ka=null,ma=0,(Pt&6)!==0)throw Error(s(331));var A=Pt;if(Pt|=4,fg(f.current),lg(f,f.current,y,a),Pt=A,Go(0,!1),Ne&&typeof Ne.onPostCommitFiberRoot=="function")try{Ne.onPostCommitFiberRoot(Se,f)}catch{}return!0}finally{$.p=u,U.T=o,wg(t,n)}}function Dg(t,n,a){n=pi(a,n),n=lf(t.stateNode,n,2),t=za(t,n,2),t!==null&&(yn(t,2),ki(t))}function kt(t,n,a){if(t.tag===3)Dg(t,t,a);else for(;n!==null;){if(n.tag===3){Dg(n,t,a);break}else if(n.tag===1){var o=n.stateNode;if(typeof n.type.getDerivedStateFromError=="function"||typeof o.componentDidCatch=="function"&&(ja===null||!ja.has(o))){t=pi(a,t),a=Um(2),o=za(n,a,2),o!==null&&(Lm(a,o,n,t),yn(o,2),ki(o));break}}n=n.return}}function Lf(t,n,a){var o=t.pingCache;if(o===null){o=t.pingCache=new Lx;var u=new Set;o.set(n,u)}else u=o.get(n),u===void 0&&(u=new Set,o.set(n,u));u.has(a)||(Tf=!0,u.add(a),t=Ix.bind(null,t,n,a),n.then(t,t))}function Ix(t,n,a){var o=t.pingCache;o!==null&&o.delete(n),t.pingedLanes|=t.suspendedLanes&a,t.warmLanes&=~a,Qt===t&&(bt&a)===a&&(ln===4||ln===3&&(bt&62914560)===bt&&300>b()-Jl?(Pt&2)===0&&Sr(t,0):Af|=a,xr===bt&&(xr=0)),ki(t)}function Ug(t,n){n===0&&(n=Ht()),t=Ss(t,n),t!==null&&(yn(t,n),ki(t))}function Fx(t){var n=t.memoizedState,a=0;n!==null&&(a=n.retryLane),Ug(t,a)}function Hx(t,n){var a=0;switch(t.tag){case 31:case 13:var o=t.stateNode,u=t.memoizedState;u!==null&&(a=u.retryLane);break;case 19:o=t.stateNode;break;case 22:o=t.stateNode._retryCache;break;default:throw Error(s(314))}o!==null&&o.delete(n),Ug(t,a)}function Gx(t,n){return Qe(t,n)}var sc=null,Er=null,Of=!1,rc=!1,Pf=!1,Wa=0;function ki(t){t!==Er&&t.next===null&&(Er===null?sc=Er=t:Er=Er.next=t),rc=!0,Of||(Of=!0,jx())}function Go(t,n){if(!Pf&&rc){Pf=!0;do for(var a=!1,o=sc;o!==null;){if(t!==0){var u=o.pendingLanes;if(u===0)var f=0;else{var y=o.suspendedLanes,A=o.pingedLanes;f=(1<<31-Ge(42|t)+1)-1,f&=u&~(y&~A),f=f&201326741?f&201326741|1:f?f|2:0}f!==0&&(a=!0,Bg(o,f))}else f=bt,f=ge(o,o===Qt?f:0,o.cancelPendingCommit!==null||o.timeoutHandle!==-1),(f&3)===0||He(o,f)||(a=!0,Bg(o,f));o=o.next}while(a);Pf=!1}}function Vx(){Lg()}function Lg(){rc=Of=!1;var t=0;Wa!==0&&$x()&&(t=Wa);for(var n=b(),a=null,o=sc;o!==null;){var u=o.next,f=Og(o,n);f===0?(o.next=null,a===null?sc=u:a.next=u,u===null&&(Er=a)):(a=o,(t!==0||(f&3)!==0)&&(rc=!0)),o=u}Mn!==0&&Mn!==5||Go(t),Wa!==0&&(Wa=0)}function Og(t,n){for(var a=t.suspendedLanes,o=t.pingedLanes,u=t.expirationTimes,f=t.pendingLanes&-62914561;0<f;){var y=31-Ge(f),A=1<<y,I=u[y];I===-1?((A&a)===0||(A&o)!==0)&&(u[y]=st(A,n)):I<=n&&(t.expiredLanes|=A),f&=~A}if(n=Qt,a=bt,a=ge(t,t===n?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),o=t.callbackNode,a===0||t===n&&(jt===2||jt===9)||t.cancelPendingCommit!==null)return o!==null&&o!==null&&rt(o),t.callbackNode=null,t.callbackPriority=0;if((a&3)===0||He(t,a)){if(n=a&-a,n===t.callbackPriority)return n;switch(o!==null&&rt(o),Ca(a)){case 2:case 8:a=ye;break;case 32:a=fe;break;case 268435456:a=Ue;break;default:a=fe}return o=Pg.bind(null,t),a=Qe(a,o),t.callbackPriority=n,t.callbackNode=a,n}return o!==null&&o!==null&&rt(o),t.callbackPriority=2,t.callbackNode=null,2}function Pg(t,n){if(Mn!==0&&Mn!==5)return t.callbackNode=null,t.callbackPriority=0,null;var a=t.callbackNode;if(ac()&&t.callbackNode!==a)return null;var o=bt;return o=ge(t,t===Qt?o:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),o===0?null:(gg(t,o,n),Og(t,b()),t.callbackNode!=null&&t.callbackNode===a?Pg.bind(null,t):null)}function Bg(t,n){if(ac())return null;gg(t,n,!0)}function jx(){ty(function(){(Pt&6)!==0?Qe(me,Vx):Lg()})}function Bf(){if(Wa===0){var t=lr;t===0&&(t=De,De<<=1,(De&261888)===0&&(De=256)),Wa=t}return Wa}function zg(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Qi(""+t)}function Ig(t,n){var a=n.ownerDocument.createElement("input");return a.name=n.name,a.value=n.value,t.id&&a.setAttribute("form",t.id),n.parentNode.insertBefore(a,n),t=new FormData(t),a.parentNode.removeChild(a),t}function kx(t,n,a,o,u){if(n==="submit"&&a&&a.stateNode===u){var f=zg((u[Sn]||null).action),y=o.submitter;y&&(n=(n=y[Sn]||null)?zg(n.formAction):y.getAttribute("formAction"),n!==null&&(f=n,y=null));var A=new F("action","action",null,o,u);t.push({event:A,listeners:[{instance:null,listener:function(){if(o.defaultPrevented){if(Wa!==0){var I=y?Ig(u,y):new FormData(u);tf(a,{pending:!0,data:I,method:u.method,action:f},null,I)}}else typeof f=="function"&&(A.preventDefault(),I=y?Ig(u,y):new FormData(u),tf(a,{pending:!0,data:I,method:u.method,action:f},f,I))},currentTarget:u}]})}}for(var zf=0;zf<_u.length;zf++){var If=_u[zf],Xx=If.toLowerCase(),Wx=If[0].toUpperCase()+If.slice(1);Ri(Xx,"on"+Wx)}Ri(mp,"onAnimationEnd"),Ri(gp,"onAnimationIteration"),Ri(vp,"onAnimationStart"),Ri("dblclick","onDoubleClick"),Ri("focusin","onFocus"),Ri("focusout","onBlur"),Ri(lx,"onTransitionRun"),Ri(cx,"onTransitionStart"),Ri(ux,"onTransitionCancel"),Ri(_p,"onTransitionEnd"),Be("onMouseEnter",["mouseout","mouseover"]),Be("onMouseLeave",["mouseout","mouseover"]),Be("onPointerEnter",["pointerout","pointerover"]),Be("onPointerLeave",["pointerout","pointerover"]),Fe("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),Fe("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),Fe("onBeforeInput",["compositionend","keypress","textInput","paste"]),Fe("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),Fe("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),Fe("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Vo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),qx=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Vo));function Fg(t,n){n=(n&4)!==0;for(var a=0;a<t.length;a++){var o=t[a],u=o.event;o=o.listeners;e:{var f=void 0;if(n)for(var y=o.length-1;0<=y;y--){var A=o[y],I=A.instance,te=A.currentTarget;if(A=A.listener,I!==f&&u.isPropagationStopped())break e;f=A,u.currentTarget=te;try{f(u)}catch(de){Sl(de)}u.currentTarget=null,f=I}else for(y=0;y<o.length;y++){if(A=o[y],I=A.instance,te=A.currentTarget,A=A.listener,I!==f&&u.isPropagationStopped())break e;f=A,u.currentTarget=te;try{f(u)}catch(de){Sl(de)}u.currentTarget=null,f=I}}}}function Mt(t,n){var a=n[wa];a===void 0&&(a=n[wa]=new Set);var o=t+"__bubble";a.has(o)||(Hg(n,t,2,!1),a.add(o))}function Ff(t,n,a){var o=0;n&&(o|=4),Hg(a,t,o,n)}var oc="_reactListening"+Math.random().toString(36).slice(2);function Hf(t){if(!t[oc]){t[oc]=!0,Ce.forEach(function(a){a!=="selectionchange"&&(qx.has(a)||Ff(a,!1,t),Ff(a,!0,t))});var n=t.nodeType===9?t:t.ownerDocument;n===null||n[oc]||(n[oc]=!0,Ff("selectionchange",!1,n))}}function Hg(t,n,a,o){switch(mv(n)){case 2:var u=Sy;break;case 8:u=My;break;default:u=td}a=u.bind(null,n,a,t),u=void 0,!Hi||n!=="touchstart"&&n!=="touchmove"&&n!=="wheel"||(u=!0),o?u!==void 0?t.addEventListener(n,a,{capture:!0,passive:u}):t.addEventListener(n,a,!0):u!==void 0?t.addEventListener(n,a,{passive:u}):t.addEventListener(n,a,!1)}function Gf(t,n,a,o,u){var f=o;if((n&1)===0&&(n&2)===0&&o!==null)e:for(;;){if(o===null)return;var y=o.tag;if(y===3||y===4){var A=o.stateNode.containerInfo;if(A===u)break;if(y===4)for(y=o.return;y!==null;){var I=y.tag;if((I===3||I===4)&&y.stateNode.containerInfo===u)return;y=y.return}for(;A!==null;){if(y=C(A),y===null)return;if(I=y.tag,I===5||I===6||I===26||I===27){o=f=y;continue e}A=A.parentNode}}o=o.return}fo(function(){var te=f,de=Ks(a),ve=[];e:{var ie=xp.get(t);if(ie!==void 0){var ce=F,Ve=t;switch(t){case"keypress":if(_s(a)===0)break e;case"keydown":case"keyup":ce=H0;break;case"focusin":Ve="focus",ce=cu;break;case"focusout":Ve="blur",ce=cu;break;case"beforeblur":case"afterblur":ce=cu;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":ce=Yh;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":ce=C0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":ce=j0;break;case mp:case gp:case vp:ce=D0;break;case _p:ce=X0;break;case"scroll":case"scrollend":ce=Ti;break;case"wheel":ce=q0;break;case"copy":case"cut":case"paste":ce=L0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":ce=Kh;break;case"toggle":case"beforetoggle":ce=Z0}var nt=(n&4)!==0,Yt=!nt&&(t==="scroll"||t==="scrollend"),Q=nt?ie!==null?ie+"Capture":null:ie;nt=[];for(var V=te,ee;V!==null;){var pe=V;if(ee=pe.stateNode,pe=pe.tag,pe!==5&&pe!==26&&pe!==27||ee===null||Q===null||(pe=Na(V,Q),pe!=null&&nt.push(jo(V,pe,ee))),Yt)break;V=V.return}0<nt.length&&(ie=new ce(ie,Ve,null,a,de),ve.push({event:ie,listeners:nt}))}}if((n&7)===0){e:{if(ie=t==="mouseover"||t==="pointerover",ce=t==="mouseout"||t==="pointerout",ie&&a!==ms&&(Ve=a.relatedTarget||a.fromElement)&&(C(Ve)||Ve[Ei]))break e;if((ce||ie)&&(ie=de.window===de?de:(ie=de.ownerDocument)?ie.defaultView||ie.parentWindow:window,ce?(Ve=a.relatedTarget||a.toElement,ce=te,Ve=Ve?C(Ve):null,Ve!==null&&(Yt=c(Ve),nt=Ve.tag,Ve!==Yt||nt!==5&&nt!==27&&nt!==6)&&(Ve=null)):(ce=null,Ve=te),ce!==Ve)){if(nt=Yh,pe="onMouseLeave",Q="onMouseEnter",V="mouse",(t==="pointerout"||t==="pointerover")&&(nt=Kh,pe="onPointerLeave",Q="onPointerEnter",V="pointer"),Yt=ce==null?ie:re(ce),ee=Ve==null?ie:re(Ve),ie=new nt(pe,V+"leave",ce,a,de),ie.target=Yt,ie.relatedTarget=ee,pe=null,C(de)===te&&(nt=new nt(Q,V+"enter",Ve,a,de),nt.target=ee,nt.relatedTarget=Yt,pe=nt),Yt=pe,ce&&Ve)t:{for(nt=Yx,Q=ce,V=Ve,ee=0,pe=Q;pe;pe=nt(pe))ee++;pe=0;for(var et=V;et;et=nt(et))pe++;for(;0<ee-pe;)Q=nt(Q),ee--;for(;0<pe-ee;)V=nt(V),pe--;for(;ee--;){if(Q===V||V!==null&&Q===V.alternate){nt=Q;break t}Q=nt(Q),V=nt(V)}nt=null}else nt=null;ce!==null&&Gg(ve,ie,ce,nt,!1),Ve!==null&&Yt!==null&&Gg(ve,Yt,Ve,nt,!0)}}e:{if(ie=te?re(te):window,ce=ie.nodeName&&ie.nodeName.toLowerCase(),ce==="select"||ce==="input"&&ie.type==="file")var Nt=ap;else if(np(ie))if(sp)Nt=sx;else{Nt=ix;var Xe=nx}else ce=ie.nodeName,!ce||ce.toLowerCase()!=="input"||ie.type!=="checkbox"&&ie.type!=="radio"?te&&ps(te.elementType)&&(Nt=ap):Nt=ax;if(Nt&&(Nt=Nt(t,te))){ip(ve,Nt,a,de);break e}Xe&&Xe(t,ie,te),t==="focusout"&&te&&ie.type==="number"&&te.memoizedProps.value!=null&&fn(ie,"number",ie.value)}switch(Xe=te?re(te):window,t){case"focusin":(np(Xe)||Xe.contentEditable==="true")&&(er=Xe,mu=te,_o=null);break;case"focusout":_o=mu=er=null;break;case"mousedown":gu=!0;break;case"contextmenu":case"mouseup":case"dragend":gu=!1,hp(ve,a,de);break;case"selectionchange":if(ox)break;case"keydown":case"keyup":hp(ve,a,de)}var ft;if(fu)e:{switch(t){case"compositionstart":var Tt="onCompositionStart";break e;case"compositionend":Tt="onCompositionEnd";break e;case"compositionupdate":Tt="onCompositionUpdate";break e}Tt=void 0}else $s?ep(t,a)&&(Tt="onCompositionEnd"):t==="keydown"&&a.keyCode===229&&(Tt="onCompositionStart");Tt&&(Qh&&a.locale!=="ko"&&($s||Tt!=="onCompositionStart"?Tt==="onCompositionEnd"&&$s&&(ft=vs()):($n=de,ta="value"in $n?$n.value:$n.textContent,$s=!0)),Xe=lc(te,Tt),0<Xe.length&&(Tt=new Zh(Tt,t,null,a,de),ve.push({event:Tt,listeners:Xe}),ft?Tt.data=ft:(ft=tp(a),ft!==null&&(Tt.data=ft)))),(ft=Q0?J0(t,a):$0(t,a))&&(Tt=lc(te,"onBeforeInput"),0<Tt.length&&(Xe=new Zh("onBeforeInput","beforeinput",null,a,de),ve.push({event:Xe,listeners:Tt}),Xe.data=ft)),kx(ve,t,te,a,de)}Fg(ve,n)})}function jo(t,n,a){return{instance:t,listener:n,currentTarget:a}}function lc(t,n){for(var a=n+"Capture",o=[];t!==null;){var u=t,f=u.stateNode;if(u=u.tag,u!==5&&u!==26&&u!==27||f===null||(u=Na(t,a),u!=null&&o.unshift(jo(t,u,f)),u=Na(t,n),u!=null&&o.push(jo(t,u,f))),t.tag===3)return o;t=t.return}return[]}function Yx(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function Gg(t,n,a,o,u){for(var f=n._reactName,y=[];a!==null&&a!==o;){var A=a,I=A.alternate,te=A.stateNode;if(A=A.tag,I!==null&&I===o)break;A!==5&&A!==26&&A!==27||te===null||(I=te,u?(te=Na(a,f),te!=null&&y.unshift(jo(a,te,I))):u||(te=Na(a,f),te!=null&&y.push(jo(a,te,I)))),a=a.return}y.length!==0&&t.push({event:n,listeners:y})}var Zx=/\r\n?/g,Kx=/\u0000|\uFFFD/g;function Vg(t){return(typeof t=="string"?t:""+t).replace(Zx,`
`).replace(Kx,"")}function jg(t,n){return n=Vg(n),Vg(t)===n}function qt(t,n,a,o,u,f){switch(a){case"children":typeof o=="string"?n==="body"||n==="textarea"&&o===""||wn(t,o):(typeof o=="number"||typeof o=="bigint")&&n!=="body"&&wn(t,""+o);break;case"className":Gt(t,"class",o);break;case"tabIndex":Gt(t,"tabindex",o);break;case"dir":case"role":case"viewBox":case"width":case"height":Gt(t,a,o);break;case"style":lo(t,o,f);break;case"data":if(n!=="object"){Gt(t,"data",o);break}case"src":case"href":if(o===""&&(n!=="a"||a!=="href")){t.removeAttribute(a);break}if(o==null||typeof o=="function"||typeof o=="symbol"||typeof o=="boolean"){t.removeAttribute(a);break}o=Qi(""+o),t.setAttribute(a,o);break;case"action":case"formAction":if(typeof o=="function"){t.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof f=="function"&&(a==="formAction"?(n!=="input"&&qt(t,n,"name",u.name,u,null),qt(t,n,"formEncType",u.formEncType,u,null),qt(t,n,"formMethod",u.formMethod,u,null),qt(t,n,"formTarget",u.formTarget,u,null)):(qt(t,n,"encType",u.encType,u,null),qt(t,n,"method",u.method,u,null),qt(t,n,"target",u.target,u,null)));if(o==null||typeof o=="symbol"||typeof o=="boolean"){t.removeAttribute(a);break}o=Qi(""+o),t.setAttribute(a,o);break;case"onClick":o!=null&&(t.onclick=di);break;case"onScroll":o!=null&&Mt("scroll",t);break;case"onScrollEnd":o!=null&&Mt("scrollend",t);break;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(s(61));if(a=o.__html,a!=null){if(u.children!=null)throw Error(s(60));t.innerHTML=a}}break;case"multiple":t.multiple=o&&typeof o!="function"&&typeof o!="symbol";break;case"muted":t.muted=o&&typeof o!="function"&&typeof o!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(o==null||typeof o=="function"||typeof o=="boolean"||typeof o=="symbol"){t.removeAttribute("xlink:href");break}a=Qi(""+o),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":o!=null&&typeof o!="function"&&typeof o!="symbol"?t.setAttribute(a,""+o):t.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":o&&typeof o!="function"&&typeof o!="symbol"?t.setAttribute(a,""):t.removeAttribute(a);break;case"capture":case"download":o===!0?t.setAttribute(a,""):o!==!1&&o!=null&&typeof o!="function"&&typeof o!="symbol"?t.setAttribute(a,o):t.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":o!=null&&typeof o!="function"&&typeof o!="symbol"&&!isNaN(o)&&1<=o?t.setAttribute(a,o):t.removeAttribute(a);break;case"rowSpan":case"start":o==null||typeof o=="function"||typeof o=="symbol"||isNaN(o)?t.removeAttribute(a):t.setAttribute(a,o);break;case"popover":Mt("beforetoggle",t),Mt("toggle",t),Rt(t,"popover",o);break;case"xlinkActuate":yt(t,"http://www.w3.org/1999/xlink","xlink:actuate",o);break;case"xlinkArcrole":yt(t,"http://www.w3.org/1999/xlink","xlink:arcrole",o);break;case"xlinkRole":yt(t,"http://www.w3.org/1999/xlink","xlink:role",o);break;case"xlinkShow":yt(t,"http://www.w3.org/1999/xlink","xlink:show",o);break;case"xlinkTitle":yt(t,"http://www.w3.org/1999/xlink","xlink:title",o);break;case"xlinkType":yt(t,"http://www.w3.org/1999/xlink","xlink:type",o);break;case"xmlBase":yt(t,"http://www.w3.org/XML/1998/namespace","xml:base",o);break;case"xmlLang":yt(t,"http://www.w3.org/XML/1998/namespace","xml:lang",o);break;case"xmlSpace":yt(t,"http://www.w3.org/XML/1998/namespace","xml:space",o);break;case"is":Rt(t,"is",o);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=Zs.get(a)||a,Rt(t,a,o))}}function Vf(t,n,a,o,u,f){switch(a){case"style":lo(t,o,f);break;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(s(61));if(a=o.__html,a!=null){if(u.children!=null)throw Error(s(60));t.innerHTML=a}}break;case"children":typeof o=="string"?wn(t,o):(typeof o=="number"||typeof o=="bigint")&&wn(t,""+o);break;case"onScroll":o!=null&&Mt("scroll",t);break;case"onScrollEnd":o!=null&&Mt("scrollend",t);break;case"onClick":o!=null&&(t.onclick=di);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Oe.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(u=a.endsWith("Capture"),n=a.slice(2,u?a.length-7:void 0),f=t[Sn]||null,f=f!=null?f[a]:null,typeof f=="function"&&t.removeEventListener(n,f,u),typeof o=="function")){typeof f!="function"&&f!==null&&(a in t?t[a]=null:t.hasAttribute(a)&&t.removeAttribute(a)),t.addEventListener(n,o,u);break e}a in t?t[a]=o:o===!0?t.setAttribute(a,""):Rt(t,a,o)}}}function Ln(t,n,a){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Mt("error",t),Mt("load",t);var o=!1,u=!1,f;for(f in a)if(a.hasOwnProperty(f)){var y=a[f];if(y!=null)switch(f){case"src":o=!0;break;case"srcSet":u=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(s(137,n));default:qt(t,n,f,y,a,null)}}u&&qt(t,n,"srcSet",a.srcSet,a,null),o&&qt(t,n,"src",a.src,a,null);return;case"input":Mt("invalid",t);var A=f=y=u=null,I=null,te=null;for(o in a)if(a.hasOwnProperty(o)){var de=a[o];if(de!=null)switch(o){case"name":u=de;break;case"type":y=de;break;case"checked":I=de;break;case"defaultChecked":te=de;break;case"value":f=de;break;case"defaultValue":A=de;break;case"children":case"dangerouslySetInnerHTML":if(de!=null)throw Error(s(137,n));break;default:qt(t,n,o,de,a,null)}}rn(t,f,A,I,te,y,u,!1);return;case"select":Mt("invalid",t),o=y=f=null;for(u in a)if(a.hasOwnProperty(u)&&(A=a[u],A!=null))switch(u){case"value":f=A;break;case"defaultValue":y=A;break;case"multiple":o=A;default:qt(t,n,u,A,a,null)}n=f,a=y,t.multiple=!!o,n!=null?Ot(t,!!o,n,!1):a!=null&&Ot(t,!!o,a,!0);return;case"textarea":Mt("invalid",t),f=u=o=null;for(y in a)if(a.hasOwnProperty(y)&&(A=a[y],A!=null))switch(y){case"value":o=A;break;case"defaultValue":u=A;break;case"children":f=A;break;case"dangerouslySetInnerHTML":if(A!=null)throw Error(s(91));break;default:qt(t,n,y,A,a,null)}fi(t,o,u,f);return;case"option":for(I in a)a.hasOwnProperty(I)&&(o=a[I],o!=null)&&(I==="selected"?t.selected=o&&typeof o!="function"&&typeof o!="symbol":qt(t,n,I,o,a,null));return;case"dialog":Mt("beforetoggle",t),Mt("toggle",t),Mt("cancel",t),Mt("close",t);break;case"iframe":case"object":Mt("load",t);break;case"video":case"audio":for(o=0;o<Vo.length;o++)Mt(Vo[o],t);break;case"image":Mt("error",t),Mt("load",t);break;case"details":Mt("toggle",t);break;case"embed":case"source":case"link":Mt("error",t),Mt("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(te in a)if(a.hasOwnProperty(te)&&(o=a[te],o!=null))switch(te){case"children":case"dangerouslySetInnerHTML":throw Error(s(137,n));default:qt(t,n,te,o,a,null)}return;default:if(ps(n)){for(de in a)a.hasOwnProperty(de)&&(o=a[de],o!==void 0&&Vf(t,n,de,o,a,void 0));return}}for(A in a)a.hasOwnProperty(A)&&(o=a[A],o!=null&&qt(t,n,A,o,a,null))}function Qx(t,n,a,o){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var u=null,f=null,y=null,A=null,I=null,te=null,de=null;for(ce in a){var ve=a[ce];if(a.hasOwnProperty(ce)&&ve!=null)switch(ce){case"checked":break;case"value":break;case"defaultValue":I=ve;default:o.hasOwnProperty(ce)||qt(t,n,ce,null,o,ve)}}for(var ie in o){var ce=o[ie];if(ve=a[ie],o.hasOwnProperty(ie)&&(ce!=null||ve!=null))switch(ie){case"type":f=ce;break;case"name":u=ce;break;case"checked":te=ce;break;case"defaultChecked":de=ce;break;case"value":y=ce;break;case"defaultValue":A=ce;break;case"children":case"dangerouslySetInnerHTML":if(ce!=null)throw Error(s(137,n));break;default:ce!==ve&&qt(t,n,ie,ce,o,ve)}}Lt(t,y,A,I,te,de,f,u);return;case"select":ce=y=A=ie=null;for(f in a)if(I=a[f],a.hasOwnProperty(f)&&I!=null)switch(f){case"value":break;case"multiple":ce=I;default:o.hasOwnProperty(f)||qt(t,n,f,null,o,I)}for(u in o)if(f=o[u],I=a[u],o.hasOwnProperty(u)&&(f!=null||I!=null))switch(u){case"value":ie=f;break;case"defaultValue":A=f;break;case"multiple":y=f;default:f!==I&&qt(t,n,u,f,o,I)}n=A,a=y,o=ce,ie!=null?Ot(t,!!a,ie,!1):!!o!=!!a&&(n!=null?Ot(t,!!a,n,!0):Ot(t,!!a,a?[]:"",!1));return;case"textarea":ce=ie=null;for(A in a)if(u=a[A],a.hasOwnProperty(A)&&u!=null&&!o.hasOwnProperty(A))switch(A){case"value":break;case"children":break;default:qt(t,n,A,null,o,u)}for(y in o)if(u=o[y],f=a[y],o.hasOwnProperty(y)&&(u!=null||f!=null))switch(y){case"value":ie=u;break;case"defaultValue":ce=u;break;case"children":break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(s(91));break;default:u!==f&&qt(t,n,y,u,o,f)}pn(t,ie,ce);return;case"option":for(var Ve in a)ie=a[Ve],a.hasOwnProperty(Ve)&&ie!=null&&!o.hasOwnProperty(Ve)&&(Ve==="selected"?t.selected=!1:qt(t,n,Ve,null,o,ie));for(I in o)ie=o[I],ce=a[I],o.hasOwnProperty(I)&&ie!==ce&&(ie!=null||ce!=null)&&(I==="selected"?t.selected=ie&&typeof ie!="function"&&typeof ie!="symbol":qt(t,n,I,ie,o,ce));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var nt in a)ie=a[nt],a.hasOwnProperty(nt)&&ie!=null&&!o.hasOwnProperty(nt)&&qt(t,n,nt,null,o,ie);for(te in o)if(ie=o[te],ce=a[te],o.hasOwnProperty(te)&&ie!==ce&&(ie!=null||ce!=null))switch(te){case"children":case"dangerouslySetInnerHTML":if(ie!=null)throw Error(s(137,n));break;default:qt(t,n,te,ie,o,ce)}return;default:if(ps(n)){for(var Yt in a)ie=a[Yt],a.hasOwnProperty(Yt)&&ie!==void 0&&!o.hasOwnProperty(Yt)&&Vf(t,n,Yt,void 0,o,ie);for(de in o)ie=o[de],ce=a[de],!o.hasOwnProperty(de)||ie===ce||ie===void 0&&ce===void 0||Vf(t,n,de,ie,o,ce);return}}for(var Q in a)ie=a[Q],a.hasOwnProperty(Q)&&ie!=null&&!o.hasOwnProperty(Q)&&qt(t,n,Q,null,o,ie);for(ve in o)ie=o[ve],ce=a[ve],!o.hasOwnProperty(ve)||ie===ce||ie==null&&ce==null||qt(t,n,ve,ie,o,ce)}function kg(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function Jx(){if(typeof performance.getEntriesByType=="function"){for(var t=0,n=0,a=performance.getEntriesByType("resource"),o=0;o<a.length;o++){var u=a[o],f=u.transferSize,y=u.initiatorType,A=u.duration;if(f&&A&&kg(y)){for(y=0,A=u.responseEnd,o+=1;o<a.length;o++){var I=a[o],te=I.startTime;if(te>A)break;var de=I.transferSize,ve=I.initiatorType;de&&kg(ve)&&(I=I.responseEnd,y+=de*(I<A?1:(A-te)/(I-te)))}if(--o,n+=8*(f+y)/(u.duration/1e3),t++,10<t)break}}if(0<t)return n/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var jf=null,kf=null;function cc(t){return t.nodeType===9?t:t.ownerDocument}function Xg(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Wg(t,n){if(t===0)switch(n){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&n==="foreignObject"?0:t}function Xf(t,n){return t==="textarea"||t==="noscript"||typeof n.children=="string"||typeof n.children=="number"||typeof n.children=="bigint"||typeof n.dangerouslySetInnerHTML=="object"&&n.dangerouslySetInnerHTML!==null&&n.dangerouslySetInnerHTML.__html!=null}var Wf=null;function $x(){var t=window.event;return t&&t.type==="popstate"?t===Wf?!1:(Wf=t,!0):(Wf=null,!1)}var qg=typeof setTimeout=="function"?setTimeout:void 0,ey=typeof clearTimeout=="function"?clearTimeout:void 0,Yg=typeof Promise=="function"?Promise:void 0,ty=typeof queueMicrotask=="function"?queueMicrotask:typeof Yg<"u"?function(t){return Yg.resolve(null).then(t).catch(ny)}:qg;function ny(t){setTimeout(function(){throw t})}function qa(t){return t==="head"}function Zg(t,n){var a=n,o=0;do{var u=a.nextSibling;if(t.removeChild(a),u&&u.nodeType===8)if(a=u.data,a==="/$"||a==="/&"){if(o===0){t.removeChild(u),Rr(n);return}o--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")o++;else if(a==="html")ko(t.ownerDocument.documentElement);else if(a==="head"){a=t.ownerDocument.head,ko(a);for(var f=a.firstChild;f;){var y=f.nextSibling,A=f.nodeName;f[Fi]||A==="SCRIPT"||A==="STYLE"||A==="LINK"&&f.rel.toLowerCase()==="stylesheet"||a.removeChild(f),f=y}}else a==="body"&&ko(t.ownerDocument.body);a=u}while(a);Rr(n)}function Kg(t,n){var a=t;t=0;do{var o=a.nextSibling;if(a.nodeType===1?n?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(n?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),o&&o.nodeType===8)if(a=o.data,a==="/$"){if(t===0)break;t--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||t++;a=o}while(a)}function qf(t){var n=t.firstChild;for(n&&n.nodeType===10&&(n=n.nextSibling);n;){var a=n;switch(n=n.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":qf(a),ds(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}t.removeChild(a)}}function iy(t,n,a,o){for(;t.nodeType===1;){var u=a;if(t.nodeName.toLowerCase()!==n.toLowerCase()){if(!o&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(o){if(!t[Fi])switch(n){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(f=t.getAttribute("rel"),f==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(f!==u.rel||t.getAttribute("href")!==(u.href==null||u.href===""?null:u.href)||t.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin)||t.getAttribute("title")!==(u.title==null?null:u.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(f=t.getAttribute("src"),(f!==(u.src==null?null:u.src)||t.getAttribute("type")!==(u.type==null?null:u.type)||t.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin))&&f&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(n==="input"&&t.type==="hidden"){var f=u.name==null?null:""+u.name;if(u.type==="hidden"&&t.getAttribute("name")===f)return t}else return t;if(t=xi(t.nextSibling),t===null)break}return null}function ay(t,n,a){if(n==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!a||(t=xi(t.nextSibling),t===null))return null;return t}function Qg(t,n){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=xi(t.nextSibling),t===null))return null;return t}function Yf(t){return t.data==="$?"||t.data==="$~"}function Zf(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function sy(t,n){var a=t.ownerDocument;if(t.data==="$~")t._reactRetry=n;else if(t.data!=="$?"||a.readyState!=="loading")n();else{var o=function(){n(),a.removeEventListener("DOMContentLoaded",o)};a.addEventListener("DOMContentLoaded",o),t._reactRetry=o}}function xi(t){for(;t!=null;t=t.nextSibling){var n=t.nodeType;if(n===1||n===3)break;if(n===8){if(n=t.data,n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"||n==="F!"||n==="F")break;if(n==="/$"||n==="/&")return null}}return t}var Kf=null;function Jg(t){t=t.nextSibling;for(var n=0;t;){if(t.nodeType===8){var a=t.data;if(a==="/$"||a==="/&"){if(n===0)return xi(t.nextSibling);n--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||n++}t=t.nextSibling}return null}function $g(t){t=t.previousSibling;for(var n=0;t;){if(t.nodeType===8){var a=t.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(n===0)return t;n--}else a!=="/$"&&a!=="/&"||n++}t=t.previousSibling}return null}function ev(t,n,a){switch(n=cc(a),t){case"html":if(t=n.documentElement,!t)throw Error(s(452));return t;case"head":if(t=n.head,!t)throw Error(s(453));return t;case"body":if(t=n.body,!t)throw Error(s(454));return t;default:throw Error(s(451))}}function ko(t){for(var n=t.attributes;n.length;)t.removeAttributeNode(n[0]);ds(t)}var yi=new Map,tv=new Set;function uc(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var ga=$.d;$.d={f:ry,r:oy,D:ly,C:cy,L:uy,m:fy,X:hy,S:dy,M:py};function ry(){var t=ga.f(),n=tc();return t||n}function oy(t){var n=Y(t);n!==null&&n.tag===5&&n.type==="form"?_m(n):ga.r(t)}var br=typeof document>"u"?null:document;function nv(t,n,a){var o=br;if(o&&typeof n=="string"&&n){var u=Jt(n);u='link[rel="'+t+'"][href="'+u+'"]',typeof a=="string"&&(u+='[crossorigin="'+a+'"]'),tv.has(u)||(tv.add(u),t={rel:t,crossOrigin:a,href:n},o.querySelector(u)===null&&(n=o.createElement("link"),Ln(n,"link",t),X(n),o.head.appendChild(n)))}}function ly(t){ga.D(t),nv("dns-prefetch",t,null)}function cy(t,n){ga.C(t,n),nv("preconnect",t,n)}function uy(t,n,a){ga.L(t,n,a);var o=br;if(o&&t&&n){var u='link[rel="preload"][as="'+Jt(n)+'"]';n==="image"&&a&&a.imageSrcSet?(u+='[imagesrcset="'+Jt(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(u+='[imagesizes="'+Jt(a.imageSizes)+'"]')):u+='[href="'+Jt(t)+'"]';var f=u;switch(n){case"style":f=Tr(t);break;case"script":f=Ar(t)}yi.has(f)||(t=x({rel:"preload",href:n==="image"&&a&&a.imageSrcSet?void 0:t,as:n},a),yi.set(f,t),o.querySelector(u)!==null||n==="style"&&o.querySelector(Xo(f))||n==="script"&&o.querySelector(Wo(f))||(n=o.createElement("link"),Ln(n,"link",t),X(n),o.head.appendChild(n)))}}function fy(t,n){ga.m(t,n);var a=br;if(a&&t){var o=n&&typeof n.as=="string"?n.as:"script",u='link[rel="modulepreload"][as="'+Jt(o)+'"][href="'+Jt(t)+'"]',f=u;switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":f=Ar(t)}if(!yi.has(f)&&(t=x({rel:"modulepreload",href:t},n),yi.set(f,t),a.querySelector(u)===null)){switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Wo(f)))return}o=a.createElement("link"),Ln(o,"link",t),X(o),a.head.appendChild(o)}}}function dy(t,n,a){ga.S(t,n,a);var o=br;if(o&&t){var u=oe(o).hoistableStyles,f=Tr(t);n=n||"default";var y=u.get(f);if(!y){var A={loading:0,preload:null};if(y=o.querySelector(Xo(f)))A.loading=5;else{t=x({rel:"stylesheet",href:t,"data-precedence":n},a),(a=yi.get(f))&&Qf(t,a);var I=y=o.createElement("link");X(I),Ln(I,"link",t),I._p=new Promise(function(te,de){I.onload=te,I.onerror=de}),I.addEventListener("load",function(){A.loading|=1}),I.addEventListener("error",function(){A.loading|=2}),A.loading|=4,fc(y,n,o)}y={type:"stylesheet",instance:y,count:1,state:A},u.set(f,y)}}}function hy(t,n){ga.X(t,n);var a=br;if(a&&t){var o=oe(a).hoistableScripts,u=Ar(t),f=o.get(u);f||(f=a.querySelector(Wo(u)),f||(t=x({src:t,async:!0},n),(n=yi.get(u))&&Jf(t,n),f=a.createElement("script"),X(f),Ln(f,"link",t),a.head.appendChild(f)),f={type:"script",instance:f,count:1,state:null},o.set(u,f))}}function py(t,n){ga.M(t,n);var a=br;if(a&&t){var o=oe(a).hoistableScripts,u=Ar(t),f=o.get(u);f||(f=a.querySelector(Wo(u)),f||(t=x({src:t,async:!0,type:"module"},n),(n=yi.get(u))&&Jf(t,n),f=a.createElement("script"),X(f),Ln(f,"link",t),a.head.appendChild(f)),f={type:"script",instance:f,count:1,state:null},o.set(u,f))}}function iv(t,n,a,o){var u=(u=Re.current)?uc(u):null;if(!u)throw Error(s(446));switch(t){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(n=Tr(a.href),a=oe(u).hoistableStyles,o=a.get(n),o||(o={type:"style",instance:null,count:0,state:null},a.set(n,o)),o):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){t=Tr(a.href);var f=oe(u).hoistableStyles,y=f.get(t);if(y||(u=u.ownerDocument||u,y={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},f.set(t,y),(f=u.querySelector(Xo(t)))&&!f._p&&(y.instance=f,y.state.loading=5),yi.has(t)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},yi.set(t,a),f||my(u,t,a,y.state))),n&&o===null)throw Error(s(528,""));return y}if(n&&o!==null)throw Error(s(529,""));return null;case"script":return n=a.async,a=a.src,typeof a=="string"&&n&&typeof n!="function"&&typeof n!="symbol"?(n=Ar(a),a=oe(u).hoistableScripts,o=a.get(n),o||(o={type:"script",instance:null,count:0,state:null},a.set(n,o)),o):{type:"void",instance:null,count:0,state:null};default:throw Error(s(444,t))}}function Tr(t){return'href="'+Jt(t)+'"'}function Xo(t){return'link[rel="stylesheet"]['+t+"]"}function av(t){return x({},t,{"data-precedence":t.precedence,precedence:null})}function my(t,n,a,o){t.querySelector('link[rel="preload"][as="style"]['+n+"]")?o.loading=1:(n=t.createElement("link"),o.preload=n,n.addEventListener("load",function(){return o.loading|=1}),n.addEventListener("error",function(){return o.loading|=2}),Ln(n,"link",a),X(n),t.head.appendChild(n))}function Ar(t){return'[src="'+Jt(t)+'"]'}function Wo(t){return"script[async]"+t}function sv(t,n,a){if(n.count++,n.instance===null)switch(n.type){case"style":var o=t.querySelector('style[data-href~="'+Jt(a.href)+'"]');if(o)return n.instance=o,X(o),o;var u=x({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return o=(t.ownerDocument||t).createElement("style"),X(o),Ln(o,"style",u),fc(o,a.precedence,t),n.instance=o;case"stylesheet":u=Tr(a.href);var f=t.querySelector(Xo(u));if(f)return n.state.loading|=4,n.instance=f,X(f),f;o=av(a),(u=yi.get(u))&&Qf(o,u),f=(t.ownerDocument||t).createElement("link"),X(f);var y=f;return y._p=new Promise(function(A,I){y.onload=A,y.onerror=I}),Ln(f,"link",o),n.state.loading|=4,fc(f,a.precedence,t),n.instance=f;case"script":return f=Ar(a.src),(u=t.querySelector(Wo(f)))?(n.instance=u,X(u),u):(o=a,(u=yi.get(f))&&(o=x({},a),Jf(o,u)),t=t.ownerDocument||t,u=t.createElement("script"),X(u),Ln(u,"link",o),t.head.appendChild(u),n.instance=u);case"void":return null;default:throw Error(s(443,n.type))}else n.type==="stylesheet"&&(n.state.loading&4)===0&&(o=n.instance,n.state.loading|=4,fc(o,a.precedence,t));return n.instance}function fc(t,n,a){for(var o=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),u=o.length?o[o.length-1]:null,f=u,y=0;y<o.length;y++){var A=o[y];if(A.dataset.precedence===n)f=A;else if(f!==u)break}f?f.parentNode.insertBefore(t,f.nextSibling):(n=a.nodeType===9?a.head:a,n.insertBefore(t,n.firstChild))}function Qf(t,n){t.crossOrigin==null&&(t.crossOrigin=n.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=n.referrerPolicy),t.title==null&&(t.title=n.title)}function Jf(t,n){t.crossOrigin==null&&(t.crossOrigin=n.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=n.referrerPolicy),t.integrity==null&&(t.integrity=n.integrity)}var dc=null;function rv(t,n,a){if(dc===null){var o=new Map,u=dc=new Map;u.set(a,o)}else u=dc,o=u.get(a),o||(o=new Map,u.set(a,o));if(o.has(t))return o;for(o.set(t,null),a=a.getElementsByTagName(t),u=0;u<a.length;u++){var f=a[u];if(!(f[Fi]||f[tn]||t==="link"&&f.getAttribute("rel")==="stylesheet")&&f.namespaceURI!=="http://www.w3.org/2000/svg"){var y=f.getAttribute(n)||"";y=t+y;var A=o.get(y);A?A.push(f):o.set(y,[f])}}return o}function ov(t,n,a){t=t.ownerDocument||t,t.head.insertBefore(a,n==="title"?t.querySelector("head > title"):null)}function gy(t,n,a){if(a===1||n.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof n.precedence!="string"||typeof n.href!="string"||n.href==="")break;return!0;case"link":if(typeof n.rel!="string"||typeof n.href!="string"||n.href===""||n.onLoad||n.onError)break;return n.rel==="stylesheet"?(t=n.disabled,typeof n.precedence=="string"&&t==null):!0;case"script":if(n.async&&typeof n.async!="function"&&typeof n.async!="symbol"&&!n.onLoad&&!n.onError&&n.src&&typeof n.src=="string")return!0}return!1}function lv(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function vy(t,n,a,o){if(a.type==="stylesheet"&&(typeof o.media!="string"||matchMedia(o.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var u=Tr(o.href),f=n.querySelector(Xo(u));if(f){n=f._p,n!==null&&typeof n=="object"&&typeof n.then=="function"&&(t.count++,t=hc.bind(t),n.then(t,t)),a.state.loading|=4,a.instance=f,X(f);return}f=n.ownerDocument||n,o=av(o),(u=yi.get(u))&&Qf(o,u),f=f.createElement("link"),X(f);var y=f;y._p=new Promise(function(A,I){y.onload=A,y.onerror=I}),Ln(f,"link",o),a.instance=f}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(a,n),(n=a.state.preload)&&(a.state.loading&3)===0&&(t.count++,a=hc.bind(t),n.addEventListener("load",a),n.addEventListener("error",a))}}var $f=0;function _y(t,n){return t.stylesheets&&t.count===0&&mc(t,t.stylesheets),0<t.count||0<t.imgCount?function(a){var o=setTimeout(function(){if(t.stylesheets&&mc(t,t.stylesheets),t.unsuspend){var f=t.unsuspend;t.unsuspend=null,f()}},6e4+n);0<t.imgBytes&&$f===0&&($f=62500*Jx());var u=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&mc(t,t.stylesheets),t.unsuspend)){var f=t.unsuspend;t.unsuspend=null,f()}},(t.imgBytes>$f?50:800)+n);return t.unsuspend=a,function(){t.unsuspend=null,clearTimeout(o),clearTimeout(u)}}:null}function hc(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)mc(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var pc=null;function mc(t,n){t.stylesheets=null,t.unsuspend!==null&&(t.count++,pc=new Map,n.forEach(xy,t),pc=null,hc.call(t))}function xy(t,n){if(!(n.state.loading&4)){var a=pc.get(t);if(a)var o=a.get(null);else{a=new Map,pc.set(t,a);for(var u=t.querySelectorAll("link[data-precedence],style[data-precedence]"),f=0;f<u.length;f++){var y=u[f];(y.nodeName==="LINK"||y.getAttribute("media")!=="not all")&&(a.set(y.dataset.precedence,y),o=y)}o&&a.set(null,o)}u=n.instance,y=u.getAttribute("data-precedence"),f=a.get(y)||o,f===o&&a.set(null,u),a.set(y,u),this.count++,o=hc.bind(this),u.addEventListener("load",o),u.addEventListener("error",o),f?f.parentNode.insertBefore(u,f.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(u,t.firstChild)),n.state.loading|=4}}var qo={$$typeof:L,Provider:null,Consumer:null,_currentValue:Z,_currentValue2:Z,_threadCount:0};function yy(t,n,a,o,u,f,y,A,I){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Et(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Et(0),this.hiddenUpdates=Et(null),this.identifierPrefix=o,this.onUncaughtError=u,this.onCaughtError=f,this.onRecoverableError=y,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=I,this.incompleteTransitions=new Map}function cv(t,n,a,o,u,f,y,A,I,te,de,ve){return t=new yy(t,n,a,y,I,te,de,ve,A),n=1,f===!0&&(n|=24),f=ti(3,null,null,n),t.current=f,f.stateNode=t,n=Du(),n.refCount++,t.pooledCache=n,n.refCount++,f.memoizedState={element:o,isDehydrated:a,cache:n},Pu(f),t}function uv(t){return t?(t=ir,t):ir}function fv(t,n,a,o,u,f){u=uv(u),o.context===null?o.context=u:o.pendingContext=u,o=Ba(n),o.payload={element:a},f=f===void 0?null:f,f!==null&&(o.callback=f),a=za(t,o,n),a!==null&&(Zn(a,t,n),To(a,t,n))}function dv(t,n){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var a=t.retryLane;t.retryLane=a!==0&&a<n?a:n}}function ed(t,n){dv(t,n),(t=t.alternate)&&dv(t,n)}function hv(t){if(t.tag===13||t.tag===31){var n=Ss(t,67108864);n!==null&&Zn(n,t,67108864),ed(t,67108864)}}function pv(t){if(t.tag===13||t.tag===31){var n=ri();n=Ii(n);var a=Ss(t,n);a!==null&&Zn(a,t,n),ed(t,n)}}var gc=!0;function Sy(t,n,a,o){var u=U.T;U.T=null;var f=$.p;try{$.p=2,td(t,n,a,o)}finally{$.p=f,U.T=u}}function My(t,n,a,o){var u=U.T;U.T=null;var f=$.p;try{$.p=8,td(t,n,a,o)}finally{$.p=f,U.T=u}}function td(t,n,a,o){if(gc){var u=nd(o);if(u===null)Gf(t,n,o,vc,a),gv(t,o);else if(by(u,t,n,a,o))o.stopPropagation();else if(gv(t,o),n&4&&-1<Ey.indexOf(t)){for(;u!==null;){var f=Y(u);if(f!==null)switch(f.tag){case 3:if(f=f.stateNode,f.current.memoizedState.isDehydrated){var y=Te(f.pendingLanes);if(y!==0){var A=f;for(A.pendingLanes|=2,A.entangledLanes|=2;y;){var I=1<<31-Ge(y);A.entanglements[1]|=I,y&=~I}ki(f),(Pt&6)===0&&($l=b()+500,Go(0))}}break;case 31:case 13:A=Ss(f,2),A!==null&&Zn(A,f,2),tc(),ed(f,2)}if(f=nd(o),f===null&&Gf(t,n,o,vc,a),f===u)break;u=f}u!==null&&o.stopPropagation()}else Gf(t,n,o,null,a)}}function nd(t){return t=Ks(t),id(t)}var vc=null;function id(t){if(vc=null,t=C(t),t!==null){var n=c(t);if(n===null)t=null;else{var a=n.tag;if(a===13){if(t=d(n),t!==null)return t;t=null}else if(a===31){if(t=h(n),t!==null)return t;t=null}else if(a===3){if(n.stateNode.current.memoizedState.isDehydrated)return n.tag===3?n.stateNode.containerInfo:null;t=null}else n!==t&&(t=null)}}return vc=t,null}function mv(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(ne()){case me:return 2;case ye:return 8;case fe:case We:return 32;case Ue:return 268435456;default:return 32}default:return 32}}var ad=!1,Ya=null,Za=null,Ka=null,Yo=new Map,Zo=new Map,Qa=[],Ey="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function gv(t,n){switch(t){case"focusin":case"focusout":Ya=null;break;case"dragenter":case"dragleave":Za=null;break;case"mouseover":case"mouseout":Ka=null;break;case"pointerover":case"pointerout":Yo.delete(n.pointerId);break;case"gotpointercapture":case"lostpointercapture":Zo.delete(n.pointerId)}}function Ko(t,n,a,o,u,f){return t===null||t.nativeEvent!==f?(t={blockedOn:n,domEventName:a,eventSystemFlags:o,nativeEvent:f,targetContainers:[u]},n!==null&&(n=Y(n),n!==null&&hv(n)),t):(t.eventSystemFlags|=o,n=t.targetContainers,u!==null&&n.indexOf(u)===-1&&n.push(u),t)}function by(t,n,a,o,u){switch(n){case"focusin":return Ya=Ko(Ya,t,n,a,o,u),!0;case"dragenter":return Za=Ko(Za,t,n,a,o,u),!0;case"mouseover":return Ka=Ko(Ka,t,n,a,o,u),!0;case"pointerover":var f=u.pointerId;return Yo.set(f,Ko(Yo.get(f)||null,t,n,a,o,u)),!0;case"gotpointercapture":return f=u.pointerId,Zo.set(f,Ko(Zo.get(f)||null,t,n,a,o,u)),!0}return!1}function vv(t){var n=C(t.target);if(n!==null){var a=c(n);if(a!==null){if(n=a.tag,n===13){if(n=d(a),n!==null){t.blockedOn=n,Ki(t.priority,function(){pv(a)});return}}else if(n===31){if(n=h(a),n!==null){t.blockedOn=n,Ki(t.priority,function(){pv(a)});return}}else if(n===3&&a.stateNode.current.memoizedState.isDehydrated){t.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}t.blockedOn=null}function _c(t){if(t.blockedOn!==null)return!1;for(var n=t.targetContainers;0<n.length;){var a=nd(t.nativeEvent);if(a===null){a=t.nativeEvent;var o=new a.constructor(a.type,a);ms=o,a.target.dispatchEvent(o),ms=null}else return n=Y(a),n!==null&&hv(n),t.blockedOn=a,!1;n.shift()}return!0}function _v(t,n,a){_c(t)&&a.delete(n)}function Ty(){ad=!1,Ya!==null&&_c(Ya)&&(Ya=null),Za!==null&&_c(Za)&&(Za=null),Ka!==null&&_c(Ka)&&(Ka=null),Yo.forEach(_v),Zo.forEach(_v)}function xc(t,n){t.blockedOn===n&&(t.blockedOn=null,ad||(ad=!0,r.unstable_scheduleCallback(r.unstable_NormalPriority,Ty)))}var yc=null;function xv(t){yc!==t&&(yc=t,r.unstable_scheduleCallback(r.unstable_NormalPriority,function(){yc===t&&(yc=null);for(var n=0;n<t.length;n+=3){var a=t[n],o=t[n+1],u=t[n+2];if(typeof o!="function"){if(id(o||a)===null)continue;break}var f=Y(a);f!==null&&(t.splice(n,3),n-=3,tf(f,{pending:!0,data:u,method:a.method,action:o},o,u))}}))}function Rr(t){function n(I){return xc(I,t)}Ya!==null&&xc(Ya,t),Za!==null&&xc(Za,t),Ka!==null&&xc(Ka,t),Yo.forEach(n),Zo.forEach(n);for(var a=0;a<Qa.length;a++){var o=Qa[a];o.blockedOn===t&&(o.blockedOn=null)}for(;0<Qa.length&&(a=Qa[0],a.blockedOn===null);)vv(a),a.blockedOn===null&&Qa.shift();if(a=(t.ownerDocument||t).$$reactFormReplay,a!=null)for(o=0;o<a.length;o+=3){var u=a[o],f=a[o+1],y=u[Sn]||null;if(typeof f=="function")y||xv(a);else if(y){var A=null;if(f&&f.hasAttribute("formAction")){if(u=f,y=f[Sn]||null)A=y.formAction;else if(id(u)!==null)continue}else A=y.action;typeof A=="function"?a[o+1]=A:(a.splice(o,3),o-=3),xv(a)}}}function yv(){function t(f){f.canIntercept&&f.info==="react-transition"&&f.intercept({handler:function(){return new Promise(function(y){return u=y})},focusReset:"manual",scroll:"manual"})}function n(){u!==null&&(u(),u=null),o||setTimeout(a,20)}function a(){if(!o&&!navigation.transition){var f=navigation.currentEntry;f&&f.url!=null&&navigation.navigate(f.url,{state:f.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var o=!1,u=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",n),navigation.addEventListener("navigateerror",n),setTimeout(a,100),function(){o=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",n),navigation.removeEventListener("navigateerror",n),u!==null&&(u(),u=null)}}}function sd(t){this._internalRoot=t}Sc.prototype.render=sd.prototype.render=function(t){var n=this._internalRoot;if(n===null)throw Error(s(409));var a=n.current,o=ri();fv(a,o,t,n,null,null)},Sc.prototype.unmount=sd.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var n=t.containerInfo;fv(t.current,2,null,t,null,null),tc(),n[Ei]=null}};function Sc(t){this._internalRoot=t}Sc.prototype.unstable_scheduleHydration=function(t){if(t){var n=fs();t={blockedOn:null,target:t,priority:n};for(var a=0;a<Qa.length&&n!==0&&n<Qa[a].priority;a++);Qa.splice(a,0,t),a===0&&vv(t)}};var Sv=e.version;if(Sv!=="19.2.7")throw Error(s(527,Sv,"19.2.7"));$.findDOMNode=function(t){var n=t._reactInternals;if(n===void 0)throw typeof t.render=="function"?Error(s(188)):(t=Object.keys(t).join(","),Error(s(268,t)));return t=m(n),t=t!==null?_(t):null,t=t===null?null:t.stateNode,t};var Ay={bundleType:0,version:"19.2.7",rendererPackageName:"react-dom",currentDispatcherRef:U,reconcilerVersion:"19.2.7"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Mc=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Mc.isDisabled&&Mc.supportsFiber)try{Se=Mc.inject(Ay),Ne=Mc}catch{}}return Jo.createRoot=function(t,n){if(!l(t))throw Error(s(299));var a=!1,o="",u=Cm,f=wm,y=Nm;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onUncaughtError!==void 0&&(u=n.onUncaughtError),n.onCaughtError!==void 0&&(f=n.onCaughtError),n.onRecoverableError!==void 0&&(y=n.onRecoverableError)),n=cv(t,1,!1,null,null,a,o,null,u,f,y,yv),t[Ei]=n.current,Hf(t),new sd(n)},Jo.hydrateRoot=function(t,n,a){if(!l(t))throw Error(s(299));var o=!1,u="",f=Cm,y=wm,A=Nm,I=null;return a!=null&&(a.unstable_strictMode===!0&&(o=!0),a.identifierPrefix!==void 0&&(u=a.identifierPrefix),a.onUncaughtError!==void 0&&(f=a.onUncaughtError),a.onCaughtError!==void 0&&(y=a.onCaughtError),a.onRecoverableError!==void 0&&(A=a.onRecoverableError),a.formState!==void 0&&(I=a.formState)),n=cv(t,1,!0,n,a??null,o,u,I,f,y,A,yv),n.context=uv(null),a=n.current,o=ri(),o=Ii(o),u=Ba(o),u.callback=null,za(a,u,o),a=o,n.current.lanes=a,yn(n,a),ki(n),t[Ei]=n.current,Hf(t),new Sc(n)},Jo.version="19.2.7",Jo}var Dv;function By(){if(Dv)return ld.exports;Dv=1;function r(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(r)}catch(e){console.error(e)}}return r(),ld.exports=Py(),ld.exports}var zy=By();const Iy=V_(zy),Uv=r=>{let e;const i=new Set,s=(m,_)=>{const x=typeof m=="function"?m(e):m;if(!Object.is(x,e)){const S=e;e=_??(typeof x!="object"||x===null)?x:Object.assign({},e,x),i.forEach(M=>M(e,S))}},l=()=>e,h={setState:s,getState:l,getInitialState:()=>p,subscribe:m=>(i.add(m),()=>i.delete(m))},p=e=r(s,l,h);return h},Fy=(r=>r?Uv(r):Uv),Hy=r=>r;function Gy(r,e=Hy){const i=sl.useSyncExternalStore(r.subscribe,sl.useCallback(()=>e(r.getState()),[r,e]),sl.useCallback(()=>e(r.getInitialState()),[r,e]));return sl.useDebugValue(i),i}const Vy=r=>{const e=Fy(r),i=s=>Gy(e,s);return Object.assign(i,e),i},jy=(r=>Vy),ky=r=>(e,i,s)=>{const l=s.subscribe;return s.subscribe=((d,h,p)=>{let m=d;if(h){const _=p?.equalityFn||Object.is;let x=d(s.getState());m=S=>{const M=d(S);if(!_(x,M)){const T=x;h(x=M,T)}},p?.fireImmediately&&h(x,x)}return l(m)}),r(e,i,s)},Xy=ky;function j_(r,e){let i;try{i=r()}catch{return}return{getItem:l=>{var c;const d=p=>p===null?null:JSON.parse(p,void 0),h=(c=i.getItem(l))!=null?c:null;return h instanceof Promise?h.then(d):d(h)},setItem:(l,c)=>i.setItem(l,JSON.stringify(c,void 0)),removeItem:l=>i.removeItem(l)}}const kd=r=>e=>{try{const i=r(e);return i instanceof Promise?i:{then(s){return kd(s)(i)},catch(s){return this}}}catch(i){return{then(s){return this},catch(s){return kd(s)(i)}}}},Wy=(r,e)=>(i,s,l)=>{let c={storage:j_(()=>window.localStorage),partialize:E=>E,version:0,merge:(E,v)=>({...v,...E}),...e},d=!1,h=0;const p=new Set,m=new Set;let _=c.storage;if(!_)return r((...E)=>{console.warn(`[zustand persist middleware] Unable to update item '${c.name}', the given storage is currently unavailable.`),i(...E)},s,l);const x=()=>{const E=c.partialize({...s()});return _.setItem(c.name,{state:E,version:c.version})},S=l.setState;l.setState=(E,v)=>(S(E,v),x());const M=r((...E)=>(i(...E),x()),s,l);l.getInitialState=()=>M;let T;const R=()=>{var E,v;if(!_)return;const B=++h;d=!1,p.forEach(N=>{var W;return N((W=s())!=null?W:M)});const L=((v=c.onRehydrateStorage)==null?void 0:v.call(c,(E=s())!=null?E:M))||void 0;return kd(_.getItem.bind(_))(c.name).then(N=>{if(N)if(typeof N.version=="number"&&N.version!==c.version){if(c.migrate){const W=c.migrate(N.state,N.version);return W instanceof Promise?W.then(G=>[!0,G]):[!0,W]}console.error("State loaded from storage couldn't be migrated since no migrate function was provided")}else return[!1,N.state];return[!1,void 0]}).then(N=>{var W;if(B!==h)return;const[G,z]=N;if(T=c.merge(z,(W=s())!=null?W:M),i(T,!0),G)return x()}).then(()=>{B===h&&(L?.(s(),void 0),T=s(),d=!0,m.forEach(N=>N(T)))}).catch(N=>{B===h&&L?.(void 0,N)})};return l.persist={setOptions:E=>{c={...c,...E},E.storage&&(_=E.storage)},clearStorage:()=>{_?.removeItem(c.name)},getOptions:()=>c,rehydrate:()=>R(),hasHydrated:()=>d,onHydrate:E=>(p.add(E),()=>{p.delete(E)}),onFinishHydration:E=>(m.add(E),()=>{m.delete(E)})},c.skipHydration||R(),T||M},qy=Wy,Lv={cube:{name:"Cube",color:"#4f8cff"},sphere:{name:"Sphere",color:"#3DFFA0"},torus:{name:"Torus",color:"#FF7AE0"}},Ov=[0,0,0],Yy=[1,1,1],Zy=()=>typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`entity-${Date.now()}-${Math.random().toString(36).slice(2,10)}`,k_=r=>({id:Zy(),type:r,name:Lv[r].name,position:[...Ov],rotation:[...Ov],scale:[...Yy],color:Lv[r].color,visible:!0,locked:!1}),dd=[k_("cube")],Xr=r=>[r[0],r[1],r[2]],$o=r=>({...r,position:Xr(r.position),rotation:Xr(r.rotation),scale:Xr(r.scale),visible:r.visible??!0,locked:r.locked??!1}),dt=jy()(Xy(qy(r=>({entities:dd.map($o),selectedEntityId:null,currentPublishId:null,addEntity:e=>r(i=>{const s=k_(e);return{entities:[...i.entities,s],selectedEntityId:s.id}}),removeEntity:e=>r(i=>({entities:i.entities.filter(s=>s.id!==e),selectedEntityId:i.selectedEntityId===e?null:i.selectedEntityId})),updateEntityTransform:(e,i)=>r(s=>({entities:s.entities.map(l=>l.id===e?{...l,...i.position?{position:Xr(i.position)}:null,...i.rotation?{rotation:Xr(i.rotation)}:null,...i.scale?{scale:Xr(i.scale)}:null,...i.color?{color:i.color}:null}:l)})),selectEntity:e=>r({selectedEntityId:e}),setCurrentPublishId:e=>r({currentPublishId:e}),toggleVisibility:e=>r(i=>({entities:i.entities.map(s=>s.id===e?{...s,visible:!s.visible}:s)})),toggleLock:e=>r(i=>({entities:i.entities.map(s=>s.id===e?{...s,locked:!s.locked}:s),selectedEntityId:i.selectedEntityId===e?null:i.selectedEntityId})),renameEntity:(e,i)=>r(s=>({entities:s.entities.map(l=>l.id===e?{...l,name:i}:l)})),bgColor:"#0b1020",gridPlane:"Floor (XZ)",wireframe:!1,lightIntensity:.75,lightColor:"#ffffff",fogEnabled:!1,setBgColor:e=>r({bgColor:e}),setGridPlane:e=>r({gridPlane:e}),setWireframe:e=>r({wireframe:e}),setLightIntensity:e=>r({lightIntensity:e}),setLightColor:e=>r({lightColor:e}),setFogEnabled:e=>r({fogEnabled:e})}),{name:"libre3d-scene-state",version:2,storage:j_(()=>localStorage),partialize:r=>({entities:r.entities,selectedEntityId:r.selectedEntityId,currentPublishId:r.currentPublishId,bgColor:r.bgColor,gridPlane:r.gridPlane,wireframe:r.wireframe,lightIntensity:r.lightIntensity,lightColor:r.lightColor,fogEnabled:r.fogEnabled}),migrate:r=>{const e=r,i=e&&"objects"in e?e.objects:void 0,s=Array.isArray(i)?i:[],l=e&&"entities"in e&&Array.isArray(e.entities)?e.entities:s;return{entities:l.length>0?l.map($o):dd.map($o),selectedEntityId:e?.selectedEntityId??null,currentPublishId:e?.currentPublishId??null,bgColor:e?.bgColor??"#0b1020",gridPlane:e?.gridPlane??"Floor (XZ)",wireframe:e?.wireframe??!1,lightIntensity:e?.lightIntensity??.75,lightColor:e?.lightColor??"#ffffff",fogEnabled:e?.fogEnabled??!1}},merge:(r,e)=>{const i=r,s=Array.isArray(i?.entities)?i.entities:e.entities;return{...e,...i,entities:s.length>0?s.map($o):dd.map($o),selectedEntityId:i?.selectedEntityId??e.selectedEntityId??null,currentPublishId:i?.currentPublishId??e.currentPublishId??null,bgColor:i?.bgColor??e.bgColor,gridPlane:i?.gridPlane??e.gridPlane,wireframe:i?.wireframe??e.wireframe,lightIntensity:i?.lightIntensity??e.lightIntensity,lightColor:i?.lightColor??e.lightColor,fogEnabled:i?.fogEnabled??e.fogEnabled}}}))),Ky=({visible:r})=>g.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"15",height:"15",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:r?g.jsxs(g.Fragment,{children:[g.jsx("path",{d:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"}),g.jsx("circle",{cx:"12",cy:"12",r:"3"})]}):g.jsxs(g.Fragment,{children:[g.jsx("path",{d:"M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"}),g.jsx("line",{x1:"1",y1:"1",x2:"23",y2:"23"})]})}),Qy=({locked:r})=>g.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"15",height:"15",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:r?g.jsxs(g.Fragment,{children:[g.jsx("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"}),g.jsx("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})]}):g.jsxs(g.Fragment,{children:[g.jsx("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"}),g.jsx("path",{d:"M7 11V7a5 5 0 0 1 9.9-1"})]})});function Jy({entityId:r}){const e=dt(v=>v.entities.find(B=>B.id===r)),i=dt(v=>v.selectedEntityId),s=dt(v=>v.selectEntity),l=dt(v=>v.removeEntity),c=dt(v=>v.toggleVisibility),d=dt(v=>v.toggleLock),h=dt(v=>v.renameEntity),[p,m]=we.useState(!1),[_,x]=we.useState(""),S=we.useRef(null);if(we.useEffect(()=>{p&&S.current&&(S.current.focus(),S.current.select())},[p]),!e)return null;const M=e.id===i,T=v=>{v.stopPropagation(),!e.locked&&(x(e.name),m(!0))},R=v=>{v.key==="Enter"?E():v.key==="Escape"&&m(!1)},E=()=>{const v=_.trim();v&&h(e.id,v),m(!1)};return g.jsx("div",{className:`editor-tree-item${M?" editor-tree-item--selected":""}${e.locked?" editor-tree-item--locked":""}`,style:{paddingLeft:"0.85rem"},children:g.jsxs("div",{className:"editor-tree-main-row",children:[p?g.jsx("input",{ref:S,className:"hierarchy-rename-input",type:"text",value:_,onChange:v=>x(v.target.value),onBlur:E,onKeyDown:R}):g.jsxs("button",{className:"editor-tree-select",type:"button",onClick:()=>s(e.id),onDoubleClick:T,children:[g.jsx("span",{className:"editor-tree-name",children:e.name}),g.jsx("span",{className:"editor-tree-type",children:e.type})]}),g.jsxs("div",{className:"hierarchy-item-actions",children:[g.jsx("button",{className:`hierarchy-action-btn${e.visible?"":" inactive"}`,type:"button","aria-label":e.visible?"Hide entity":"Show entity",onClick:v=>{v.stopPropagation(),c(e.id)},children:g.jsx(Ky,{visible:e.visible})}),g.jsx("button",{className:`hierarchy-action-btn${e.locked?" active-locked":""}`,type:"button","aria-label":e.locked?"Unlock entity":"Lock entity",onClick:v=>{v.stopPropagation(),d(e.id)},children:g.jsx(Qy,{locked:e.locked})}),g.jsx("button",{className:"editor-tree-delete",type:"button","aria-label":`Delete ${e.name}`,disabled:e.locked,onClick:v=>{v.stopPropagation(),l(e.id)},children:"×"})]})]})})}function $y({searchQuery:r=""}){const i=(dt(s=>s.entities)??[]).filter(s=>s.name.toLowerCase().includes(r.toLowerCase())||s.type.toLowerCase().includes(r.toLowerCase()));return g.jsx("div",{style:{display:"grid",gap:"0.85rem"},children:g.jsx("div",{className:"editor-tree","aria-label":"Scene hierarchy",children:i.map(s=>g.jsx(Jy,{entityId:s.id},s.id))})})}const Lh="178",eS=0,Pv=1,tS=2,X_=1,nS=2,Ma=3,ls=0,Kn=1,Ea=2,rs=0,Wr=1,Bv=2,zv=3,Iv=4,iS=5,Vs=100,aS=101,sS=102,rS=103,oS=104,lS=200,cS=201,uS=202,fS=203,Xd=204,Wd=205,dS=206,hS=207,pS=208,mS=209,gS=210,vS=211,_S=212,xS=213,yS=214,qd=0,Yd=1,Zd=2,Zr=3,Kd=4,Qd=5,Jd=6,$d=7,W_=0,SS=1,MS=2,os=0,ES=1,bS=2,TS=3,AS=4,RS=5,CS=6,wS=7,q_=300,Kr=301,Qr=302,eh=303,th=304,au=306,nh=1e3,ks=1001,ih=1002,Bi=1003,NS=1004,Ec=1005,Wi=1006,hd=1007,Xs=1008,Yi=1009,Y_=1010,Z_=1011,ul=1012,Oh=1013,Ws=1014,ba=1015,ml=1016,Ph=1017,Bh=1018,fl=1020,K_=35902,Q_=1021,J_=1022,Oi=1023,dl=1026,hl=1027,$_=1028,zh=1029,e0=1030,Ih=1031,Fh=1033,qc=33776,Yc=33777,Zc=33778,Kc=33779,ah=35840,sh=35841,rh=35842,oh=35843,lh=36196,ch=37492,uh=37496,fh=37808,dh=37809,hh=37810,ph=37811,mh=37812,gh=37813,vh=37814,_h=37815,xh=37816,yh=37817,Sh=37818,Mh=37819,Eh=37820,bh=37821,Qc=36492,Th=36494,Ah=36495,t0=36283,Rh=36284,Ch=36285,wh=36286,iR=2300,aR=2301,DS=3200,US=3201,n0=0,LS=1,ss="",ci="srgb",Jr="srgb-linear",$c="linear",Zt="srgb",Cr=7680,Fv=519,OS=512,PS=513,BS=514,i0=515,zS=516,IS=517,FS=518,HS=519,Hv=35044,Gv="300 es",Ta=2e3,eu=2001;class eo{addEventListener(e,i){this._listeners===void 0&&(this._listeners={});const s=this._listeners;s[e]===void 0&&(s[e]=[]),s[e].indexOf(i)===-1&&s[e].push(i)}hasEventListener(e,i){const s=this._listeners;return s===void 0?!1:s[e]!==void 0&&s[e].indexOf(i)!==-1}removeEventListener(e,i){const s=this._listeners;if(s===void 0)return;const l=s[e];if(l!==void 0){const c=l.indexOf(i);c!==-1&&l.splice(c,1)}}dispatchEvent(e){const i=this._listeners;if(i===void 0)return;const s=i[e.type];if(s!==void 0){e.target=this;const l=s.slice(0);for(let c=0,d=l.length;c<d;c++)l[c].call(this,e);e.target=null}}}const In=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Vv=1234567;const ol=Math.PI/180,pl=180/Math.PI;function to(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(In[r&255]+In[r>>8&255]+In[r>>16&255]+In[r>>24&255]+"-"+In[e&255]+In[e>>8&255]+"-"+In[e>>16&15|64]+In[e>>24&255]+"-"+In[i&63|128]+In[i>>8&255]+"-"+In[i>>16&255]+In[i>>24&255]+In[s&255]+In[s>>8&255]+In[s>>16&255]+In[s>>24&255]).toLowerCase()}function At(r,e,i){return Math.max(e,Math.min(i,r))}function Hh(r,e){return(r%e+e)%e}function GS(r,e,i,s,l){return s+(r-e)*(l-s)/(i-e)}function VS(r,e,i){return r!==e?(i-r)/(e-r):0}function ll(r,e,i){return(1-i)*r+i*e}function jS(r,e,i,s){return ll(r,e,1-Math.exp(-i*s))}function kS(r,e=1){return e-Math.abs(Hh(r,e*2)-e)}function XS(r,e,i){return r<=e?0:r>=i?1:(r=(r-e)/(i-e),r*r*(3-2*r))}function WS(r,e,i){return r<=e?0:r>=i?1:(r=(r-e)/(i-e),r*r*r*(r*(r*6-15)+10))}function qS(r,e){return r+Math.floor(Math.random()*(e-r+1))}function YS(r,e){return r+Math.random()*(e-r)}function ZS(r){return r*(.5-Math.random())}function KS(r){r!==void 0&&(Vv=r);let e=Vv+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function QS(r){return r*ol}function JS(r){return r*pl}function $S(r){return(r&r-1)===0&&r!==0}function eM(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function tM(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function nM(r,e,i,s,l){const c=Math.cos,d=Math.sin,h=c(i/2),p=d(i/2),m=c((e+s)/2),_=d((e+s)/2),x=c((e-s)/2),S=d((e-s)/2),M=c((s-e)/2),T=d((s-e)/2);switch(l){case"XYX":r.set(h*_,p*x,p*S,h*m);break;case"YZY":r.set(p*S,h*_,p*x,h*m);break;case"ZXZ":r.set(p*x,p*S,h*_,h*m);break;case"XZX":r.set(h*_,p*T,p*M,h*m);break;case"YXY":r.set(p*M,h*_,p*T,h*m);break;case"ZYZ":r.set(p*T,p*M,h*_,h*m);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+l)}}function Vr(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function Gn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const sR={DEG2RAD:ol,RAD2DEG:pl,generateUUID:to,clamp:At,euclideanModulo:Hh,mapLinear:GS,inverseLerp:VS,lerp:ll,damp:jS,pingpong:kS,smoothstep:XS,smootherstep:WS,randInt:qS,randFloat:YS,randFloatSpread:ZS,seededRandom:KS,degToRad:QS,radToDeg:JS,isPowerOfTwo:$S,ceilPowerOfTwo:eM,floorPowerOfTwo:tM,setQuaternionFromProperEuler:nM,normalize:Gn,denormalize:Vr};class Bt{constructor(e=0,i=0){Bt.prototype.isVector2=!0,this.x=e,this.y=i}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,i){return this.x=e,this.y=i,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,i){switch(e){case 0:this.x=i;break;case 1:this.y=i;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,i){return this.x=e.x+i.x,this.y=e.y+i.y,this}addScaledVector(e,i){return this.x+=e.x*i,this.y+=e.y*i,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,i){return this.x=e.x-i.x,this.y=e.y-i.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const i=this.x,s=this.y,l=e.elements;return this.x=l[0]*i+l[3]*s+l[6],this.y=l[1]*i+l[4]*s+l[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,i){return this.x=At(this.x,e.x,i.x),this.y=At(this.y,e.y,i.y),this}clampScalar(e,i){return this.x=At(this.x,e,i),this.y=At(this.y,e,i),this}clampLength(e,i){const s=this.length();return this.divideScalar(s||1).multiplyScalar(At(s,e,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const i=Math.sqrt(this.lengthSq()*e.lengthSq());if(i===0)return Math.PI/2;const s=this.dot(e)/i;return Math.acos(At(s,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const i=this.x-e.x,s=this.y-e.y;return i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,i){return this.x+=(e.x-this.x)*i,this.y+=(e.y-this.y)*i,this}lerpVectors(e,i,s){return this.x=e.x+(i.x-e.x)*s,this.y=e.y+(i.y-e.y)*s,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,i=0){return this.x=e[i],this.y=e[i+1],this}toArray(e=[],i=0){return e[i]=this.x,e[i+1]=this.y,e}fromBufferAttribute(e,i){return this.x=e.getX(i),this.y=e.getY(i),this}rotateAround(e,i){const s=Math.cos(i),l=Math.sin(i),c=this.x-e.x,d=this.y-e.y;return this.x=c*s-d*l+e.x,this.y=c*l+d*s+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class gl{constructor(e=0,i=0,s=0,l=1){this.isQuaternion=!0,this._x=e,this._y=i,this._z=s,this._w=l}static slerpFlat(e,i,s,l,c,d,h){let p=s[l+0],m=s[l+1],_=s[l+2],x=s[l+3];const S=c[d+0],M=c[d+1],T=c[d+2],R=c[d+3];if(h===0){e[i+0]=p,e[i+1]=m,e[i+2]=_,e[i+3]=x;return}if(h===1){e[i+0]=S,e[i+1]=M,e[i+2]=T,e[i+3]=R;return}if(x!==R||p!==S||m!==M||_!==T){let E=1-h;const v=p*S+m*M+_*T+x*R,B=v>=0?1:-1,L=1-v*v;if(L>Number.EPSILON){const W=Math.sqrt(L),G=Math.atan2(W,v*B);E=Math.sin(E*G)/W,h=Math.sin(h*G)/W}const N=h*B;if(p=p*E+S*N,m=m*E+M*N,_=_*E+T*N,x=x*E+R*N,E===1-h){const W=1/Math.sqrt(p*p+m*m+_*_+x*x);p*=W,m*=W,_*=W,x*=W}}e[i]=p,e[i+1]=m,e[i+2]=_,e[i+3]=x}static multiplyQuaternionsFlat(e,i,s,l,c,d){const h=s[l],p=s[l+1],m=s[l+2],_=s[l+3],x=c[d],S=c[d+1],M=c[d+2],T=c[d+3];return e[i]=h*T+_*x+p*M-m*S,e[i+1]=p*T+_*S+m*x-h*M,e[i+2]=m*T+_*M+h*S-p*x,e[i+3]=_*T-h*x-p*S-m*M,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,i,s,l){return this._x=e,this._y=i,this._z=s,this._w=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,i=!0){const s=e._x,l=e._y,c=e._z,d=e._order,h=Math.cos,p=Math.sin,m=h(s/2),_=h(l/2),x=h(c/2),S=p(s/2),M=p(l/2),T=p(c/2);switch(d){case"XYZ":this._x=S*_*x+m*M*T,this._y=m*M*x-S*_*T,this._z=m*_*T+S*M*x,this._w=m*_*x-S*M*T;break;case"YXZ":this._x=S*_*x+m*M*T,this._y=m*M*x-S*_*T,this._z=m*_*T-S*M*x,this._w=m*_*x+S*M*T;break;case"ZXY":this._x=S*_*x-m*M*T,this._y=m*M*x+S*_*T,this._z=m*_*T+S*M*x,this._w=m*_*x-S*M*T;break;case"ZYX":this._x=S*_*x-m*M*T,this._y=m*M*x+S*_*T,this._z=m*_*T-S*M*x,this._w=m*_*x+S*M*T;break;case"YZX":this._x=S*_*x+m*M*T,this._y=m*M*x+S*_*T,this._z=m*_*T-S*M*x,this._w=m*_*x-S*M*T;break;case"XZY":this._x=S*_*x-m*M*T,this._y=m*M*x-S*_*T,this._z=m*_*T+S*M*x,this._w=m*_*x+S*M*T;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+d)}return i===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,i){const s=i/2,l=Math.sin(s);return this._x=e.x*l,this._y=e.y*l,this._z=e.z*l,this._w=Math.cos(s),this._onChangeCallback(),this}setFromRotationMatrix(e){const i=e.elements,s=i[0],l=i[4],c=i[8],d=i[1],h=i[5],p=i[9],m=i[2],_=i[6],x=i[10],S=s+h+x;if(S>0){const M=.5/Math.sqrt(S+1);this._w=.25/M,this._x=(_-p)*M,this._y=(c-m)*M,this._z=(d-l)*M}else if(s>h&&s>x){const M=2*Math.sqrt(1+s-h-x);this._w=(_-p)/M,this._x=.25*M,this._y=(l+d)/M,this._z=(c+m)/M}else if(h>x){const M=2*Math.sqrt(1+h-s-x);this._w=(c-m)/M,this._x=(l+d)/M,this._y=.25*M,this._z=(p+_)/M}else{const M=2*Math.sqrt(1+x-s-h);this._w=(d-l)/M,this._x=(c+m)/M,this._y=(p+_)/M,this._z=.25*M}return this._onChangeCallback(),this}setFromUnitVectors(e,i){let s=e.dot(i)+1;return s<1e-8?(s=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=s):(this._x=0,this._y=-e.z,this._z=e.y,this._w=s)):(this._x=e.y*i.z-e.z*i.y,this._y=e.z*i.x-e.x*i.z,this._z=e.x*i.y-e.y*i.x,this._w=s),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(At(this.dot(e),-1,1)))}rotateTowards(e,i){const s=this.angleTo(e);if(s===0)return this;const l=Math.min(1,i/s);return this.slerp(e,l),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,i){const s=e._x,l=e._y,c=e._z,d=e._w,h=i._x,p=i._y,m=i._z,_=i._w;return this._x=s*_+d*h+l*m-c*p,this._y=l*_+d*p+c*h-s*m,this._z=c*_+d*m+s*p-l*h,this._w=d*_-s*h-l*p-c*m,this._onChangeCallback(),this}slerp(e,i){if(i===0)return this;if(i===1)return this.copy(e);const s=this._x,l=this._y,c=this._z,d=this._w;let h=d*e._w+s*e._x+l*e._y+c*e._z;if(h<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,h=-h):this.copy(e),h>=1)return this._w=d,this._x=s,this._y=l,this._z=c,this;const p=1-h*h;if(p<=Number.EPSILON){const M=1-i;return this._w=M*d+i*this._w,this._x=M*s+i*this._x,this._y=M*l+i*this._y,this._z=M*c+i*this._z,this.normalize(),this}const m=Math.sqrt(p),_=Math.atan2(m,h),x=Math.sin((1-i)*_)/m,S=Math.sin(i*_)/m;return this._w=d*x+this._w*S,this._x=s*x+this._x*S,this._y=l*x+this._y*S,this._z=c*x+this._z*S,this._onChangeCallback(),this}slerpQuaternions(e,i,s){return this.copy(e).slerp(i,s)}random(){const e=2*Math.PI*Math.random(),i=2*Math.PI*Math.random(),s=Math.random(),l=Math.sqrt(1-s),c=Math.sqrt(s);return this.set(l*Math.sin(e),l*Math.cos(e),c*Math.sin(i),c*Math.cos(i))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,i=0){return this._x=e[i],this._y=e[i+1],this._z=e[i+2],this._w=e[i+3],this._onChangeCallback(),this}toArray(e=[],i=0){return e[i]=this._x,e[i+1]=this._y,e[i+2]=this._z,e[i+3]=this._w,e}fromBufferAttribute(e,i){return this._x=e.getX(i),this._y=e.getY(i),this._z=e.getZ(i),this._w=e.getW(i),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class ae{constructor(e=0,i=0,s=0){ae.prototype.isVector3=!0,this.x=e,this.y=i,this.z=s}set(e,i,s){return s===void 0&&(s=this.z),this.x=e,this.y=i,this.z=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,i){switch(e){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,i){return this.x=e.x+i.x,this.y=e.y+i.y,this.z=e.z+i.z,this}addScaledVector(e,i){return this.x+=e.x*i,this.y+=e.y*i,this.z+=e.z*i,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,i){return this.x=e.x-i.x,this.y=e.y-i.y,this.z=e.z-i.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,i){return this.x=e.x*i.x,this.y=e.y*i.y,this.z=e.z*i.z,this}applyEuler(e){return this.applyQuaternion(jv.setFromEuler(e))}applyAxisAngle(e,i){return this.applyQuaternion(jv.setFromAxisAngle(e,i))}applyMatrix3(e){const i=this.x,s=this.y,l=this.z,c=e.elements;return this.x=c[0]*i+c[3]*s+c[6]*l,this.y=c[1]*i+c[4]*s+c[7]*l,this.z=c[2]*i+c[5]*s+c[8]*l,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const i=this.x,s=this.y,l=this.z,c=e.elements,d=1/(c[3]*i+c[7]*s+c[11]*l+c[15]);return this.x=(c[0]*i+c[4]*s+c[8]*l+c[12])*d,this.y=(c[1]*i+c[5]*s+c[9]*l+c[13])*d,this.z=(c[2]*i+c[6]*s+c[10]*l+c[14])*d,this}applyQuaternion(e){const i=this.x,s=this.y,l=this.z,c=e.x,d=e.y,h=e.z,p=e.w,m=2*(d*l-h*s),_=2*(h*i-c*l),x=2*(c*s-d*i);return this.x=i+p*m+d*x-h*_,this.y=s+p*_+h*m-c*x,this.z=l+p*x+c*_-d*m,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const i=this.x,s=this.y,l=this.z,c=e.elements;return this.x=c[0]*i+c[4]*s+c[8]*l,this.y=c[1]*i+c[5]*s+c[9]*l,this.z=c[2]*i+c[6]*s+c[10]*l,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,i){return this.x=At(this.x,e.x,i.x),this.y=At(this.y,e.y,i.y),this.z=At(this.z,e.z,i.z),this}clampScalar(e,i){return this.x=At(this.x,e,i),this.y=At(this.y,e,i),this.z=At(this.z,e,i),this}clampLength(e,i){const s=this.length();return this.divideScalar(s||1).multiplyScalar(At(s,e,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,i){return this.x+=(e.x-this.x)*i,this.y+=(e.y-this.y)*i,this.z+=(e.z-this.z)*i,this}lerpVectors(e,i,s){return this.x=e.x+(i.x-e.x)*s,this.y=e.y+(i.y-e.y)*s,this.z=e.z+(i.z-e.z)*s,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,i){const s=e.x,l=e.y,c=e.z,d=i.x,h=i.y,p=i.z;return this.x=l*p-c*h,this.y=c*d-s*p,this.z=s*h-l*d,this}projectOnVector(e){const i=e.lengthSq();if(i===0)return this.set(0,0,0);const s=e.dot(this)/i;return this.copy(e).multiplyScalar(s)}projectOnPlane(e){return pd.copy(this).projectOnVector(e),this.sub(pd)}reflect(e){return this.sub(pd.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const i=Math.sqrt(this.lengthSq()*e.lengthSq());if(i===0)return Math.PI/2;const s=this.dot(e)/i;return Math.acos(At(s,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const i=this.x-e.x,s=this.y-e.y,l=this.z-e.z;return i*i+s*s+l*l}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,i,s){const l=Math.sin(i)*e;return this.x=l*Math.sin(s),this.y=Math.cos(i)*e,this.z=l*Math.cos(s),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,i,s){return this.x=e*Math.sin(i),this.y=s,this.z=e*Math.cos(i),this}setFromMatrixPosition(e){const i=e.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this}setFromMatrixScale(e){const i=this.setFromMatrixColumn(e,0).length(),s=this.setFromMatrixColumn(e,1).length(),l=this.setFromMatrixColumn(e,2).length();return this.x=i,this.y=s,this.z=l,this}setFromMatrixColumn(e,i){return this.fromArray(e.elements,i*4)}setFromMatrix3Column(e,i){return this.fromArray(e.elements,i*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,i=0){return this.x=e[i],this.y=e[i+1],this.z=e[i+2],this}toArray(e=[],i=0){return e[i]=this.x,e[i+1]=this.y,e[i+2]=this.z,e}fromBufferAttribute(e,i){return this.x=e.getX(i),this.y=e.getY(i),this.z=e.getZ(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,i=Math.random()*2-1,s=Math.sqrt(1-i*i);return this.x=s*Math.cos(e),this.y=i,this.z=s*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const pd=new ae,jv=new gl;class ht{constructor(e,i,s,l,c,d,h,p,m){ht.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,i,s,l,c,d,h,p,m)}set(e,i,s,l,c,d,h,p,m){const _=this.elements;return _[0]=e,_[1]=l,_[2]=h,_[3]=i,_[4]=c,_[5]=p,_[6]=s,_[7]=d,_[8]=m,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const i=this.elements,s=e.elements;return i[0]=s[0],i[1]=s[1],i[2]=s[2],i[3]=s[3],i[4]=s[4],i[5]=s[5],i[6]=s[6],i[7]=s[7],i[8]=s[8],this}extractBasis(e,i,s){return e.setFromMatrix3Column(this,0),i.setFromMatrix3Column(this,1),s.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const i=e.elements;return this.set(i[0],i[4],i[8],i[1],i[5],i[9],i[2],i[6],i[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,i){const s=e.elements,l=i.elements,c=this.elements,d=s[0],h=s[3],p=s[6],m=s[1],_=s[4],x=s[7],S=s[2],M=s[5],T=s[8],R=l[0],E=l[3],v=l[6],B=l[1],L=l[4],N=l[7],W=l[2],G=l[5],z=l[8];return c[0]=d*R+h*B+p*W,c[3]=d*E+h*L+p*G,c[6]=d*v+h*N+p*z,c[1]=m*R+_*B+x*W,c[4]=m*E+_*L+x*G,c[7]=m*v+_*N+x*z,c[2]=S*R+M*B+T*W,c[5]=S*E+M*L+T*G,c[8]=S*v+M*N+T*z,this}multiplyScalar(e){const i=this.elements;return i[0]*=e,i[3]*=e,i[6]*=e,i[1]*=e,i[4]*=e,i[7]*=e,i[2]*=e,i[5]*=e,i[8]*=e,this}determinant(){const e=this.elements,i=e[0],s=e[1],l=e[2],c=e[3],d=e[4],h=e[5],p=e[6],m=e[7],_=e[8];return i*d*_-i*h*m-s*c*_+s*h*p+l*c*m-l*d*p}invert(){const e=this.elements,i=e[0],s=e[1],l=e[2],c=e[3],d=e[4],h=e[5],p=e[6],m=e[7],_=e[8],x=_*d-h*m,S=h*p-_*c,M=m*c-d*p,T=i*x+s*S+l*M;if(T===0)return this.set(0,0,0,0,0,0,0,0,0);const R=1/T;return e[0]=x*R,e[1]=(l*m-_*s)*R,e[2]=(h*s-l*d)*R,e[3]=S*R,e[4]=(_*i-l*p)*R,e[5]=(l*c-h*i)*R,e[6]=M*R,e[7]=(s*p-m*i)*R,e[8]=(d*i-s*c)*R,this}transpose(){let e;const i=this.elements;return e=i[1],i[1]=i[3],i[3]=e,e=i[2],i[2]=i[6],i[6]=e,e=i[5],i[5]=i[7],i[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const i=this.elements;return e[0]=i[0],e[1]=i[3],e[2]=i[6],e[3]=i[1],e[4]=i[4],e[5]=i[7],e[6]=i[2],e[7]=i[5],e[8]=i[8],this}setUvTransform(e,i,s,l,c,d,h){const p=Math.cos(c),m=Math.sin(c);return this.set(s*p,s*m,-s*(p*d+m*h)+d+e,-l*m,l*p,-l*(-m*d+p*h)+h+i,0,0,1),this}scale(e,i){return this.premultiply(md.makeScale(e,i)),this}rotate(e){return this.premultiply(md.makeRotation(-e)),this}translate(e,i){return this.premultiply(md.makeTranslation(e,i)),this}makeTranslation(e,i){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,i,0,0,1),this}makeRotation(e){const i=Math.cos(e),s=Math.sin(e);return this.set(i,-s,0,s,i,0,0,0,1),this}makeScale(e,i){return this.set(e,0,0,0,i,0,0,0,1),this}equals(e){const i=this.elements,s=e.elements;for(let l=0;l<9;l++)if(i[l]!==s[l])return!1;return!0}fromArray(e,i=0){for(let s=0;s<9;s++)this.elements[s]=e[s+i];return this}toArray(e=[],i=0){const s=this.elements;return e[i]=s[0],e[i+1]=s[1],e[i+2]=s[2],e[i+3]=s[3],e[i+4]=s[4],e[i+5]=s[5],e[i+6]=s[6],e[i+7]=s[7],e[i+8]=s[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const md=new ht;function a0(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function tu(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function iM(){const r=tu("canvas");return r.style.display="block",r}const kv={};function qr(r){r in kv||(kv[r]=!0,console.warn(r))}function aM(r,e,i){return new Promise(function(s,l){function c(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:l();break;case r.TIMEOUT_EXPIRED:setTimeout(c,i);break;default:s()}}setTimeout(c,i)})}function sM(r){const e=r.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function rM(r){const e=r.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Xv=new ht().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Wv=new ht().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function oM(){const r={enabled:!0,workingColorSpace:Jr,spaces:{},convert:function(l,c,d){return this.enabled===!1||c===d||!c||!d||(this.spaces[c].transfer===Zt&&(l.r=Aa(l.r),l.g=Aa(l.g),l.b=Aa(l.b)),this.spaces[c].primaries!==this.spaces[d].primaries&&(l.applyMatrix3(this.spaces[c].toXYZ),l.applyMatrix3(this.spaces[d].fromXYZ)),this.spaces[d].transfer===Zt&&(l.r=Yr(l.r),l.g=Yr(l.g),l.b=Yr(l.b))),l},workingToColorSpace:function(l,c){return this.convert(l,this.workingColorSpace,c)},colorSpaceToWorking:function(l,c){return this.convert(l,c,this.workingColorSpace)},getPrimaries:function(l){return this.spaces[l].primaries},getTransfer:function(l){return l===ss?$c:this.spaces[l].transfer},getLuminanceCoefficients:function(l,c=this.workingColorSpace){return l.fromArray(this.spaces[c].luminanceCoefficients)},define:function(l){Object.assign(this.spaces,l)},_getMatrix:function(l,c,d){return l.copy(this.spaces[c].toXYZ).multiply(this.spaces[d].fromXYZ)},_getDrawingBufferColorSpace:function(l){return this.spaces[l].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(l=this.workingColorSpace){return this.spaces[l].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(l,c){return qr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(l,c)},toWorkingColorSpace:function(l,c){return qr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(l,c)}},e=[.64,.33,.3,.6,.15,.06],i=[.2126,.7152,.0722],s=[.3127,.329];return r.define({[Jr]:{primaries:e,whitePoint:s,transfer:$c,toXYZ:Xv,fromXYZ:Wv,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:ci},outputColorSpaceConfig:{drawingBufferColorSpace:ci}},[ci]:{primaries:e,whitePoint:s,transfer:Zt,toXYZ:Xv,fromXYZ:Wv,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:ci}}}),r}const Ut=oM();function Aa(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Yr(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let wr;class lM{static getDataURL(e,i="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let s;if(e instanceof HTMLCanvasElement)s=e;else{wr===void 0&&(wr=tu("canvas")),wr.width=e.width,wr.height=e.height;const l=wr.getContext("2d");e instanceof ImageData?l.putImageData(e,0,0):l.drawImage(e,0,0,e.width,e.height),s=wr}return s.toDataURL(i)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const i=tu("canvas");i.width=e.width,i.height=e.height;const s=i.getContext("2d");s.drawImage(e,0,0,e.width,e.height);const l=s.getImageData(0,0,e.width,e.height),c=l.data;for(let d=0;d<c.length;d++)c[d]=Aa(c[d]/255)*255;return s.putImageData(l,0,0),i}else if(e.data){const i=e.data.slice(0);for(let s=0;s<i.length;s++)i instanceof Uint8Array||i instanceof Uint8ClampedArray?i[s]=Math.floor(Aa(i[s]/255)*255):i[s]=Aa(i[s]);return{data:i,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let cM=0;class Gh{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:cM++}),this.uuid=to(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const i=this.data;return i instanceof HTMLVideoElement?e.set(i.videoWidth,i.videoHeight):i!==null?e.set(i.width,i.height,i.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const i=e===void 0||typeof e=="string";if(!i&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const s={uuid:this.uuid,url:""},l=this.data;if(l!==null){let c;if(Array.isArray(l)){c=[];for(let d=0,h=l.length;d<h;d++)l[d].isDataTexture?c.push(gd(l[d].image)):c.push(gd(l[d]))}else c=gd(l);s.url=c}return i||(e.images[this.uuid]=s),s}}function gd(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?lM.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let uM=0;const vd=new ae;class jn extends eo{constructor(e=jn.DEFAULT_IMAGE,i=jn.DEFAULT_MAPPING,s=ks,l=ks,c=Wi,d=Xs,h=Oi,p=Yi,m=jn.DEFAULT_ANISOTROPY,_=ss){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:uM++}),this.uuid=to(),this.name="",this.source=new Gh(e),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=s,this.wrapT=l,this.magFilter=c,this.minFilter=d,this.anisotropy=m,this.format=h,this.internalFormat=null,this.type=p,this.offset=new Bt(0,0),this.repeat=new Bt(1,1),this.center=new Bt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ht,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=_,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(vd).x}get height(){return this.source.getSize(vd).y}get depth(){return this.source.getSize(vd).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,i){this.updateRanges.push({start:e,count:i})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const i in e){const s=e[i];if(s===void 0){console.warn(`THREE.Texture.setValues(): parameter '${i}' has value of undefined.`);continue}const l=this[i];if(l===void 0){console.warn(`THREE.Texture.setValues(): property '${i}' does not exist.`);continue}l&&s&&l.isVector2&&s.isVector2||l&&s&&l.isVector3&&s.isVector3||l&&s&&l.isMatrix3&&s.isMatrix3?l.copy(s):this[i]=s}}toJSON(e){const i=e===void 0||typeof e=="string";if(!i&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const s={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(s.userData=this.userData),i||(e.textures[this.uuid]=s),s}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==q_)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case nh:e.x=e.x-Math.floor(e.x);break;case ks:e.x=e.x<0?0:1;break;case ih:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case nh:e.y=e.y-Math.floor(e.y);break;case ks:e.y=e.y<0?0:1;break;case ih:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}jn.DEFAULT_IMAGE=null;jn.DEFAULT_MAPPING=q_;jn.DEFAULT_ANISOTROPY=1;class cn{constructor(e=0,i=0,s=0,l=1){cn.prototype.isVector4=!0,this.x=e,this.y=i,this.z=s,this.w=l}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,i,s,l){return this.x=e,this.y=i,this.z=s,this.w=l,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,i){switch(e){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;case 3:this.w=i;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,i){return this.x=e.x+i.x,this.y=e.y+i.y,this.z=e.z+i.z,this.w=e.w+i.w,this}addScaledVector(e,i){return this.x+=e.x*i,this.y+=e.y*i,this.z+=e.z*i,this.w+=e.w*i,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,i){return this.x=e.x-i.x,this.y=e.y-i.y,this.z=e.z-i.z,this.w=e.w-i.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const i=this.x,s=this.y,l=this.z,c=this.w,d=e.elements;return this.x=d[0]*i+d[4]*s+d[8]*l+d[12]*c,this.y=d[1]*i+d[5]*s+d[9]*l+d[13]*c,this.z=d[2]*i+d[6]*s+d[10]*l+d[14]*c,this.w=d[3]*i+d[7]*s+d[11]*l+d[15]*c,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const i=Math.sqrt(1-e.w*e.w);return i<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/i,this.y=e.y/i,this.z=e.z/i),this}setAxisAngleFromRotationMatrix(e){let i,s,l,c;const p=e.elements,m=p[0],_=p[4],x=p[8],S=p[1],M=p[5],T=p[9],R=p[2],E=p[6],v=p[10];if(Math.abs(_-S)<.01&&Math.abs(x-R)<.01&&Math.abs(T-E)<.01){if(Math.abs(_+S)<.1&&Math.abs(x+R)<.1&&Math.abs(T+E)<.1&&Math.abs(m+M+v-3)<.1)return this.set(1,0,0,0),this;i=Math.PI;const L=(m+1)/2,N=(M+1)/2,W=(v+1)/2,G=(_+S)/4,z=(x+R)/4,J=(T+E)/4;return L>N&&L>W?L<.01?(s=0,l=.707106781,c=.707106781):(s=Math.sqrt(L),l=G/s,c=z/s):N>W?N<.01?(s=.707106781,l=0,c=.707106781):(l=Math.sqrt(N),s=G/l,c=J/l):W<.01?(s=.707106781,l=.707106781,c=0):(c=Math.sqrt(W),s=z/c,l=J/c),this.set(s,l,c,i),this}let B=Math.sqrt((E-T)*(E-T)+(x-R)*(x-R)+(S-_)*(S-_));return Math.abs(B)<.001&&(B=1),this.x=(E-T)/B,this.y=(x-R)/B,this.z=(S-_)/B,this.w=Math.acos((m+M+v-1)/2),this}setFromMatrixPosition(e){const i=e.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this.w=i[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,i){return this.x=At(this.x,e.x,i.x),this.y=At(this.y,e.y,i.y),this.z=At(this.z,e.z,i.z),this.w=At(this.w,e.w,i.w),this}clampScalar(e,i){return this.x=At(this.x,e,i),this.y=At(this.y,e,i),this.z=At(this.z,e,i),this.w=At(this.w,e,i),this}clampLength(e,i){const s=this.length();return this.divideScalar(s||1).multiplyScalar(At(s,e,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,i){return this.x+=(e.x-this.x)*i,this.y+=(e.y-this.y)*i,this.z+=(e.z-this.z)*i,this.w+=(e.w-this.w)*i,this}lerpVectors(e,i,s){return this.x=e.x+(i.x-e.x)*s,this.y=e.y+(i.y-e.y)*s,this.z=e.z+(i.z-e.z)*s,this.w=e.w+(i.w-e.w)*s,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,i=0){return this.x=e[i],this.y=e[i+1],this.z=e[i+2],this.w=e[i+3],this}toArray(e=[],i=0){return e[i]=this.x,e[i+1]=this.y,e[i+2]=this.z,e[i+3]=this.w,e}fromBufferAttribute(e,i){return this.x=e.getX(i),this.y=e.getY(i),this.z=e.getZ(i),this.w=e.getW(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class fM extends eo{constructor(e=1,i=1,s={}){super(),s=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Wi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},s),this.isRenderTarget=!0,this.width=e,this.height=i,this.depth=s.depth,this.scissor=new cn(0,0,e,i),this.scissorTest=!1,this.viewport=new cn(0,0,e,i);const l={width:e,height:i,depth:s.depth},c=new jn(l);this.textures=[];const d=s.count;for(let h=0;h<d;h++)this.textures[h]=c.clone(),this.textures[h].isRenderTargetTexture=!0,this.textures[h].renderTarget=this;this._setTextureOptions(s),this.depthBuffer=s.depthBuffer,this.stencilBuffer=s.stencilBuffer,this.resolveDepthBuffer=s.resolveDepthBuffer,this.resolveStencilBuffer=s.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=s.depthTexture,this.samples=s.samples,this.multiview=s.multiview}_setTextureOptions(e={}){const i={minFilter:Wi,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(i.mapping=e.mapping),e.wrapS!==void 0&&(i.wrapS=e.wrapS),e.wrapT!==void 0&&(i.wrapT=e.wrapT),e.wrapR!==void 0&&(i.wrapR=e.wrapR),e.magFilter!==void 0&&(i.magFilter=e.magFilter),e.minFilter!==void 0&&(i.minFilter=e.minFilter),e.format!==void 0&&(i.format=e.format),e.type!==void 0&&(i.type=e.type),e.anisotropy!==void 0&&(i.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(i.colorSpace=e.colorSpace),e.flipY!==void 0&&(i.flipY=e.flipY),e.generateMipmaps!==void 0&&(i.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(i.internalFormat=e.internalFormat);for(let s=0;s<this.textures.length;s++)this.textures[s].setValues(i)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,i,s=1){if(this.width!==e||this.height!==i||this.depth!==s){this.width=e,this.height=i,this.depth=s;for(let l=0,c=this.textures.length;l<c;l++)this.textures[l].image.width=e,this.textures[l].image.height=i,this.textures[l].image.depth=s,this.textures[l].isArrayTexture=this.textures[l].image.depth>1;this.dispose()}this.viewport.set(0,0,e,i),this.scissor.set(0,0,e,i)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++){this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;const l=Object.assign({},e.textures[i].image);this.textures[i].source=new Gh(l)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class qs extends fM{constructor(e=1,i=1,s={}){super(e,i,s),this.isWebGLRenderTarget=!0}}class s0 extends jn{constructor(e=null,i=1,s=1,l=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:i,height:s,depth:l},this.magFilter=Bi,this.minFilter=Bi,this.wrapR=ks,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class dM extends jn{constructor(e=null,i=1,s=1,l=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:i,height:s,depth:l},this.magFilter=Bi,this.minFilter=Bi,this.wrapR=ks,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class vl{constructor(e=new ae(1/0,1/0,1/0),i=new ae(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=i}set(e,i){return this.min.copy(e),this.max.copy(i),this}setFromArray(e){this.makeEmpty();for(let i=0,s=e.length;i<s;i+=3)this.expandByPoint(Ni.fromArray(e,i));return this}setFromBufferAttribute(e){this.makeEmpty();for(let i=0,s=e.count;i<s;i++)this.expandByPoint(Ni.fromBufferAttribute(e,i));return this}setFromPoints(e){this.makeEmpty();for(let i=0,s=e.length;i<s;i++)this.expandByPoint(e[i]);return this}setFromCenterAndSize(e,i){const s=Ni.copy(i).multiplyScalar(.5);return this.min.copy(e).sub(s),this.max.copy(e).add(s),this}setFromObject(e,i=!1){return this.makeEmpty(),this.expandByObject(e,i)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,i=!1){e.updateWorldMatrix(!1,!1);const s=e.geometry;if(s!==void 0){const c=s.getAttribute("position");if(i===!0&&c!==void 0&&e.isInstancedMesh!==!0)for(let d=0,h=c.count;d<h;d++)e.isMesh===!0?e.getVertexPosition(d,Ni):Ni.fromBufferAttribute(c,d),Ni.applyMatrix4(e.matrixWorld),this.expandByPoint(Ni);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),bc.copy(e.boundingBox)):(s.boundingBox===null&&s.computeBoundingBox(),bc.copy(s.boundingBox)),bc.applyMatrix4(e.matrixWorld),this.union(bc)}const l=e.children;for(let c=0,d=l.length;c<d;c++)this.expandByObject(l[c],i);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,i){return i.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ni),Ni.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let i,s;return e.normal.x>0?(i=e.normal.x*this.min.x,s=e.normal.x*this.max.x):(i=e.normal.x*this.max.x,s=e.normal.x*this.min.x),e.normal.y>0?(i+=e.normal.y*this.min.y,s+=e.normal.y*this.max.y):(i+=e.normal.y*this.max.y,s+=e.normal.y*this.min.y),e.normal.z>0?(i+=e.normal.z*this.min.z,s+=e.normal.z*this.max.z):(i+=e.normal.z*this.max.z,s+=e.normal.z*this.min.z),i<=-e.constant&&s>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(el),Tc.subVectors(this.max,el),Nr.subVectors(e.a,el),Dr.subVectors(e.b,el),Ur.subVectors(e.c,el),$a.subVectors(Dr,Nr),es.subVectors(Ur,Dr),Os.subVectors(Nr,Ur);let i=[0,-$a.z,$a.y,0,-es.z,es.y,0,-Os.z,Os.y,$a.z,0,-$a.x,es.z,0,-es.x,Os.z,0,-Os.x,-$a.y,$a.x,0,-es.y,es.x,0,-Os.y,Os.x,0];return!_d(i,Nr,Dr,Ur,Tc)||(i=[1,0,0,0,1,0,0,0,1],!_d(i,Nr,Dr,Ur,Tc))?!1:(Ac.crossVectors($a,es),i=[Ac.x,Ac.y,Ac.z],_d(i,Nr,Dr,Ur,Tc))}clampPoint(e,i){return i.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ni).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ni).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(va[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),va[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),va[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),va[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),va[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),va[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),va[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),va[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(va),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const va=[new ae,new ae,new ae,new ae,new ae,new ae,new ae,new ae],Ni=new ae,bc=new vl,Nr=new ae,Dr=new ae,Ur=new ae,$a=new ae,es=new ae,Os=new ae,el=new ae,Tc=new ae,Ac=new ae,Ps=new ae;function _d(r,e,i,s,l){for(let c=0,d=r.length-3;c<=d;c+=3){Ps.fromArray(r,c);const h=l.x*Math.abs(Ps.x)+l.y*Math.abs(Ps.y)+l.z*Math.abs(Ps.z),p=e.dot(Ps),m=i.dot(Ps),_=s.dot(Ps);if(Math.max(-Math.max(p,m,_),Math.min(p,m,_))>h)return!1}return!0}const hM=new vl,tl=new ae,xd=new ae;class su{constructor(e=new ae,i=-1){this.isSphere=!0,this.center=e,this.radius=i}set(e,i){return this.center.copy(e),this.radius=i,this}setFromPoints(e,i){const s=this.center;i!==void 0?s.copy(i):hM.setFromPoints(e).getCenter(s);let l=0;for(let c=0,d=e.length;c<d;c++)l=Math.max(l,s.distanceToSquared(e[c]));return this.radius=Math.sqrt(l),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const i=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=i*i}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,i){const s=this.center.distanceToSquared(e);return i.copy(e),s>this.radius*this.radius&&(i.sub(this.center).normalize(),i.multiplyScalar(this.radius).add(this.center)),i}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;tl.subVectors(e,this.center);const i=tl.lengthSq();if(i>this.radius*this.radius){const s=Math.sqrt(i),l=(s-this.radius)*.5;this.center.addScaledVector(tl,l/s),this.radius+=l}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(xd.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(tl.copy(e.center).add(xd)),this.expandByPoint(tl.copy(e.center).sub(xd))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const _a=new ae,yd=new ae,Rc=new ae,ts=new ae,Sd=new ae,Cc=new ae,Md=new ae;class r0{constructor(e=new ae,i=new ae(0,0,-1)){this.origin=e,this.direction=i}set(e,i){return this.origin.copy(e),this.direction.copy(i),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,i){return i.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,_a)),this}closestPointToPoint(e,i){i.subVectors(e,this.origin);const s=i.dot(this.direction);return s<0?i.copy(this.origin):i.copy(this.origin).addScaledVector(this.direction,s)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const i=_a.subVectors(e,this.origin).dot(this.direction);return i<0?this.origin.distanceToSquared(e):(_a.copy(this.origin).addScaledVector(this.direction,i),_a.distanceToSquared(e))}distanceSqToSegment(e,i,s,l){yd.copy(e).add(i).multiplyScalar(.5),Rc.copy(i).sub(e).normalize(),ts.copy(this.origin).sub(yd);const c=e.distanceTo(i)*.5,d=-this.direction.dot(Rc),h=ts.dot(this.direction),p=-ts.dot(Rc),m=ts.lengthSq(),_=Math.abs(1-d*d);let x,S,M,T;if(_>0)if(x=d*p-h,S=d*h-p,T=c*_,x>=0)if(S>=-T)if(S<=T){const R=1/_;x*=R,S*=R,M=x*(x+d*S+2*h)+S*(d*x+S+2*p)+m}else S=c,x=Math.max(0,-(d*S+h)),M=-x*x+S*(S+2*p)+m;else S=-c,x=Math.max(0,-(d*S+h)),M=-x*x+S*(S+2*p)+m;else S<=-T?(x=Math.max(0,-(-d*c+h)),S=x>0?-c:Math.min(Math.max(-c,-p),c),M=-x*x+S*(S+2*p)+m):S<=T?(x=0,S=Math.min(Math.max(-c,-p),c),M=S*(S+2*p)+m):(x=Math.max(0,-(d*c+h)),S=x>0?c:Math.min(Math.max(-c,-p),c),M=-x*x+S*(S+2*p)+m);else S=d>0?-c:c,x=Math.max(0,-(d*S+h)),M=-x*x+S*(S+2*p)+m;return s&&s.copy(this.origin).addScaledVector(this.direction,x),l&&l.copy(yd).addScaledVector(Rc,S),M}intersectSphere(e,i){_a.subVectors(e.center,this.origin);const s=_a.dot(this.direction),l=_a.dot(_a)-s*s,c=e.radius*e.radius;if(l>c)return null;const d=Math.sqrt(c-l),h=s-d,p=s+d;return p<0?null:h<0?this.at(p,i):this.at(h,i)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const i=e.normal.dot(this.direction);if(i===0)return e.distanceToPoint(this.origin)===0?0:null;const s=-(this.origin.dot(e.normal)+e.constant)/i;return s>=0?s:null}intersectPlane(e,i){const s=this.distanceToPlane(e);return s===null?null:this.at(s,i)}intersectsPlane(e){const i=e.distanceToPoint(this.origin);return i===0||e.normal.dot(this.direction)*i<0}intersectBox(e,i){let s,l,c,d,h,p;const m=1/this.direction.x,_=1/this.direction.y,x=1/this.direction.z,S=this.origin;return m>=0?(s=(e.min.x-S.x)*m,l=(e.max.x-S.x)*m):(s=(e.max.x-S.x)*m,l=(e.min.x-S.x)*m),_>=0?(c=(e.min.y-S.y)*_,d=(e.max.y-S.y)*_):(c=(e.max.y-S.y)*_,d=(e.min.y-S.y)*_),s>d||c>l||((c>s||isNaN(s))&&(s=c),(d<l||isNaN(l))&&(l=d),x>=0?(h=(e.min.z-S.z)*x,p=(e.max.z-S.z)*x):(h=(e.max.z-S.z)*x,p=(e.min.z-S.z)*x),s>p||h>l)||((h>s||s!==s)&&(s=h),(p<l||l!==l)&&(l=p),l<0)?null:this.at(s>=0?s:l,i)}intersectsBox(e){return this.intersectBox(e,_a)!==null}intersectTriangle(e,i,s,l,c){Sd.subVectors(i,e),Cc.subVectors(s,e),Md.crossVectors(Sd,Cc);let d=this.direction.dot(Md),h;if(d>0){if(l)return null;h=1}else if(d<0)h=-1,d=-d;else return null;ts.subVectors(this.origin,e);const p=h*this.direction.dot(Cc.crossVectors(ts,Cc));if(p<0)return null;const m=h*this.direction.dot(Sd.cross(ts));if(m<0||p+m>d)return null;const _=-h*ts.dot(Md);return _<0?null:this.at(_/d,c)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class sn{constructor(e,i,s,l,c,d,h,p,m,_,x,S,M,T,R,E){sn.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,i,s,l,c,d,h,p,m,_,x,S,M,T,R,E)}set(e,i,s,l,c,d,h,p,m,_,x,S,M,T,R,E){const v=this.elements;return v[0]=e,v[4]=i,v[8]=s,v[12]=l,v[1]=c,v[5]=d,v[9]=h,v[13]=p,v[2]=m,v[6]=_,v[10]=x,v[14]=S,v[3]=M,v[7]=T,v[11]=R,v[15]=E,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new sn().fromArray(this.elements)}copy(e){const i=this.elements,s=e.elements;return i[0]=s[0],i[1]=s[1],i[2]=s[2],i[3]=s[3],i[4]=s[4],i[5]=s[5],i[6]=s[6],i[7]=s[7],i[8]=s[8],i[9]=s[9],i[10]=s[10],i[11]=s[11],i[12]=s[12],i[13]=s[13],i[14]=s[14],i[15]=s[15],this}copyPosition(e){const i=this.elements,s=e.elements;return i[12]=s[12],i[13]=s[13],i[14]=s[14],this}setFromMatrix3(e){const i=e.elements;return this.set(i[0],i[3],i[6],0,i[1],i[4],i[7],0,i[2],i[5],i[8],0,0,0,0,1),this}extractBasis(e,i,s){return e.setFromMatrixColumn(this,0),i.setFromMatrixColumn(this,1),s.setFromMatrixColumn(this,2),this}makeBasis(e,i,s){return this.set(e.x,i.x,s.x,0,e.y,i.y,s.y,0,e.z,i.z,s.z,0,0,0,0,1),this}extractRotation(e){const i=this.elements,s=e.elements,l=1/Lr.setFromMatrixColumn(e,0).length(),c=1/Lr.setFromMatrixColumn(e,1).length(),d=1/Lr.setFromMatrixColumn(e,2).length();return i[0]=s[0]*l,i[1]=s[1]*l,i[2]=s[2]*l,i[3]=0,i[4]=s[4]*c,i[5]=s[5]*c,i[6]=s[6]*c,i[7]=0,i[8]=s[8]*d,i[9]=s[9]*d,i[10]=s[10]*d,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromEuler(e){const i=this.elements,s=e.x,l=e.y,c=e.z,d=Math.cos(s),h=Math.sin(s),p=Math.cos(l),m=Math.sin(l),_=Math.cos(c),x=Math.sin(c);if(e.order==="XYZ"){const S=d*_,M=d*x,T=h*_,R=h*x;i[0]=p*_,i[4]=-p*x,i[8]=m,i[1]=M+T*m,i[5]=S-R*m,i[9]=-h*p,i[2]=R-S*m,i[6]=T+M*m,i[10]=d*p}else if(e.order==="YXZ"){const S=p*_,M=p*x,T=m*_,R=m*x;i[0]=S+R*h,i[4]=T*h-M,i[8]=d*m,i[1]=d*x,i[5]=d*_,i[9]=-h,i[2]=M*h-T,i[6]=R+S*h,i[10]=d*p}else if(e.order==="ZXY"){const S=p*_,M=p*x,T=m*_,R=m*x;i[0]=S-R*h,i[4]=-d*x,i[8]=T+M*h,i[1]=M+T*h,i[5]=d*_,i[9]=R-S*h,i[2]=-d*m,i[6]=h,i[10]=d*p}else if(e.order==="ZYX"){const S=d*_,M=d*x,T=h*_,R=h*x;i[0]=p*_,i[4]=T*m-M,i[8]=S*m+R,i[1]=p*x,i[5]=R*m+S,i[9]=M*m-T,i[2]=-m,i[6]=h*p,i[10]=d*p}else if(e.order==="YZX"){const S=d*p,M=d*m,T=h*p,R=h*m;i[0]=p*_,i[4]=R-S*x,i[8]=T*x+M,i[1]=x,i[5]=d*_,i[9]=-h*_,i[2]=-m*_,i[6]=M*x+T,i[10]=S-R*x}else if(e.order==="XZY"){const S=d*p,M=d*m,T=h*p,R=h*m;i[0]=p*_,i[4]=-x,i[8]=m*_,i[1]=S*x+R,i[5]=d*_,i[9]=M*x-T,i[2]=T*x-M,i[6]=h*_,i[10]=R*x+S}return i[3]=0,i[7]=0,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromQuaternion(e){return this.compose(pM,e,mM)}lookAt(e,i,s){const l=this.elements;return oi.subVectors(e,i),oi.lengthSq()===0&&(oi.z=1),oi.normalize(),ns.crossVectors(s,oi),ns.lengthSq()===0&&(Math.abs(s.z)===1?oi.x+=1e-4:oi.z+=1e-4,oi.normalize(),ns.crossVectors(s,oi)),ns.normalize(),wc.crossVectors(oi,ns),l[0]=ns.x,l[4]=wc.x,l[8]=oi.x,l[1]=ns.y,l[5]=wc.y,l[9]=oi.y,l[2]=ns.z,l[6]=wc.z,l[10]=oi.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,i){const s=e.elements,l=i.elements,c=this.elements,d=s[0],h=s[4],p=s[8],m=s[12],_=s[1],x=s[5],S=s[9],M=s[13],T=s[2],R=s[6],E=s[10],v=s[14],B=s[3],L=s[7],N=s[11],W=s[15],G=l[0],z=l[4],J=l[8],D=l[12],w=l[1],k=l[5],ue=l[9],q=l[13],le=l[2],_e=l[6],U=l[10],$=l[14],Z=l[3],xe=l[7],Ae=l[11],O=l[15];return c[0]=d*G+h*w+p*le+m*Z,c[4]=d*z+h*k+p*_e+m*xe,c[8]=d*J+h*ue+p*U+m*Ae,c[12]=d*D+h*q+p*$+m*O,c[1]=_*G+x*w+S*le+M*Z,c[5]=_*z+x*k+S*_e+M*xe,c[9]=_*J+x*ue+S*U+M*Ae,c[13]=_*D+x*q+S*$+M*O,c[2]=T*G+R*w+E*le+v*Z,c[6]=T*z+R*k+E*_e+v*xe,c[10]=T*J+R*ue+E*U+v*Ae,c[14]=T*D+R*q+E*$+v*O,c[3]=B*G+L*w+N*le+W*Z,c[7]=B*z+L*k+N*_e+W*xe,c[11]=B*J+L*ue+N*U+W*Ae,c[15]=B*D+L*q+N*$+W*O,this}multiplyScalar(e){const i=this.elements;return i[0]*=e,i[4]*=e,i[8]*=e,i[12]*=e,i[1]*=e,i[5]*=e,i[9]*=e,i[13]*=e,i[2]*=e,i[6]*=e,i[10]*=e,i[14]*=e,i[3]*=e,i[7]*=e,i[11]*=e,i[15]*=e,this}determinant(){const e=this.elements,i=e[0],s=e[4],l=e[8],c=e[12],d=e[1],h=e[5],p=e[9],m=e[13],_=e[2],x=e[6],S=e[10],M=e[14],T=e[3],R=e[7],E=e[11],v=e[15];return T*(+c*p*x-l*m*x-c*h*S+s*m*S+l*h*M-s*p*M)+R*(+i*p*M-i*m*S+c*d*S-l*d*M+l*m*_-c*p*_)+E*(+i*m*x-i*h*M-c*d*x+s*d*M+c*h*_-s*m*_)+v*(-l*h*_-i*p*x+i*h*S+l*d*x-s*d*S+s*p*_)}transpose(){const e=this.elements;let i;return i=e[1],e[1]=e[4],e[4]=i,i=e[2],e[2]=e[8],e[8]=i,i=e[6],e[6]=e[9],e[9]=i,i=e[3],e[3]=e[12],e[12]=i,i=e[7],e[7]=e[13],e[13]=i,i=e[11],e[11]=e[14],e[14]=i,this}setPosition(e,i,s){const l=this.elements;return e.isVector3?(l[12]=e.x,l[13]=e.y,l[14]=e.z):(l[12]=e,l[13]=i,l[14]=s),this}invert(){const e=this.elements,i=e[0],s=e[1],l=e[2],c=e[3],d=e[4],h=e[5],p=e[6],m=e[7],_=e[8],x=e[9],S=e[10],M=e[11],T=e[12],R=e[13],E=e[14],v=e[15],B=x*E*m-R*S*m+R*p*M-h*E*M-x*p*v+h*S*v,L=T*S*m-_*E*m-T*p*M+d*E*M+_*p*v-d*S*v,N=_*R*m-T*x*m+T*h*M-d*R*M-_*h*v+d*x*v,W=T*x*p-_*R*p-T*h*S+d*R*S+_*h*E-d*x*E,G=i*B+s*L+l*N+c*W;if(G===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const z=1/G;return e[0]=B*z,e[1]=(R*S*c-x*E*c-R*l*M+s*E*M+x*l*v-s*S*v)*z,e[2]=(h*E*c-R*p*c+R*l*m-s*E*m-h*l*v+s*p*v)*z,e[3]=(x*p*c-h*S*c-x*l*m+s*S*m+h*l*M-s*p*M)*z,e[4]=L*z,e[5]=(_*E*c-T*S*c+T*l*M-i*E*M-_*l*v+i*S*v)*z,e[6]=(T*p*c-d*E*c-T*l*m+i*E*m+d*l*v-i*p*v)*z,e[7]=(d*S*c-_*p*c+_*l*m-i*S*m-d*l*M+i*p*M)*z,e[8]=N*z,e[9]=(T*x*c-_*R*c-T*s*M+i*R*M+_*s*v-i*x*v)*z,e[10]=(d*R*c-T*h*c+T*s*m-i*R*m-d*s*v+i*h*v)*z,e[11]=(_*h*c-d*x*c-_*s*m+i*x*m+d*s*M-i*h*M)*z,e[12]=W*z,e[13]=(_*R*l-T*x*l+T*s*S-i*R*S-_*s*E+i*x*E)*z,e[14]=(T*h*l-d*R*l-T*s*p+i*R*p+d*s*E-i*h*E)*z,e[15]=(d*x*l-_*h*l+_*s*p-i*x*p-d*s*S+i*h*S)*z,this}scale(e){const i=this.elements,s=e.x,l=e.y,c=e.z;return i[0]*=s,i[4]*=l,i[8]*=c,i[1]*=s,i[5]*=l,i[9]*=c,i[2]*=s,i[6]*=l,i[10]*=c,i[3]*=s,i[7]*=l,i[11]*=c,this}getMaxScaleOnAxis(){const e=this.elements,i=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],s=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],l=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(i,s,l))}makeTranslation(e,i,s){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,i,0,0,1,s,0,0,0,1),this}makeRotationX(e){const i=Math.cos(e),s=Math.sin(e);return this.set(1,0,0,0,0,i,-s,0,0,s,i,0,0,0,0,1),this}makeRotationY(e){const i=Math.cos(e),s=Math.sin(e);return this.set(i,0,s,0,0,1,0,0,-s,0,i,0,0,0,0,1),this}makeRotationZ(e){const i=Math.cos(e),s=Math.sin(e);return this.set(i,-s,0,0,s,i,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,i){const s=Math.cos(i),l=Math.sin(i),c=1-s,d=e.x,h=e.y,p=e.z,m=c*d,_=c*h;return this.set(m*d+s,m*h-l*p,m*p+l*h,0,m*h+l*p,_*h+s,_*p-l*d,0,m*p-l*h,_*p+l*d,c*p*p+s,0,0,0,0,1),this}makeScale(e,i,s){return this.set(e,0,0,0,0,i,0,0,0,0,s,0,0,0,0,1),this}makeShear(e,i,s,l,c,d){return this.set(1,s,c,0,e,1,d,0,i,l,1,0,0,0,0,1),this}compose(e,i,s){const l=this.elements,c=i._x,d=i._y,h=i._z,p=i._w,m=c+c,_=d+d,x=h+h,S=c*m,M=c*_,T=c*x,R=d*_,E=d*x,v=h*x,B=p*m,L=p*_,N=p*x,W=s.x,G=s.y,z=s.z;return l[0]=(1-(R+v))*W,l[1]=(M+N)*W,l[2]=(T-L)*W,l[3]=0,l[4]=(M-N)*G,l[5]=(1-(S+v))*G,l[6]=(E+B)*G,l[7]=0,l[8]=(T+L)*z,l[9]=(E-B)*z,l[10]=(1-(S+R))*z,l[11]=0,l[12]=e.x,l[13]=e.y,l[14]=e.z,l[15]=1,this}decompose(e,i,s){const l=this.elements;let c=Lr.set(l[0],l[1],l[2]).length();const d=Lr.set(l[4],l[5],l[6]).length(),h=Lr.set(l[8],l[9],l[10]).length();this.determinant()<0&&(c=-c),e.x=l[12],e.y=l[13],e.z=l[14],Di.copy(this);const m=1/c,_=1/d,x=1/h;return Di.elements[0]*=m,Di.elements[1]*=m,Di.elements[2]*=m,Di.elements[4]*=_,Di.elements[5]*=_,Di.elements[6]*=_,Di.elements[8]*=x,Di.elements[9]*=x,Di.elements[10]*=x,i.setFromRotationMatrix(Di),s.x=c,s.y=d,s.z=h,this}makePerspective(e,i,s,l,c,d,h=Ta){const p=this.elements,m=2*c/(i-e),_=2*c/(s-l),x=(i+e)/(i-e),S=(s+l)/(s-l);let M,T;if(h===Ta)M=-(d+c)/(d-c),T=-2*d*c/(d-c);else if(h===eu)M=-d/(d-c),T=-d*c/(d-c);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+h);return p[0]=m,p[4]=0,p[8]=x,p[12]=0,p[1]=0,p[5]=_,p[9]=S,p[13]=0,p[2]=0,p[6]=0,p[10]=M,p[14]=T,p[3]=0,p[7]=0,p[11]=-1,p[15]=0,this}makeOrthographic(e,i,s,l,c,d,h=Ta){const p=this.elements,m=1/(i-e),_=1/(s-l),x=1/(d-c),S=(i+e)*m,M=(s+l)*_;let T,R;if(h===Ta)T=(d+c)*x,R=-2*x;else if(h===eu)T=c*x,R=-1*x;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+h);return p[0]=2*m,p[4]=0,p[8]=0,p[12]=-S,p[1]=0,p[5]=2*_,p[9]=0,p[13]=-M,p[2]=0,p[6]=0,p[10]=R,p[14]=-T,p[3]=0,p[7]=0,p[11]=0,p[15]=1,this}equals(e){const i=this.elements,s=e.elements;for(let l=0;l<16;l++)if(i[l]!==s[l])return!1;return!0}fromArray(e,i=0){for(let s=0;s<16;s++)this.elements[s]=e[s+i];return this}toArray(e=[],i=0){const s=this.elements;return e[i]=s[0],e[i+1]=s[1],e[i+2]=s[2],e[i+3]=s[3],e[i+4]=s[4],e[i+5]=s[5],e[i+6]=s[6],e[i+7]=s[7],e[i+8]=s[8],e[i+9]=s[9],e[i+10]=s[10],e[i+11]=s[11],e[i+12]=s[12],e[i+13]=s[13],e[i+14]=s[14],e[i+15]=s[15],e}}const Lr=new ae,Di=new sn,pM=new ae(0,0,0),mM=new ae(1,1,1),ns=new ae,wc=new ae,oi=new ae,qv=new sn,Yv=new gl;class Zi{constructor(e=0,i=0,s=0,l=Zi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=i,this._z=s,this._order=l}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,i,s,l=this._order){return this._x=e,this._y=i,this._z=s,this._order=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,i=this._order,s=!0){const l=e.elements,c=l[0],d=l[4],h=l[8],p=l[1],m=l[5],_=l[9],x=l[2],S=l[6],M=l[10];switch(i){case"XYZ":this._y=Math.asin(At(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-_,M),this._z=Math.atan2(-d,c)):(this._x=Math.atan2(S,m),this._z=0);break;case"YXZ":this._x=Math.asin(-At(_,-1,1)),Math.abs(_)<.9999999?(this._y=Math.atan2(h,M),this._z=Math.atan2(p,m)):(this._y=Math.atan2(-x,c),this._z=0);break;case"ZXY":this._x=Math.asin(At(S,-1,1)),Math.abs(S)<.9999999?(this._y=Math.atan2(-x,M),this._z=Math.atan2(-d,m)):(this._y=0,this._z=Math.atan2(p,c));break;case"ZYX":this._y=Math.asin(-At(x,-1,1)),Math.abs(x)<.9999999?(this._x=Math.atan2(S,M),this._z=Math.atan2(p,c)):(this._x=0,this._z=Math.atan2(-d,m));break;case"YZX":this._z=Math.asin(At(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(-_,m),this._y=Math.atan2(-x,c)):(this._x=0,this._y=Math.atan2(h,M));break;case"XZY":this._z=Math.asin(-At(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(S,m),this._y=Math.atan2(h,c)):(this._x=Math.atan2(-_,M),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,s===!0&&this._onChangeCallback(),this}setFromQuaternion(e,i,s){return qv.makeRotationFromQuaternion(e),this.setFromRotationMatrix(qv,i,s)}setFromVector3(e,i=this._order){return this.set(e.x,e.y,e.z,i)}reorder(e){return Yv.setFromEuler(this),this.setFromQuaternion(Yv,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],i=0){return e[i]=this._x,e[i+1]=this._y,e[i+2]=this._z,e[i+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Zi.DEFAULT_ORDER="XYZ";class o0{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let gM=0;const Zv=new ae,Or=new gl,xa=new sn,Nc=new ae,nl=new ae,vM=new ae,_M=new gl,Kv=new ae(1,0,0),Qv=new ae(0,1,0),Jv=new ae(0,0,1),$v={type:"added"},xM={type:"removed"},Pr={type:"childadded",child:null},Ed={type:"childremoved",child:null};class On extends eo{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:gM++}),this.uuid=to(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=On.DEFAULT_UP.clone();const e=new ae,i=new Zi,s=new gl,l=new ae(1,1,1);function c(){s.setFromEuler(i,!1)}function d(){i.setFromQuaternion(s,void 0,!1)}i._onChange(c),s._onChange(d),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:s},scale:{configurable:!0,enumerable:!0,value:l},modelViewMatrix:{value:new sn},normalMatrix:{value:new ht}}),this.matrix=new sn,this.matrixWorld=new sn,this.matrixAutoUpdate=On.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=On.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new o0,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,i){this.quaternion.setFromAxisAngle(e,i)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,i){return Or.setFromAxisAngle(e,i),this.quaternion.multiply(Or),this}rotateOnWorldAxis(e,i){return Or.setFromAxisAngle(e,i),this.quaternion.premultiply(Or),this}rotateX(e){return this.rotateOnAxis(Kv,e)}rotateY(e){return this.rotateOnAxis(Qv,e)}rotateZ(e){return this.rotateOnAxis(Jv,e)}translateOnAxis(e,i){return Zv.copy(e).applyQuaternion(this.quaternion),this.position.add(Zv.multiplyScalar(i)),this}translateX(e){return this.translateOnAxis(Kv,e)}translateY(e){return this.translateOnAxis(Qv,e)}translateZ(e){return this.translateOnAxis(Jv,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(xa.copy(this.matrixWorld).invert())}lookAt(e,i,s){e.isVector3?Nc.copy(e):Nc.set(e,i,s);const l=this.parent;this.updateWorldMatrix(!0,!1),nl.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xa.lookAt(nl,Nc,this.up):xa.lookAt(Nc,nl,this.up),this.quaternion.setFromRotationMatrix(xa),l&&(xa.extractRotation(l.matrixWorld),Or.setFromRotationMatrix(xa),this.quaternion.premultiply(Or.invert()))}add(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent($v),Pr.child=e,this.dispatchEvent(Pr),Pr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let s=0;s<arguments.length;s++)this.remove(arguments[s]);return this}const i=this.children.indexOf(e);return i!==-1&&(e.parent=null,this.children.splice(i,1),e.dispatchEvent(xM),Ed.child=e,this.dispatchEvent(Ed),Ed.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),xa.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),xa.multiply(e.parent.matrixWorld)),e.applyMatrix4(xa),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent($v),Pr.child=e,this.dispatchEvent(Pr),Pr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,i){if(this[e]===i)return this;for(let s=0,l=this.children.length;s<l;s++){const d=this.children[s].getObjectByProperty(e,i);if(d!==void 0)return d}}getObjectsByProperty(e,i,s=[]){this[e]===i&&s.push(this);const l=this.children;for(let c=0,d=l.length;c<d;c++)l[c].getObjectsByProperty(e,i,s);return s}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nl,e,vM),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nl,_M,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const i=this.matrixWorld.elements;return e.set(i[8],i[9],i[10]).normalize()}raycast(){}traverse(e){e(this);const i=this.children;for(let s=0,l=i.length;s<l;s++)i[s].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const i=this.children;for(let s=0,l=i.length;s<l;s++)i[s].traverseVisible(e)}traverseAncestors(e){const i=this.parent;i!==null&&(e(i),i.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const i=this.children;for(let s=0,l=i.length;s<l;s++)i[s].updateMatrixWorld(e)}updateWorldMatrix(e,i){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),i===!0){const l=this.children;for(let c=0,d=l.length;c<d;c++)l[c].updateWorldMatrix(!1,!0)}}toJSON(e){const i=e===void 0||typeof e=="string",s={};i&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},s.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const l={};l.uuid=this.uuid,l.type=this.type,this.name!==""&&(l.name=this.name),this.castShadow===!0&&(l.castShadow=!0),this.receiveShadow===!0&&(l.receiveShadow=!0),this.visible===!1&&(l.visible=!1),this.frustumCulled===!1&&(l.frustumCulled=!1),this.renderOrder!==0&&(l.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(l.userData=this.userData),l.layers=this.layers.mask,l.matrix=this.matrix.toArray(),l.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(l.matrixAutoUpdate=!1),this.isInstancedMesh&&(l.type="InstancedMesh",l.count=this.count,l.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(l.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(l.type="BatchedMesh",l.perObjectFrustumCulled=this.perObjectFrustumCulled,l.sortObjects=this.sortObjects,l.drawRanges=this._drawRanges,l.reservedRanges=this._reservedRanges,l.geometryInfo=this._geometryInfo.map(h=>({...h,boundingBox:h.boundingBox?h.boundingBox.toJSON():void 0,boundingSphere:h.boundingSphere?h.boundingSphere.toJSON():void 0})),l.instanceInfo=this._instanceInfo.map(h=>({...h})),l.availableInstanceIds=this._availableInstanceIds.slice(),l.availableGeometryIds=this._availableGeometryIds.slice(),l.nextIndexStart=this._nextIndexStart,l.nextVertexStart=this._nextVertexStart,l.geometryCount=this._geometryCount,l.maxInstanceCount=this._maxInstanceCount,l.maxVertexCount=this._maxVertexCount,l.maxIndexCount=this._maxIndexCount,l.geometryInitialized=this._geometryInitialized,l.matricesTexture=this._matricesTexture.toJSON(e),l.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(l.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(l.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(l.boundingBox=this.boundingBox.toJSON()));function c(h,p){return h[p.uuid]===void 0&&(h[p.uuid]=p.toJSON(e)),p.uuid}if(this.isScene)this.background&&(this.background.isColor?l.background=this.background.toJSON():this.background.isTexture&&(l.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(l.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){l.geometry=c(e.geometries,this.geometry);const h=this.geometry.parameters;if(h!==void 0&&h.shapes!==void 0){const p=h.shapes;if(Array.isArray(p))for(let m=0,_=p.length;m<_;m++){const x=p[m];c(e.shapes,x)}else c(e.shapes,p)}}if(this.isSkinnedMesh&&(l.bindMode=this.bindMode,l.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(c(e.skeletons,this.skeleton),l.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const h=[];for(let p=0,m=this.material.length;p<m;p++)h.push(c(e.materials,this.material[p]));l.material=h}else l.material=c(e.materials,this.material);if(this.children.length>0){l.children=[];for(let h=0;h<this.children.length;h++)l.children.push(this.children[h].toJSON(e).object)}if(this.animations.length>0){l.animations=[];for(let h=0;h<this.animations.length;h++){const p=this.animations[h];l.animations.push(c(e.animations,p))}}if(i){const h=d(e.geometries),p=d(e.materials),m=d(e.textures),_=d(e.images),x=d(e.shapes),S=d(e.skeletons),M=d(e.animations),T=d(e.nodes);h.length>0&&(s.geometries=h),p.length>0&&(s.materials=p),m.length>0&&(s.textures=m),_.length>0&&(s.images=_),x.length>0&&(s.shapes=x),S.length>0&&(s.skeletons=S),M.length>0&&(s.animations=M),T.length>0&&(s.nodes=T)}return s.object=l,s;function d(h){const p=[];for(const m in h){const _=h[m];delete _.metadata,p.push(_)}return p}}clone(e){return new this.constructor().copy(this,e)}copy(e,i=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),i===!0)for(let s=0;s<e.children.length;s++){const l=e.children[s];this.add(l.clone())}return this}}On.DEFAULT_UP=new ae(0,1,0);On.DEFAULT_MATRIX_AUTO_UPDATE=!0;On.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ui=new ae,ya=new ae,bd=new ae,Sa=new ae,Br=new ae,zr=new ae,e_=new ae,Td=new ae,Ad=new ae,Rd=new ae,Cd=new cn,wd=new cn,Nd=new cn;class Li{constructor(e=new ae,i=new ae,s=new ae){this.a=e,this.b=i,this.c=s}static getNormal(e,i,s,l){l.subVectors(s,i),Ui.subVectors(e,i),l.cross(Ui);const c=l.lengthSq();return c>0?l.multiplyScalar(1/Math.sqrt(c)):l.set(0,0,0)}static getBarycoord(e,i,s,l,c){Ui.subVectors(l,i),ya.subVectors(s,i),bd.subVectors(e,i);const d=Ui.dot(Ui),h=Ui.dot(ya),p=Ui.dot(bd),m=ya.dot(ya),_=ya.dot(bd),x=d*m-h*h;if(x===0)return c.set(0,0,0),null;const S=1/x,M=(m*p-h*_)*S,T=(d*_-h*p)*S;return c.set(1-M-T,T,M)}static containsPoint(e,i,s,l){return this.getBarycoord(e,i,s,l,Sa)===null?!1:Sa.x>=0&&Sa.y>=0&&Sa.x+Sa.y<=1}static getInterpolation(e,i,s,l,c,d,h,p){return this.getBarycoord(e,i,s,l,Sa)===null?(p.x=0,p.y=0,"z"in p&&(p.z=0),"w"in p&&(p.w=0),null):(p.setScalar(0),p.addScaledVector(c,Sa.x),p.addScaledVector(d,Sa.y),p.addScaledVector(h,Sa.z),p)}static getInterpolatedAttribute(e,i,s,l,c,d){return Cd.setScalar(0),wd.setScalar(0),Nd.setScalar(0),Cd.fromBufferAttribute(e,i),wd.fromBufferAttribute(e,s),Nd.fromBufferAttribute(e,l),d.setScalar(0),d.addScaledVector(Cd,c.x),d.addScaledVector(wd,c.y),d.addScaledVector(Nd,c.z),d}static isFrontFacing(e,i,s,l){return Ui.subVectors(s,i),ya.subVectors(e,i),Ui.cross(ya).dot(l)<0}set(e,i,s){return this.a.copy(e),this.b.copy(i),this.c.copy(s),this}setFromPointsAndIndices(e,i,s,l){return this.a.copy(e[i]),this.b.copy(e[s]),this.c.copy(e[l]),this}setFromAttributeAndIndices(e,i,s,l){return this.a.fromBufferAttribute(e,i),this.b.fromBufferAttribute(e,s),this.c.fromBufferAttribute(e,l),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ui.subVectors(this.c,this.b),ya.subVectors(this.a,this.b),Ui.cross(ya).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Li.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,i){return Li.getBarycoord(e,this.a,this.b,this.c,i)}getInterpolation(e,i,s,l,c){return Li.getInterpolation(e,this.a,this.b,this.c,i,s,l,c)}containsPoint(e){return Li.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Li.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,i){const s=this.a,l=this.b,c=this.c;let d,h;Br.subVectors(l,s),zr.subVectors(c,s),Td.subVectors(e,s);const p=Br.dot(Td),m=zr.dot(Td);if(p<=0&&m<=0)return i.copy(s);Ad.subVectors(e,l);const _=Br.dot(Ad),x=zr.dot(Ad);if(_>=0&&x<=_)return i.copy(l);const S=p*x-_*m;if(S<=0&&p>=0&&_<=0)return d=p/(p-_),i.copy(s).addScaledVector(Br,d);Rd.subVectors(e,c);const M=Br.dot(Rd),T=zr.dot(Rd);if(T>=0&&M<=T)return i.copy(c);const R=M*m-p*T;if(R<=0&&m>=0&&T<=0)return h=m/(m-T),i.copy(s).addScaledVector(zr,h);const E=_*T-M*x;if(E<=0&&x-_>=0&&M-T>=0)return e_.subVectors(c,l),h=(x-_)/(x-_+(M-T)),i.copy(l).addScaledVector(e_,h);const v=1/(E+R+S);return d=R*v,h=S*v,i.copy(s).addScaledVector(Br,d).addScaledVector(zr,h)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const l0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},is={h:0,s:0,l:0},Dc={h:0,s:0,l:0};function Dd(r,e,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?r+(e-r)*6*i:i<1/2?e:i<2/3?r+(e-r)*6*(2/3-i):r}class mt{constructor(e,i,s){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,i,s)}set(e,i,s){if(i===void 0&&s===void 0){const l=e;l&&l.isColor?this.copy(l):typeof l=="number"?this.setHex(l):typeof l=="string"&&this.setStyle(l)}else this.setRGB(e,i,s);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,i=ci){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ut.colorSpaceToWorking(this,i),this}setRGB(e,i,s,l=Ut.workingColorSpace){return this.r=e,this.g=i,this.b=s,Ut.colorSpaceToWorking(this,l),this}setHSL(e,i,s,l=Ut.workingColorSpace){if(e=Hh(e,1),i=At(i,0,1),s=At(s,0,1),i===0)this.r=this.g=this.b=s;else{const c=s<=.5?s*(1+i):s+i-s*i,d=2*s-c;this.r=Dd(d,c,e+1/3),this.g=Dd(d,c,e),this.b=Dd(d,c,e-1/3)}return Ut.colorSpaceToWorking(this,l),this}setStyle(e,i=ci){function s(c){c!==void 0&&parseFloat(c)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let l;if(l=/^(\w+)\(([^\)]*)\)/.exec(e)){let c;const d=l[1],h=l[2];switch(d){case"rgb":case"rgba":if(c=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return s(c[4]),this.setRGB(Math.min(255,parseInt(c[1],10))/255,Math.min(255,parseInt(c[2],10))/255,Math.min(255,parseInt(c[3],10))/255,i);if(c=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return s(c[4]),this.setRGB(Math.min(100,parseInt(c[1],10))/100,Math.min(100,parseInt(c[2],10))/100,Math.min(100,parseInt(c[3],10))/100,i);break;case"hsl":case"hsla":if(c=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return s(c[4]),this.setHSL(parseFloat(c[1])/360,parseFloat(c[2])/100,parseFloat(c[3])/100,i);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(l=/^\#([A-Fa-f\d]+)$/.exec(e)){const c=l[1],d=c.length;if(d===3)return this.setRGB(parseInt(c.charAt(0),16)/15,parseInt(c.charAt(1),16)/15,parseInt(c.charAt(2),16)/15,i);if(d===6)return this.setHex(parseInt(c,16),i);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,i);return this}setColorName(e,i=ci){const s=l0[e.toLowerCase()];return s!==void 0?this.setHex(s,i):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Aa(e.r),this.g=Aa(e.g),this.b=Aa(e.b),this}copyLinearToSRGB(e){return this.r=Yr(e.r),this.g=Yr(e.g),this.b=Yr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ci){return Ut.workingToColorSpace(Fn.copy(this),e),Math.round(At(Fn.r*255,0,255))*65536+Math.round(At(Fn.g*255,0,255))*256+Math.round(At(Fn.b*255,0,255))}getHexString(e=ci){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,i=Ut.workingColorSpace){Ut.workingToColorSpace(Fn.copy(this),i);const s=Fn.r,l=Fn.g,c=Fn.b,d=Math.max(s,l,c),h=Math.min(s,l,c);let p,m;const _=(h+d)/2;if(h===d)p=0,m=0;else{const x=d-h;switch(m=_<=.5?x/(d+h):x/(2-d-h),d){case s:p=(l-c)/x+(l<c?6:0);break;case l:p=(c-s)/x+2;break;case c:p=(s-l)/x+4;break}p/=6}return e.h=p,e.s=m,e.l=_,e}getRGB(e,i=Ut.workingColorSpace){return Ut.workingToColorSpace(Fn.copy(this),i),e.r=Fn.r,e.g=Fn.g,e.b=Fn.b,e}getStyle(e=ci){Ut.workingToColorSpace(Fn.copy(this),e);const i=Fn.r,s=Fn.g,l=Fn.b;return e!==ci?`color(${e} ${i.toFixed(3)} ${s.toFixed(3)} ${l.toFixed(3)})`:`rgb(${Math.round(i*255)},${Math.round(s*255)},${Math.round(l*255)})`}offsetHSL(e,i,s){return this.getHSL(is),this.setHSL(is.h+e,is.s+i,is.l+s)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,i){return this.r=e.r+i.r,this.g=e.g+i.g,this.b=e.b+i.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,i){return this.r+=(e.r-this.r)*i,this.g+=(e.g-this.g)*i,this.b+=(e.b-this.b)*i,this}lerpColors(e,i,s){return this.r=e.r+(i.r-e.r)*s,this.g=e.g+(i.g-e.g)*s,this.b=e.b+(i.b-e.b)*s,this}lerpHSL(e,i){this.getHSL(is),e.getHSL(Dc);const s=ll(is.h,Dc.h,i),l=ll(is.s,Dc.s,i),c=ll(is.l,Dc.l,i);return this.setHSL(s,l,c),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const i=this.r,s=this.g,l=this.b,c=e.elements;return this.r=c[0]*i+c[3]*s+c[6]*l,this.g=c[1]*i+c[4]*s+c[7]*l,this.b=c[2]*i+c[5]*s+c[8]*l,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,i=0){return this.r=e[i],this.g=e[i+1],this.b=e[i+2],this}toArray(e=[],i=0){return e[i]=this.r,e[i+1]=this.g,e[i+2]=this.b,e}fromBufferAttribute(e,i){return this.r=e.getX(i),this.g=e.getY(i),this.b=e.getZ(i),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Fn=new mt;mt.NAMES=l0;let yM=0;class no extends eo{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:yM++}),this.uuid=to(),this.name="",this.type="Material",this.blending=Wr,this.side=ls,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Xd,this.blendDst=Wd,this.blendEquation=Vs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new mt(0,0,0),this.blendAlpha=0,this.depthFunc=Zr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Fv,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Cr,this.stencilZFail=Cr,this.stencilZPass=Cr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const i in e){const s=e[i];if(s===void 0){console.warn(`THREE.Material: parameter '${i}' has value of undefined.`);continue}const l=this[i];if(l===void 0){console.warn(`THREE.Material: '${i}' is not a property of THREE.${this.type}.`);continue}l&&l.isColor?l.set(s):l&&l.isVector3&&s&&s.isVector3?l.copy(s):this[i]=s}}toJSON(e){const i=e===void 0||typeof e=="string";i&&(e={textures:{},images:{}});const s={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.color&&this.color.isColor&&(s.color=this.color.getHex()),this.roughness!==void 0&&(s.roughness=this.roughness),this.metalness!==void 0&&(s.metalness=this.metalness),this.sheen!==void 0&&(s.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(s.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(s.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(s.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(s.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(s.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(s.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(s.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(s.shininess=this.shininess),this.clearcoat!==void 0&&(s.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(s.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(s.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(s.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(s.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,s.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(s.dispersion=this.dispersion),this.iridescence!==void 0&&(s.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(s.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(s.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(s.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(s.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(s.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(s.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(s.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(s.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(s.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(s.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(s.lightMap=this.lightMap.toJSON(e).uuid,s.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(s.aoMap=this.aoMap.toJSON(e).uuid,s.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(s.bumpMap=this.bumpMap.toJSON(e).uuid,s.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(s.normalMap=this.normalMap.toJSON(e).uuid,s.normalMapType=this.normalMapType,s.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(s.displacementMap=this.displacementMap.toJSON(e).uuid,s.displacementScale=this.displacementScale,s.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(s.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(s.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(s.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(s.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(s.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(s.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(s.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(s.combine=this.combine)),this.envMapRotation!==void 0&&(s.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(s.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(s.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(s.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(s.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(s.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(s.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(s.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(s.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(s.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(s.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(s.size=this.size),this.shadowSide!==null&&(s.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(s.sizeAttenuation=this.sizeAttenuation),this.blending!==Wr&&(s.blending=this.blending),this.side!==ls&&(s.side=this.side),this.vertexColors===!0&&(s.vertexColors=!0),this.opacity<1&&(s.opacity=this.opacity),this.transparent===!0&&(s.transparent=!0),this.blendSrc!==Xd&&(s.blendSrc=this.blendSrc),this.blendDst!==Wd&&(s.blendDst=this.blendDst),this.blendEquation!==Vs&&(s.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(s.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(s.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(s.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(s.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(s.blendAlpha=this.blendAlpha),this.depthFunc!==Zr&&(s.depthFunc=this.depthFunc),this.depthTest===!1&&(s.depthTest=this.depthTest),this.depthWrite===!1&&(s.depthWrite=this.depthWrite),this.colorWrite===!1&&(s.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(s.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Fv&&(s.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(s.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(s.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Cr&&(s.stencilFail=this.stencilFail),this.stencilZFail!==Cr&&(s.stencilZFail=this.stencilZFail),this.stencilZPass!==Cr&&(s.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(s.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(s.rotation=this.rotation),this.polygonOffset===!0&&(s.polygonOffset=!0),this.polygonOffsetFactor!==0&&(s.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(s.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(s.linewidth=this.linewidth),this.dashSize!==void 0&&(s.dashSize=this.dashSize),this.gapSize!==void 0&&(s.gapSize=this.gapSize),this.scale!==void 0&&(s.scale=this.scale),this.dithering===!0&&(s.dithering=!0),this.alphaTest>0&&(s.alphaTest=this.alphaTest),this.alphaHash===!0&&(s.alphaHash=!0),this.alphaToCoverage===!0&&(s.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(s.premultipliedAlpha=!0),this.forceSinglePass===!0&&(s.forceSinglePass=!0),this.wireframe===!0&&(s.wireframe=!0),this.wireframeLinewidth>1&&(s.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(s.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(s.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(s.flatShading=!0),this.visible===!1&&(s.visible=!1),this.toneMapped===!1&&(s.toneMapped=!1),this.fog===!1&&(s.fog=!1),Object.keys(this.userData).length>0&&(s.userData=this.userData);function l(c){const d=[];for(const h in c){const p=c[h];delete p.metadata,d.push(p)}return d}if(i){const c=l(e.textures),d=l(e.images);c.length>0&&(s.textures=c),d.length>0&&(s.images=d)}return s}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const i=e.clippingPlanes;let s=null;if(i!==null){const l=i.length;s=new Array(l);for(let c=0;c!==l;++c)s[c]=i[c].clone()}return this.clippingPlanes=s,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class c0 extends no{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new mt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Zi,this.combine=W_,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const xn=new ae,Uc=new Bt;let SM=0;class qi{constructor(e,i,s=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:SM++}),this.name="",this.array=e,this.itemSize=i,this.count=e!==void 0?e.length/i:0,this.normalized=s,this.usage=Hv,this.updateRanges=[],this.gpuType=ba,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,i){this.updateRanges.push({start:e,count:i})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,i,s){e*=this.itemSize,s*=i.itemSize;for(let l=0,c=this.itemSize;l<c;l++)this.array[e+l]=i.array[s+l];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let i=0,s=this.count;i<s;i++)Uc.fromBufferAttribute(this,i),Uc.applyMatrix3(e),this.setXY(i,Uc.x,Uc.y);else if(this.itemSize===3)for(let i=0,s=this.count;i<s;i++)xn.fromBufferAttribute(this,i),xn.applyMatrix3(e),this.setXYZ(i,xn.x,xn.y,xn.z);return this}applyMatrix4(e){for(let i=0,s=this.count;i<s;i++)xn.fromBufferAttribute(this,i),xn.applyMatrix4(e),this.setXYZ(i,xn.x,xn.y,xn.z);return this}applyNormalMatrix(e){for(let i=0,s=this.count;i<s;i++)xn.fromBufferAttribute(this,i),xn.applyNormalMatrix(e),this.setXYZ(i,xn.x,xn.y,xn.z);return this}transformDirection(e){for(let i=0,s=this.count;i<s;i++)xn.fromBufferAttribute(this,i),xn.transformDirection(e),this.setXYZ(i,xn.x,xn.y,xn.z);return this}set(e,i=0){return this.array.set(e,i),this}getComponent(e,i){let s=this.array[e*this.itemSize+i];return this.normalized&&(s=Vr(s,this.array)),s}setComponent(e,i,s){return this.normalized&&(s=Gn(s,this.array)),this.array[e*this.itemSize+i]=s,this}getX(e){let i=this.array[e*this.itemSize];return this.normalized&&(i=Vr(i,this.array)),i}setX(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize]=i,this}getY(e){let i=this.array[e*this.itemSize+1];return this.normalized&&(i=Vr(i,this.array)),i}setY(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize+1]=i,this}getZ(e){let i=this.array[e*this.itemSize+2];return this.normalized&&(i=Vr(i,this.array)),i}setZ(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize+2]=i,this}getW(e){let i=this.array[e*this.itemSize+3];return this.normalized&&(i=Vr(i,this.array)),i}setW(e,i){return this.normalized&&(i=Gn(i,this.array)),this.array[e*this.itemSize+3]=i,this}setXY(e,i,s){return e*=this.itemSize,this.normalized&&(i=Gn(i,this.array),s=Gn(s,this.array)),this.array[e+0]=i,this.array[e+1]=s,this}setXYZ(e,i,s,l){return e*=this.itemSize,this.normalized&&(i=Gn(i,this.array),s=Gn(s,this.array),l=Gn(l,this.array)),this.array[e+0]=i,this.array[e+1]=s,this.array[e+2]=l,this}setXYZW(e,i,s,l,c){return e*=this.itemSize,this.normalized&&(i=Gn(i,this.array),s=Gn(s,this.array),l=Gn(l,this.array),c=Gn(c,this.array)),this.array[e+0]=i,this.array[e+1]=s,this.array[e+2]=l,this.array[e+3]=c,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Hv&&(e.usage=this.usage),e}}class u0 extends qi{constructor(e,i,s){super(new Uint16Array(e),i,s)}}class f0 extends qi{constructor(e,i,s){super(new Uint32Array(e),i,s)}}class Pn extends qi{constructor(e,i,s){super(new Float32Array(e),i,s)}}let MM=0;const Si=new sn,Ud=new On,Ir=new ae,li=new vl,il=new vl,Rn=new ae;class zi extends eo{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:MM++}),this.uuid=to(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(a0(e)?f0:u0)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,i){return this.attributes[e]=i,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,i,s=0){this.groups.push({start:e,count:i,materialIndex:s})}clearGroups(){this.groups=[]}setDrawRange(e,i){this.drawRange.start=e,this.drawRange.count=i}applyMatrix4(e){const i=this.attributes.position;i!==void 0&&(i.applyMatrix4(e),i.needsUpdate=!0);const s=this.attributes.normal;if(s!==void 0){const c=new ht().getNormalMatrix(e);s.applyNormalMatrix(c),s.needsUpdate=!0}const l=this.attributes.tangent;return l!==void 0&&(l.transformDirection(e),l.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Si.makeRotationFromQuaternion(e),this.applyMatrix4(Si),this}rotateX(e){return Si.makeRotationX(e),this.applyMatrix4(Si),this}rotateY(e){return Si.makeRotationY(e),this.applyMatrix4(Si),this}rotateZ(e){return Si.makeRotationZ(e),this.applyMatrix4(Si),this}translate(e,i,s){return Si.makeTranslation(e,i,s),this.applyMatrix4(Si),this}scale(e,i,s){return Si.makeScale(e,i,s),this.applyMatrix4(Si),this}lookAt(e){return Ud.lookAt(e),Ud.updateMatrix(),this.applyMatrix4(Ud.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ir).negate(),this.translate(Ir.x,Ir.y,Ir.z),this}setFromPoints(e){const i=this.getAttribute("position");if(i===void 0){const s=[];for(let l=0,c=e.length;l<c;l++){const d=e[l];s.push(d.x,d.y,d.z||0)}this.setAttribute("position",new Pn(s,3))}else{const s=Math.min(e.length,i.count);for(let l=0;l<s;l++){const c=e[l];i.setXYZ(l,c.x,c.y,c.z||0)}e.length>i.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),i.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new vl);const e=this.attributes.position,i=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new ae(-1/0,-1/0,-1/0),new ae(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),i)for(let s=0,l=i.length;s<l;s++){const c=i[s];li.setFromBufferAttribute(c),this.morphTargetsRelative?(Rn.addVectors(this.boundingBox.min,li.min),this.boundingBox.expandByPoint(Rn),Rn.addVectors(this.boundingBox.max,li.max),this.boundingBox.expandByPoint(Rn)):(this.boundingBox.expandByPoint(li.min),this.boundingBox.expandByPoint(li.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new su);const e=this.attributes.position,i=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new ae,1/0);return}if(e){const s=this.boundingSphere.center;if(li.setFromBufferAttribute(e),i)for(let c=0,d=i.length;c<d;c++){const h=i[c];il.setFromBufferAttribute(h),this.morphTargetsRelative?(Rn.addVectors(li.min,il.min),li.expandByPoint(Rn),Rn.addVectors(li.max,il.max),li.expandByPoint(Rn)):(li.expandByPoint(il.min),li.expandByPoint(il.max))}li.getCenter(s);let l=0;for(let c=0,d=e.count;c<d;c++)Rn.fromBufferAttribute(e,c),l=Math.max(l,s.distanceToSquared(Rn));if(i)for(let c=0,d=i.length;c<d;c++){const h=i[c],p=this.morphTargetsRelative;for(let m=0,_=h.count;m<_;m++)Rn.fromBufferAttribute(h,m),p&&(Ir.fromBufferAttribute(e,m),Rn.add(Ir)),l=Math.max(l,s.distanceToSquared(Rn))}this.boundingSphere.radius=Math.sqrt(l),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,i=this.attributes;if(e===null||i.position===void 0||i.normal===void 0||i.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const s=i.position,l=i.normal,c=i.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new qi(new Float32Array(4*s.count),4));const d=this.getAttribute("tangent"),h=[],p=[];for(let J=0;J<s.count;J++)h[J]=new ae,p[J]=new ae;const m=new ae,_=new ae,x=new ae,S=new Bt,M=new Bt,T=new Bt,R=new ae,E=new ae;function v(J,D,w){m.fromBufferAttribute(s,J),_.fromBufferAttribute(s,D),x.fromBufferAttribute(s,w),S.fromBufferAttribute(c,J),M.fromBufferAttribute(c,D),T.fromBufferAttribute(c,w),_.sub(m),x.sub(m),M.sub(S),T.sub(S);const k=1/(M.x*T.y-T.x*M.y);isFinite(k)&&(R.copy(_).multiplyScalar(T.y).addScaledVector(x,-M.y).multiplyScalar(k),E.copy(x).multiplyScalar(M.x).addScaledVector(_,-T.x).multiplyScalar(k),h[J].add(R),h[D].add(R),h[w].add(R),p[J].add(E),p[D].add(E),p[w].add(E))}let B=this.groups;B.length===0&&(B=[{start:0,count:e.count}]);for(let J=0,D=B.length;J<D;++J){const w=B[J],k=w.start,ue=w.count;for(let q=k,le=k+ue;q<le;q+=3)v(e.getX(q+0),e.getX(q+1),e.getX(q+2))}const L=new ae,N=new ae,W=new ae,G=new ae;function z(J){W.fromBufferAttribute(l,J),G.copy(W);const D=h[J];L.copy(D),L.sub(W.multiplyScalar(W.dot(D))).normalize(),N.crossVectors(G,D);const k=N.dot(p[J])<0?-1:1;d.setXYZW(J,L.x,L.y,L.z,k)}for(let J=0,D=B.length;J<D;++J){const w=B[J],k=w.start,ue=w.count;for(let q=k,le=k+ue;q<le;q+=3)z(e.getX(q+0)),z(e.getX(q+1)),z(e.getX(q+2))}}computeVertexNormals(){const e=this.index,i=this.getAttribute("position");if(i!==void 0){let s=this.getAttribute("normal");if(s===void 0)s=new qi(new Float32Array(i.count*3),3),this.setAttribute("normal",s);else for(let S=0,M=s.count;S<M;S++)s.setXYZ(S,0,0,0);const l=new ae,c=new ae,d=new ae,h=new ae,p=new ae,m=new ae,_=new ae,x=new ae;if(e)for(let S=0,M=e.count;S<M;S+=3){const T=e.getX(S+0),R=e.getX(S+1),E=e.getX(S+2);l.fromBufferAttribute(i,T),c.fromBufferAttribute(i,R),d.fromBufferAttribute(i,E),_.subVectors(d,c),x.subVectors(l,c),_.cross(x),h.fromBufferAttribute(s,T),p.fromBufferAttribute(s,R),m.fromBufferAttribute(s,E),h.add(_),p.add(_),m.add(_),s.setXYZ(T,h.x,h.y,h.z),s.setXYZ(R,p.x,p.y,p.z),s.setXYZ(E,m.x,m.y,m.z)}else for(let S=0,M=i.count;S<M;S+=3)l.fromBufferAttribute(i,S+0),c.fromBufferAttribute(i,S+1),d.fromBufferAttribute(i,S+2),_.subVectors(d,c),x.subVectors(l,c),_.cross(x),s.setXYZ(S+0,_.x,_.y,_.z),s.setXYZ(S+1,_.x,_.y,_.z),s.setXYZ(S+2,_.x,_.y,_.z);this.normalizeNormals(),s.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let i=0,s=e.count;i<s;i++)Rn.fromBufferAttribute(e,i),Rn.normalize(),e.setXYZ(i,Rn.x,Rn.y,Rn.z)}toNonIndexed(){function e(h,p){const m=h.array,_=h.itemSize,x=h.normalized,S=new m.constructor(p.length*_);let M=0,T=0;for(let R=0,E=p.length;R<E;R++){h.isInterleavedBufferAttribute?M=p[R]*h.data.stride+h.offset:M=p[R]*_;for(let v=0;v<_;v++)S[T++]=m[M++]}return new qi(S,_,x)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const i=new zi,s=this.index.array,l=this.attributes;for(const h in l){const p=l[h],m=e(p,s);i.setAttribute(h,m)}const c=this.morphAttributes;for(const h in c){const p=[],m=c[h];for(let _=0,x=m.length;_<x;_++){const S=m[_],M=e(S,s);p.push(M)}i.morphAttributes[h]=p}i.morphTargetsRelative=this.morphTargetsRelative;const d=this.groups;for(let h=0,p=d.length;h<p;h++){const m=d[h];i.addGroup(m.start,m.count,m.materialIndex)}return i}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const p=this.parameters;for(const m in p)p[m]!==void 0&&(e[m]=p[m]);return e}e.data={attributes:{}};const i=this.index;i!==null&&(e.data.index={type:i.array.constructor.name,array:Array.prototype.slice.call(i.array)});const s=this.attributes;for(const p in s){const m=s[p];e.data.attributes[p]=m.toJSON(e.data)}const l={};let c=!1;for(const p in this.morphAttributes){const m=this.morphAttributes[p],_=[];for(let x=0,S=m.length;x<S;x++){const M=m[x];_.push(M.toJSON(e.data))}_.length>0&&(l[p]=_,c=!0)}c&&(e.data.morphAttributes=l,e.data.morphTargetsRelative=this.morphTargetsRelative);const d=this.groups;d.length>0&&(e.data.groups=JSON.parse(JSON.stringify(d)));const h=this.boundingSphere;return h!==null&&(e.data.boundingSphere=h.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const i={};this.name=e.name;const s=e.index;s!==null&&this.setIndex(s.clone());const l=e.attributes;for(const m in l){const _=l[m];this.setAttribute(m,_.clone(i))}const c=e.morphAttributes;for(const m in c){const _=[],x=c[m];for(let S=0,M=x.length;S<M;S++)_.push(x[S].clone(i));this.morphAttributes[m]=_}this.morphTargetsRelative=e.morphTargetsRelative;const d=e.groups;for(let m=0,_=d.length;m<_;m++){const x=d[m];this.addGroup(x.start,x.count,x.materialIndex)}const h=e.boundingBox;h!==null&&(this.boundingBox=h.clone());const p=e.boundingSphere;return p!==null&&(this.boundingSphere=p.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const t_=new sn,Bs=new r0,Lc=new su,n_=new ae,Oc=new ae,Pc=new ae,Bc=new ae,Ld=new ae,zc=new ae,i_=new ae,Ic=new ae;class Pi extends On{constructor(e=new zi,i=new c0){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=i,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,i){return super.copy(e,i),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const i=this.geometry.morphAttributes,s=Object.keys(i);if(s.length>0){const l=i[s[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,d=l.length;c<d;c++){const h=l[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=c}}}}getVertexPosition(e,i){const s=this.geometry,l=s.attributes.position,c=s.morphAttributes.position,d=s.morphTargetsRelative;i.fromBufferAttribute(l,e);const h=this.morphTargetInfluences;if(c&&h){zc.set(0,0,0);for(let p=0,m=c.length;p<m;p++){const _=h[p],x=c[p];_!==0&&(Ld.fromBufferAttribute(x,e),d?zc.addScaledVector(Ld,_):zc.addScaledVector(Ld.sub(i),_))}i.add(zc)}return i}raycast(e,i){const s=this.geometry,l=this.material,c=this.matrixWorld;l!==void 0&&(s.boundingSphere===null&&s.computeBoundingSphere(),Lc.copy(s.boundingSphere),Lc.applyMatrix4(c),Bs.copy(e.ray).recast(e.near),!(Lc.containsPoint(Bs.origin)===!1&&(Bs.intersectSphere(Lc,n_)===null||Bs.origin.distanceToSquared(n_)>(e.far-e.near)**2))&&(t_.copy(c).invert(),Bs.copy(e.ray).applyMatrix4(t_),!(s.boundingBox!==null&&Bs.intersectsBox(s.boundingBox)===!1)&&this._computeIntersections(e,i,Bs)))}_computeIntersections(e,i,s){let l;const c=this.geometry,d=this.material,h=c.index,p=c.attributes.position,m=c.attributes.uv,_=c.attributes.uv1,x=c.attributes.normal,S=c.groups,M=c.drawRange;if(h!==null)if(Array.isArray(d))for(let T=0,R=S.length;T<R;T++){const E=S[T],v=d[E.materialIndex],B=Math.max(E.start,M.start),L=Math.min(h.count,Math.min(E.start+E.count,M.start+M.count));for(let N=B,W=L;N<W;N+=3){const G=h.getX(N),z=h.getX(N+1),J=h.getX(N+2);l=Fc(this,v,e,s,m,_,x,G,z,J),l&&(l.faceIndex=Math.floor(N/3),l.face.materialIndex=E.materialIndex,i.push(l))}}else{const T=Math.max(0,M.start),R=Math.min(h.count,M.start+M.count);for(let E=T,v=R;E<v;E+=3){const B=h.getX(E),L=h.getX(E+1),N=h.getX(E+2);l=Fc(this,d,e,s,m,_,x,B,L,N),l&&(l.faceIndex=Math.floor(E/3),i.push(l))}}else if(p!==void 0)if(Array.isArray(d))for(let T=0,R=S.length;T<R;T++){const E=S[T],v=d[E.materialIndex],B=Math.max(E.start,M.start),L=Math.min(p.count,Math.min(E.start+E.count,M.start+M.count));for(let N=B,W=L;N<W;N+=3){const G=N,z=N+1,J=N+2;l=Fc(this,v,e,s,m,_,x,G,z,J),l&&(l.faceIndex=Math.floor(N/3),l.face.materialIndex=E.materialIndex,i.push(l))}}else{const T=Math.max(0,M.start),R=Math.min(p.count,M.start+M.count);for(let E=T,v=R;E<v;E+=3){const B=E,L=E+1,N=E+2;l=Fc(this,d,e,s,m,_,x,B,L,N),l&&(l.faceIndex=Math.floor(E/3),i.push(l))}}}}function EM(r,e,i,s,l,c,d,h){let p;if(e.side===Kn?p=s.intersectTriangle(d,c,l,!0,h):p=s.intersectTriangle(l,c,d,e.side===ls,h),p===null)return null;Ic.copy(h),Ic.applyMatrix4(r.matrixWorld);const m=i.ray.origin.distanceTo(Ic);return m<i.near||m>i.far?null:{distance:m,point:Ic.clone(),object:r}}function Fc(r,e,i,s,l,c,d,h,p,m){r.getVertexPosition(h,Oc),r.getVertexPosition(p,Pc),r.getVertexPosition(m,Bc);const _=EM(r,e,i,s,Oc,Pc,Bc,i_);if(_){const x=new ae;Li.getBarycoord(i_,Oc,Pc,Bc,x),l&&(_.uv=Li.getInterpolatedAttribute(l,h,p,m,x,new Bt)),c&&(_.uv1=Li.getInterpolatedAttribute(c,h,p,m,x,new Bt)),d&&(_.normal=Li.getInterpolatedAttribute(d,h,p,m,x,new ae),_.normal.dot(s.direction)>0&&_.normal.multiplyScalar(-1));const S={a:h,b:p,c:m,normal:new ae,materialIndex:0};Li.getNormal(Oc,Pc,Bc,S.normal),_.face=S,_.barycoord=x}return _}class io extends zi{constructor(e=1,i=1,s=1,l=1,c=1,d=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:i,depth:s,widthSegments:l,heightSegments:c,depthSegments:d};const h=this;l=Math.floor(l),c=Math.floor(c),d=Math.floor(d);const p=[],m=[],_=[],x=[];let S=0,M=0;T("z","y","x",-1,-1,s,i,e,d,c,0),T("z","y","x",1,-1,s,i,-e,d,c,1),T("x","z","y",1,1,e,s,i,l,d,2),T("x","z","y",1,-1,e,s,-i,l,d,3),T("x","y","z",1,-1,e,i,s,l,c,4),T("x","y","z",-1,-1,e,i,-s,l,c,5),this.setIndex(p),this.setAttribute("position",new Pn(m,3)),this.setAttribute("normal",new Pn(_,3)),this.setAttribute("uv",new Pn(x,2));function T(R,E,v,B,L,N,W,G,z,J,D){const w=N/z,k=W/J,ue=N/2,q=W/2,le=G/2,_e=z+1,U=J+1;let $=0,Z=0;const xe=new ae;for(let Ae=0;Ae<U;Ae++){const O=Ae*k-q;for(let se=0;se<_e;se++){const Me=se*w-ue;xe[R]=Me*B,xe[E]=O*L,xe[v]=le,m.push(xe.x,xe.y,xe.z),xe[R]=0,xe[E]=0,xe[v]=G>0?1:-1,_.push(xe.x,xe.y,xe.z),x.push(se/z),x.push(1-Ae/J),$+=1}}for(let Ae=0;Ae<J;Ae++)for(let O=0;O<z;O++){const se=S+O+_e*Ae,Me=S+O+_e*(Ae+1),K=S+(O+1)+_e*(Ae+1),he=S+(O+1)+_e*Ae;p.push(se,Me,he),p.push(Me,K,he),Z+=6}h.addGroup(M,Z,D),M+=Z,S+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new io(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function $r(r){const e={};for(const i in r){e[i]={};for(const s in r[i]){const l=r[i][s];l&&(l.isColor||l.isMatrix3||l.isMatrix4||l.isVector2||l.isVector3||l.isVector4||l.isTexture||l.isQuaternion)?l.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[i][s]=null):e[i][s]=l.clone():Array.isArray(l)?e[i][s]=l.slice():e[i][s]=l}}return e}function Vn(r){const e={};for(let i=0;i<r.length;i++){const s=$r(r[i]);for(const l in s)e[l]=s[l]}return e}function bM(r){const e=[];for(let i=0;i<r.length;i++)e.push(r[i].clone());return e}function d0(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ut.workingColorSpace}const TM={clone:$r,merge:Vn};var AM=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,RM=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class cs extends no{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=AM,this.fragmentShader=RM,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=$r(e.uniforms),this.uniformsGroups=bM(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const i=super.toJSON(e);i.glslVersion=this.glslVersion,i.uniforms={};for(const l in this.uniforms){const d=this.uniforms[l].value;d&&d.isTexture?i.uniforms[l]={type:"t",value:d.toJSON(e).uuid}:d&&d.isColor?i.uniforms[l]={type:"c",value:d.getHex()}:d&&d.isVector2?i.uniforms[l]={type:"v2",value:d.toArray()}:d&&d.isVector3?i.uniforms[l]={type:"v3",value:d.toArray()}:d&&d.isVector4?i.uniforms[l]={type:"v4",value:d.toArray()}:d&&d.isMatrix3?i.uniforms[l]={type:"m3",value:d.toArray()}:d&&d.isMatrix4?i.uniforms[l]={type:"m4",value:d.toArray()}:i.uniforms[l]={value:d}}Object.keys(this.defines).length>0&&(i.defines=this.defines),i.vertexShader=this.vertexShader,i.fragmentShader=this.fragmentShader,i.lights=this.lights,i.clipping=this.clipping;const s={};for(const l in this.extensions)this.extensions[l]===!0&&(s[l]=!0);return Object.keys(s).length>0&&(i.extensions=s),i}}class h0 extends On{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new sn,this.projectionMatrix=new sn,this.projectionMatrixInverse=new sn,this.coordinateSystem=Ta}copy(e,i){return super.copy(e,i),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,i){super.updateWorldMatrix(e,i),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const as=new ae,a_=new Bt,s_=new Bt;class Mi extends h0{constructor(e=50,i=1,s=.1,l=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=s,this.far=l,this.focus=10,this.aspect=i,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,i){return super.copy(e,i),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const i=.5*this.getFilmHeight()/e;this.fov=pl*2*Math.atan(i),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ol*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return pl*2*Math.atan(Math.tan(ol*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,i,s){as.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(as.x,as.y).multiplyScalar(-e/as.z),as.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),s.set(as.x,as.y).multiplyScalar(-e/as.z)}getViewSize(e,i){return this.getViewBounds(e,a_,s_),i.subVectors(s_,a_)}setViewOffset(e,i,s,l,c,d){this.aspect=e/i,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=i,this.view.offsetX=s,this.view.offsetY=l,this.view.width=c,this.view.height=d,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let i=e*Math.tan(ol*.5*this.fov)/this.zoom,s=2*i,l=this.aspect*s,c=-.5*l;const d=this.view;if(this.view!==null&&this.view.enabled){const p=d.fullWidth,m=d.fullHeight;c+=d.offsetX*l/p,i-=d.offsetY*s/m,l*=d.width/p,s*=d.height/m}const h=this.filmOffset;h!==0&&(c+=e*h/this.getFilmWidth()),this.projectionMatrix.makePerspective(c,c+l,i,i-s,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const i=super.toJSON(e);return i.object.fov=this.fov,i.object.zoom=this.zoom,i.object.near=this.near,i.object.far=this.far,i.object.focus=this.focus,i.object.aspect=this.aspect,this.view!==null&&(i.object.view=Object.assign({},this.view)),i.object.filmGauge=this.filmGauge,i.object.filmOffset=this.filmOffset,i}}const Fr=-90,Hr=1;class CM extends On{constructor(e,i,s){super(),this.type="CubeCamera",this.renderTarget=s,this.coordinateSystem=null,this.activeMipmapLevel=0;const l=new Mi(Fr,Hr,e,i);l.layers=this.layers,this.add(l);const c=new Mi(Fr,Hr,e,i);c.layers=this.layers,this.add(c);const d=new Mi(Fr,Hr,e,i);d.layers=this.layers,this.add(d);const h=new Mi(Fr,Hr,e,i);h.layers=this.layers,this.add(h);const p=new Mi(Fr,Hr,e,i);p.layers=this.layers,this.add(p);const m=new Mi(Fr,Hr,e,i);m.layers=this.layers,this.add(m)}updateCoordinateSystem(){const e=this.coordinateSystem,i=this.children.concat(),[s,l,c,d,h,p]=i;for(const m of i)this.remove(m);if(e===Ta)s.up.set(0,1,0),s.lookAt(1,0,0),l.up.set(0,1,0),l.lookAt(-1,0,0),c.up.set(0,0,-1),c.lookAt(0,1,0),d.up.set(0,0,1),d.lookAt(0,-1,0),h.up.set(0,1,0),h.lookAt(0,0,1),p.up.set(0,1,0),p.lookAt(0,0,-1);else if(e===eu)s.up.set(0,-1,0),s.lookAt(-1,0,0),l.up.set(0,-1,0),l.lookAt(1,0,0),c.up.set(0,0,1),c.lookAt(0,1,0),d.up.set(0,0,-1),d.lookAt(0,-1,0),h.up.set(0,-1,0),h.lookAt(0,0,1),p.up.set(0,-1,0),p.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const m of i)this.add(m),m.updateMatrixWorld()}update(e,i){this.parent===null&&this.updateMatrixWorld();const{renderTarget:s,activeMipmapLevel:l}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[c,d,h,p,m,_]=this.children,x=e.getRenderTarget(),S=e.getActiveCubeFace(),M=e.getActiveMipmapLevel(),T=e.xr.enabled;e.xr.enabled=!1;const R=s.texture.generateMipmaps;s.texture.generateMipmaps=!1,e.setRenderTarget(s,0,l),e.render(i,c),e.setRenderTarget(s,1,l),e.render(i,d),e.setRenderTarget(s,2,l),e.render(i,h),e.setRenderTarget(s,3,l),e.render(i,p),e.setRenderTarget(s,4,l),e.render(i,m),s.texture.generateMipmaps=R,e.setRenderTarget(s,5,l),e.render(i,_),e.setRenderTarget(x,S,M),e.xr.enabled=T,s.texture.needsPMREMUpdate=!0}}class p0 extends jn{constructor(e=[],i=Kr,s,l,c,d,h,p,m,_){super(e,i,s,l,c,d,h,p,m,_),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class wM extends qs{constructor(e=1,i={}){super(e,e,i),this.isWebGLCubeRenderTarget=!0;const s={width:e,height:e,depth:1},l=[s,s,s,s,s,s];this.texture=new p0(l),this._setTextureOptions(i),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,i){this.texture.type=i.type,this.texture.colorSpace=i.colorSpace,this.texture.generateMipmaps=i.generateMipmaps,this.texture.minFilter=i.minFilter,this.texture.magFilter=i.magFilter;const s={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},l=new io(5,5,5),c=new cs({name:"CubemapFromEquirect",uniforms:$r(s.uniforms),vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,side:Kn,blending:rs});c.uniforms.tEquirect.value=i;const d=new Pi(l,c),h=i.minFilter;return i.minFilter===Xs&&(i.minFilter=Wi),new CM(1,10,this).update(e,d),i.minFilter=h,d.geometry.dispose(),d.material.dispose(),this}clear(e,i=!0,s=!0,l=!0){const c=e.getRenderTarget();for(let d=0;d<6;d++)e.setRenderTarget(this,d),e.clear(i,s,l);e.setRenderTarget(c)}}class Hc extends On{constructor(){super(),this.isGroup=!0,this.type="Group"}}const NM={type:"move"};class Od{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Hc,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Hc,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new ae,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new ae),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Hc,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new ae,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new ae),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const i=this._hand;if(i)for(const s of e.hand.values())this._getHandJoint(i,s)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,i,s){let l=null,c=null,d=null;const h=this._targetRay,p=this._grip,m=this._hand;if(e&&i.session.visibilityState!=="visible-blurred"){if(m&&e.hand){d=!0;for(const R of e.hand.values()){const E=i.getJointPose(R,s),v=this._getHandJoint(m,R);E!==null&&(v.matrix.fromArray(E.transform.matrix),v.matrix.decompose(v.position,v.rotation,v.scale),v.matrixWorldNeedsUpdate=!0,v.jointRadius=E.radius),v.visible=E!==null}const _=m.joints["index-finger-tip"],x=m.joints["thumb-tip"],S=_.position.distanceTo(x.position),M=.02,T=.005;m.inputState.pinching&&S>M+T?(m.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!m.inputState.pinching&&S<=M-T&&(m.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else p!==null&&e.gripSpace&&(c=i.getPose(e.gripSpace,s),c!==null&&(p.matrix.fromArray(c.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,c.linearVelocity?(p.hasLinearVelocity=!0,p.linearVelocity.copy(c.linearVelocity)):p.hasLinearVelocity=!1,c.angularVelocity?(p.hasAngularVelocity=!0,p.angularVelocity.copy(c.angularVelocity)):p.hasAngularVelocity=!1));h!==null&&(l=i.getPose(e.targetRaySpace,s),l===null&&c!==null&&(l=c),l!==null&&(h.matrix.fromArray(l.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,l.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(l.linearVelocity)):h.hasLinearVelocity=!1,l.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(l.angularVelocity)):h.hasAngularVelocity=!1,this.dispatchEvent(NM)))}return h!==null&&(h.visible=l!==null),p!==null&&(p.visible=c!==null),m!==null&&(m.visible=d!==null),this}_getHandJoint(e,i){if(e.joints[i.jointName]===void 0){const s=new Hc;s.matrixAutoUpdate=!1,s.visible=!1,e.joints[i.jointName]=s,e.add(s)}return e.joints[i.jointName]}}class cl{constructor(e,i=25e-5){this.isFogExp2=!0,this.name="",this.color=new mt(e),this.density=i}clone(){return new cl(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class DM extends On{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Zi,this.environmentIntensity=1,this.environmentRotation=new Zi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,i){return super.copy(e,i),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const i=super.toJSON(e);return this.fog!==null&&(i.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(i.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(i.object.backgroundIntensity=this.backgroundIntensity),i.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(i.object.environmentIntensity=this.environmentIntensity),i.object.environmentRotation=this.environmentRotation.toArray(),i}}const Pd=new ae,UM=new ae,LM=new ht;class Hs{constructor(e=new ae(1,0,0),i=0){this.isPlane=!0,this.normal=e,this.constant=i}set(e,i){return this.normal.copy(e),this.constant=i,this}setComponents(e,i,s,l){return this.normal.set(e,i,s),this.constant=l,this}setFromNormalAndCoplanarPoint(e,i){return this.normal.copy(e),this.constant=-i.dot(this.normal),this}setFromCoplanarPoints(e,i,s){const l=Pd.subVectors(s,i).cross(UM.subVectors(e,i)).normalize();return this.setFromNormalAndCoplanarPoint(l,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,i){return i.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,i){const s=e.delta(Pd),l=this.normal.dot(s);if(l===0)return this.distanceToPoint(e.start)===0?i.copy(e.start):null;const c=-(e.start.dot(this.normal)+this.constant)/l;return c<0||c>1?null:i.copy(e.start).addScaledVector(s,c)}intersectsLine(e){const i=this.distanceToPoint(e.start),s=this.distanceToPoint(e.end);return i<0&&s>0||s<0&&i>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,i){const s=i||LM.getNormalMatrix(e),l=this.coplanarPoint(Pd).applyMatrix4(e),c=this.normal.applyMatrix3(s).normalize();return this.constant=-l.dot(c),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const zs=new su,OM=new Bt(.5,.5),Gc=new ae;class Vh{constructor(e=new Hs,i=new Hs,s=new Hs,l=new Hs,c=new Hs,d=new Hs){this.planes=[e,i,s,l,c,d]}set(e,i,s,l,c,d){const h=this.planes;return h[0].copy(e),h[1].copy(i),h[2].copy(s),h[3].copy(l),h[4].copy(c),h[5].copy(d),this}copy(e){const i=this.planes;for(let s=0;s<6;s++)i[s].copy(e.planes[s]);return this}setFromProjectionMatrix(e,i=Ta){const s=this.planes,l=e.elements,c=l[0],d=l[1],h=l[2],p=l[3],m=l[4],_=l[5],x=l[6],S=l[7],M=l[8],T=l[9],R=l[10],E=l[11],v=l[12],B=l[13],L=l[14],N=l[15];if(s[0].setComponents(p-c,S-m,E-M,N-v).normalize(),s[1].setComponents(p+c,S+m,E+M,N+v).normalize(),s[2].setComponents(p+d,S+_,E+T,N+B).normalize(),s[3].setComponents(p-d,S-_,E-T,N-B).normalize(),s[4].setComponents(p-h,S-x,E-R,N-L).normalize(),i===Ta)s[5].setComponents(p+h,S+x,E+R,N+L).normalize();else if(i===eu)s[5].setComponents(h,x,R,L).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+i);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),zs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const i=e.geometry;i.boundingSphere===null&&i.computeBoundingSphere(),zs.copy(i.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(zs)}intersectsSprite(e){zs.center.set(0,0,0);const i=OM.distanceTo(e.center);return zs.radius=.7071067811865476+i,zs.applyMatrix4(e.matrixWorld),this.intersectsSphere(zs)}intersectsSphere(e){const i=this.planes,s=e.center,l=-e.radius;for(let c=0;c<6;c++)if(i[c].distanceToPoint(s)<l)return!1;return!0}intersectsBox(e){const i=this.planes;for(let s=0;s<6;s++){const l=i[s];if(Gc.x=l.normal.x>0?e.max.x:e.min.x,Gc.y=l.normal.y>0?e.max.y:e.min.y,Gc.z=l.normal.z>0?e.max.z:e.min.z,l.distanceToPoint(Gc)<0)return!1}return!0}containsPoint(e){const i=this.planes;for(let s=0;s<6;s++)if(i[s].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class m0 extends no{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new mt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const nu=new ae,iu=new ae,r_=new sn,al=new r0,Vc=new su,Bd=new ae,o_=new ae;class PM extends On{constructor(e=new zi,i=new m0){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=i,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,i){return super.copy(e,i),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const i=e.attributes.position,s=[0];for(let l=1,c=i.count;l<c;l++)nu.fromBufferAttribute(i,l-1),iu.fromBufferAttribute(i,l),s[l]=s[l-1],s[l]+=nu.distanceTo(iu);e.setAttribute("lineDistance",new Pn(s,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,i){const s=this.geometry,l=this.matrixWorld,c=e.params.Line.threshold,d=s.drawRange;if(s.boundingSphere===null&&s.computeBoundingSphere(),Vc.copy(s.boundingSphere),Vc.applyMatrix4(l),Vc.radius+=c,e.ray.intersectsSphere(Vc)===!1)return;r_.copy(l).invert(),al.copy(e.ray).applyMatrix4(r_);const h=c/((this.scale.x+this.scale.y+this.scale.z)/3),p=h*h,m=this.isLineSegments?2:1,_=s.index,S=s.attributes.position;if(_!==null){const M=Math.max(0,d.start),T=Math.min(_.count,d.start+d.count);for(let R=M,E=T-1;R<E;R+=m){const v=_.getX(R),B=_.getX(R+1),L=jc(this,e,al,p,v,B,R);L&&i.push(L)}if(this.isLineLoop){const R=_.getX(T-1),E=_.getX(M),v=jc(this,e,al,p,R,E,T-1);v&&i.push(v)}}else{const M=Math.max(0,d.start),T=Math.min(S.count,d.start+d.count);for(let R=M,E=T-1;R<E;R+=m){const v=jc(this,e,al,p,R,R+1,R);v&&i.push(v)}if(this.isLineLoop){const R=jc(this,e,al,p,T-1,M,T-1);R&&i.push(R)}}}updateMorphTargets(){const i=this.geometry.morphAttributes,s=Object.keys(i);if(s.length>0){const l=i[s[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,d=l.length;c<d;c++){const h=l[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=c}}}}}function jc(r,e,i,s,l,c,d){const h=r.geometry.attributes.position;if(nu.fromBufferAttribute(h,l),iu.fromBufferAttribute(h,c),i.distanceSqToSegment(nu,iu,Bd,o_)>s)return;Bd.applyMatrix4(r.matrixWorld);const m=e.ray.origin.distanceTo(Bd);if(!(m<e.near||m>e.far))return{distance:m,point:o_.clone().applyMatrix4(r.matrixWorld),index:d,face:null,faceIndex:null,barycoord:null,object:r}}const l_=new ae,c_=new ae;class BM extends PM{constructor(e,i){super(e,i),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const i=e.attributes.position,s=[];for(let l=0,c=i.count;l<c;l+=2)l_.fromBufferAttribute(i,l),c_.fromBufferAttribute(i,l+1),s[l]=l===0?0:s[l-1],s[l+1]=s[l]+l_.distanceTo(c_);e.setAttribute("lineDistance",new Pn(s,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class rR extends jn{constructor(e,i,s,l,c,d,h,p,m,_,x,S){super(null,d,h,p,m,_,l,c,x,S),this.isCompressedTexture=!0,this.image={width:i,height:s},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}class g0 extends jn{constructor(e,i,s=Ws,l,c,d,h=Bi,p=Bi,m,_=dl,x=1){if(_!==dl&&_!==hl)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const S={width:e,height:i,depth:x};super(S,l,c,d,h,p,_,s,m),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Gh(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const i=super.toJSON(e);return this.compareFunction!==null&&(i.compareFunction=this.compareFunction),i}}class ru extends zi{constructor(e=1,i=1,s=1,l=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:i,widthSegments:s,heightSegments:l};const c=e/2,d=i/2,h=Math.floor(s),p=Math.floor(l),m=h+1,_=p+1,x=e/h,S=i/p,M=[],T=[],R=[],E=[];for(let v=0;v<_;v++){const B=v*S-d;for(let L=0;L<m;L++){const N=L*x-c;T.push(N,-B,0),R.push(0,0,1),E.push(L/h),E.push(1-v/p)}}for(let v=0;v<p;v++)for(let B=0;B<h;B++){const L=B+m*v,N=B+m*(v+1),W=B+1+m*(v+1),G=B+1+m*v;M.push(L,N,G),M.push(N,W,G)}this.setIndex(M),this.setAttribute("position",new Pn(T,3)),this.setAttribute("normal",new Pn(R,3)),this.setAttribute("uv",new Pn(E,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ru(e.width,e.height,e.widthSegments,e.heightSegments)}}class jh extends zi{constructor(e=1,i=32,s=16,l=0,c=Math.PI*2,d=0,h=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:i,heightSegments:s,phiStart:l,phiLength:c,thetaStart:d,thetaLength:h},i=Math.max(3,Math.floor(i)),s=Math.max(2,Math.floor(s));const p=Math.min(d+h,Math.PI);let m=0;const _=[],x=new ae,S=new ae,M=[],T=[],R=[],E=[];for(let v=0;v<=s;v++){const B=[],L=v/s;let N=0;v===0&&d===0?N=.5/i:v===s&&p===Math.PI&&(N=-.5/i);for(let W=0;W<=i;W++){const G=W/i;x.x=-e*Math.cos(l+G*c)*Math.sin(d+L*h),x.y=e*Math.cos(d+L*h),x.z=e*Math.sin(l+G*c)*Math.sin(d+L*h),T.push(x.x,x.y,x.z),S.copy(x).normalize(),R.push(S.x,S.y,S.z),E.push(G+N,1-L),B.push(m++)}_.push(B)}for(let v=0;v<s;v++)for(let B=0;B<i;B++){const L=_[v][B+1],N=_[v][B],W=_[v+1][B],G=_[v+1][B+1];(v!==0||d>0)&&M.push(L,N,G),(v!==s-1||p<Math.PI)&&M.push(N,W,G)}this.setIndex(M),this.setAttribute("position",new Pn(T,3)),this.setAttribute("normal",new Pn(R,3)),this.setAttribute("uv",new Pn(E,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new jh(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class kh extends zi{constructor(e=1,i=.4,s=12,l=48,c=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:i,radialSegments:s,tubularSegments:l,arc:c},s=Math.floor(s),l=Math.floor(l);const d=[],h=[],p=[],m=[],_=new ae,x=new ae,S=new ae;for(let M=0;M<=s;M++)for(let T=0;T<=l;T++){const R=T/l*c,E=M/s*Math.PI*2;x.x=(e+i*Math.cos(E))*Math.cos(R),x.y=(e+i*Math.cos(E))*Math.sin(R),x.z=i*Math.sin(E),h.push(x.x,x.y,x.z),_.x=e*Math.cos(R),_.y=e*Math.sin(R),S.subVectors(x,_).normalize(),p.push(S.x,S.y,S.z),m.push(T/l),m.push(M/s)}for(let M=1;M<=s;M++)for(let T=1;T<=l;T++){const R=(l+1)*M+T-1,E=(l+1)*(M-1)+T-1,v=(l+1)*(M-1)+T,B=(l+1)*M+T;d.push(R,E,B),d.push(E,v,B)}this.setIndex(d),this.setAttribute("position",new Pn(h,3)),this.setAttribute("normal",new Pn(p,3)),this.setAttribute("uv",new Pn(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new kh(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class jr extends no{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new mt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new mt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=n0,this.normalScale=new Bt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Zi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class zM extends no{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=DS,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class IM extends no{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class v0 extends On{constructor(e,i=1){super(),this.isLight=!0,this.type="Light",this.color=new mt(e),this.intensity=i}dispose(){}copy(e,i){return super.copy(e,i),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const i=super.toJSON(e);return i.object.color=this.color.getHex(),i.object.intensity=this.intensity,this.groundColor!==void 0&&(i.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(i.object.distance=this.distance),this.angle!==void 0&&(i.object.angle=this.angle),this.decay!==void 0&&(i.object.decay=this.decay),this.penumbra!==void 0&&(i.object.penumbra=this.penumbra),this.shadow!==void 0&&(i.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(i.object.target=this.target.uuid),i}}const zd=new sn,u_=new ae,f_=new ae;class FM{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Bt(512,512),this.mapType=Yi,this.map=null,this.mapPass=null,this.matrix=new sn,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Vh,this._frameExtents=new Bt(1,1),this._viewportCount=1,this._viewports=[new cn(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const i=this.camera,s=this.matrix;u_.setFromMatrixPosition(e.matrixWorld),i.position.copy(u_),f_.setFromMatrixPosition(e.target.matrixWorld),i.lookAt(f_),i.updateMatrixWorld(),zd.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(zd),s.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),s.multiply(zd)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class _0 extends h0{constructor(e=-1,i=1,s=1,l=-1,c=.1,d=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=i,this.top=s,this.bottom=l,this.near=c,this.far=d,this.updateProjectionMatrix()}copy(e,i){return super.copy(e,i),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,i,s,l,c,d){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=i,this.view.offsetX=s,this.view.offsetY=l,this.view.width=c,this.view.height=d,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),i=(this.top-this.bottom)/(2*this.zoom),s=(this.right+this.left)/2,l=(this.top+this.bottom)/2;let c=s-e,d=s+e,h=l+i,p=l-i;if(this.view!==null&&this.view.enabled){const m=(this.right-this.left)/this.view.fullWidth/this.zoom,_=(this.top-this.bottom)/this.view.fullHeight/this.zoom;c+=m*this.view.offsetX,d=c+m*this.view.width,h-=_*this.view.offsetY,p=h-_*this.view.height}this.projectionMatrix.makeOrthographic(c,d,h,p,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const i=super.toJSON(e);return i.object.zoom=this.zoom,i.object.left=this.left,i.object.right=this.right,i.object.top=this.top,i.object.bottom=this.bottom,i.object.near=this.near,i.object.far=this.far,this.view!==null&&(i.object.view=Object.assign({},this.view)),i}}class HM extends FM{constructor(){super(new _0(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class GM extends v0{constructor(e,i){super(e,i),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(On.DEFAULT_UP),this.updateMatrix(),this.target=new On,this.shadow=new HM}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class VM extends v0{constructor(e,i){super(e,i),this.isAmbientLight=!0,this.type="AmbientLight"}}class jM extends Mi{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Xh="\\[\\]\\.:\\/",kM=new RegExp("["+Xh+"]","g"),Wh="[^"+Xh+"]",XM="[^"+Xh.replace("\\.","")+"]",WM=/((?:WC+[\/:])*)/.source.replace("WC",Wh),qM=/(WCOD+)?/.source.replace("WCOD",XM),YM=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Wh),ZM=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Wh),KM=new RegExp("^"+WM+qM+YM+ZM+"$"),QM=["material","materials","bones","map"];class JM{constructor(e,i,s){const l=s||Kt.parseTrackName(i);this._targetGroup=e,this._bindings=e.subscribe_(i,l)}getValue(e,i){this.bind();const s=this._targetGroup.nCachedObjects_,l=this._bindings[s];l!==void 0&&l.getValue(e,i)}setValue(e,i){const s=this._bindings;for(let l=this._targetGroup.nCachedObjects_,c=s.length;l!==c;++l)s[l].setValue(e,i)}bind(){const e=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=e.length;i!==s;++i)e[i].bind()}unbind(){const e=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=e.length;i!==s;++i)e[i].unbind()}}class Kt{constructor(e,i,s){this.path=i,this.parsedPath=s||Kt.parseTrackName(i),this.node=Kt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,i,s){return e&&e.isAnimationObjectGroup?new Kt.Composite(e,i,s):new Kt(e,i,s)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(kM,"")}static parseTrackName(e){const i=KM.exec(e);if(i===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const s={nodeName:i[2],objectName:i[3],objectIndex:i[4],propertyName:i[5],propertyIndex:i[6]},l=s.nodeName&&s.nodeName.lastIndexOf(".");if(l!==void 0&&l!==-1){const c=s.nodeName.substring(l+1);QM.indexOf(c)!==-1&&(s.nodeName=s.nodeName.substring(0,l),s.objectName=c)}if(s.propertyName===null||s.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return s}static findNode(e,i){if(i===void 0||i===""||i==="."||i===-1||i===e.name||i===e.uuid)return e;if(e.skeleton){const s=e.skeleton.getBoneByName(i);if(s!==void 0)return s}if(e.children){const s=function(c){for(let d=0;d<c.length;d++){const h=c[d];if(h.name===i||h.uuid===i)return h;const p=s(h.children);if(p)return p}return null},l=s(e.children);if(l)return l}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,i){e[i]=this.targetObject[this.propertyName]}_getValue_array(e,i){const s=this.resolvedProperty;for(let l=0,c=s.length;l!==c;++l)e[i++]=s[l]}_getValue_arrayElement(e,i){e[i]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,i){this.resolvedProperty.toArray(e,i)}_setValue_direct(e,i){this.targetObject[this.propertyName]=e[i]}_setValue_direct_setNeedsUpdate(e,i){this.targetObject[this.propertyName]=e[i],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,i){this.targetObject[this.propertyName]=e[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,i){const s=this.resolvedProperty;for(let l=0,c=s.length;l!==c;++l)s[l]=e[i++]}_setValue_array_setNeedsUpdate(e,i){const s=this.resolvedProperty;for(let l=0,c=s.length;l!==c;++l)s[l]=e[i++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,i){const s=this.resolvedProperty;for(let l=0,c=s.length;l!==c;++l)s[l]=e[i++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,i){this.resolvedProperty[this.propertyIndex]=e[i]}_setValue_arrayElement_setNeedsUpdate(e,i){this.resolvedProperty[this.propertyIndex]=e[i],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,i){this.resolvedProperty[this.propertyIndex]=e[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,i){this.resolvedProperty.fromArray(e,i)}_setValue_fromArray_setNeedsUpdate(e,i){this.resolvedProperty.fromArray(e,i),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,i){this.resolvedProperty.fromArray(e,i),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,i){this.bind(),this.getValue(e,i)}_setValue_unbound(e,i){this.bind(),this.setValue(e,i)}bind(){let e=this.node;const i=this.parsedPath,s=i.objectName,l=i.propertyName;let c=i.propertyIndex;if(e||(e=Kt.findNode(this.rootNode,i.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(s){let m=i.objectIndex;switch(s){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let _=0;_<e.length;_++)if(e[_].name===m){m=_;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[s]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[s]}if(m!==void 0){if(e[m]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[m]}}const d=e[l];if(d===void 0){const m=i.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+m+"."+l+" but it wasn't found.",e);return}let h=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?h=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(h=this.Versioning.MatrixWorldNeedsUpdate);let p=this.BindingType.Direct;if(c!==void 0){if(l==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[c]!==void 0&&(c=e.morphTargetDictionary[c])}p=this.BindingType.ArrayElement,this.resolvedProperty=d,this.propertyIndex=c}else d.fromArray!==void 0&&d.toArray!==void 0?(p=this.BindingType.HasFromToArray,this.resolvedProperty=d):Array.isArray(d)?(p=this.BindingType.EntireArray,this.resolvedProperty=d):this.propertyName=l;this.getValue=this.GetterByBindingType[p],this.setValue=this.SetterByBindingTypeAndVersioning[p][h]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Kt.Composite=JM;Kt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Kt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Kt.prototype.GetterByBindingType=[Kt.prototype._getValue_direct,Kt.prototype._getValue_array,Kt.prototype._getValue_arrayElement,Kt.prototype._getValue_toArray];Kt.prototype.SetterByBindingTypeAndVersioning=[[Kt.prototype._setValue_direct,Kt.prototype._setValue_direct_setNeedsUpdate,Kt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Kt.prototype._setValue_array,Kt.prototype._setValue_array_setNeedsUpdate,Kt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Kt.prototype._setValue_arrayElement,Kt.prototype._setValue_arrayElement_setNeedsUpdate,Kt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Kt.prototype._setValue_fromArray,Kt.prototype._setValue_fromArray_setNeedsUpdate,Kt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class $M extends BM{constructor(e=10,i=10,s=4473924,l=8947848){s=new mt(s),l=new mt(l);const c=i/2,d=e/i,h=e/2,p=[],m=[];for(let S=0,M=0,T=-h;S<=i;S++,T+=d){p.push(-h,0,T,h,0,T),p.push(T,0,-h,T,0,h);const R=S===c?s:l;R.toArray(m,M),M+=3,R.toArray(m,M),M+=3,R.toArray(m,M),M+=3,R.toArray(m,M),M+=3}const _=new zi;_.setAttribute("position",new Pn(p,3)),_.setAttribute("color",new Pn(m,3));const x=new m0({vertexColors:!0,toneMapped:!1});super(_,x),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}function d_(r,e,i,s){const l=eE(s);switch(i){case Q_:return r*e;case $_:return r*e/l.components*l.byteLength;case zh:return r*e/l.components*l.byteLength;case e0:return r*e*2/l.components*l.byteLength;case Ih:return r*e*2/l.components*l.byteLength;case J_:return r*e*3/l.components*l.byteLength;case Oi:return r*e*4/l.components*l.byteLength;case Fh:return r*e*4/l.components*l.byteLength;case qc:case Yc:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Zc:case Kc:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case sh:case oh:return Math.max(r,16)*Math.max(e,8)/4;case ah:case rh:return Math.max(r,8)*Math.max(e,8)/2;case lh:case ch:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case uh:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case fh:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case dh:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case hh:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case ph:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case mh:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case gh:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case vh:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case _h:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case xh:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case yh:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Sh:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case Mh:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case Eh:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case bh:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Qc:case Th:case Ah:return Math.ceil(r/4)*Math.ceil(e/4)*16;case t0:case Rh:return Math.ceil(r/4)*Math.ceil(e/4)*8;case Ch:case wh:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${i} format.`)}function eE(r){switch(r){case Yi:case Y_:return{byteLength:1,components:1};case ul:case Z_:case ml:return{byteLength:2,components:1};case Ph:case Bh:return{byteLength:2,components:4};case Ws:case Oh:case ba:return{byteLength:4,components:1};case K_:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Lh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Lh);function x0(){let r=null,e=!1,i=null,s=null;function l(c,d){i(c,d),s=r.requestAnimationFrame(l)}return{start:function(){e!==!0&&i!==null&&(s=r.requestAnimationFrame(l),e=!0)},stop:function(){r.cancelAnimationFrame(s),e=!1},setAnimationLoop:function(c){i=c},setContext:function(c){r=c}}}function tE(r){const e=new WeakMap;function i(h,p){const m=h.array,_=h.usage,x=m.byteLength,S=r.createBuffer();r.bindBuffer(p,S),r.bufferData(p,m,_),h.onUploadCallback();let M;if(m instanceof Float32Array)M=r.FLOAT;else if(typeof Float16Array<"u"&&m instanceof Float16Array)M=r.HALF_FLOAT;else if(m instanceof Uint16Array)h.isFloat16BufferAttribute?M=r.HALF_FLOAT:M=r.UNSIGNED_SHORT;else if(m instanceof Int16Array)M=r.SHORT;else if(m instanceof Uint32Array)M=r.UNSIGNED_INT;else if(m instanceof Int32Array)M=r.INT;else if(m instanceof Int8Array)M=r.BYTE;else if(m instanceof Uint8Array)M=r.UNSIGNED_BYTE;else if(m instanceof Uint8ClampedArray)M=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+m);return{buffer:S,type:M,bytesPerElement:m.BYTES_PER_ELEMENT,version:h.version,size:x}}function s(h,p,m){const _=p.array,x=p.updateRanges;if(r.bindBuffer(m,h),x.length===0)r.bufferSubData(m,0,_);else{x.sort((M,T)=>M.start-T.start);let S=0;for(let M=1;M<x.length;M++){const T=x[S],R=x[M];R.start<=T.start+T.count+1?T.count=Math.max(T.count,R.start+R.count-T.start):(++S,x[S]=R)}x.length=S+1;for(let M=0,T=x.length;M<T;M++){const R=x[M];r.bufferSubData(m,R.start*_.BYTES_PER_ELEMENT,_,R.start,R.count)}p.clearUpdateRanges()}p.onUploadCallback()}function l(h){return h.isInterleavedBufferAttribute&&(h=h.data),e.get(h)}function c(h){h.isInterleavedBufferAttribute&&(h=h.data);const p=e.get(h);p&&(r.deleteBuffer(p.buffer),e.delete(h))}function d(h,p){if(h.isInterleavedBufferAttribute&&(h=h.data),h.isGLBufferAttribute){const _=e.get(h);(!_||_.version<h.version)&&e.set(h,{buffer:h.buffer,type:h.type,bytesPerElement:h.elementSize,version:h.version});return}const m=e.get(h);if(m===void 0)e.set(h,i(h,p));else if(m.version<h.version){if(m.size!==h.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(m.buffer,h,p),m.version=h.version}}return{get:l,remove:c,update:d}}var nE=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,iE=`#ifdef USE_ALPHAHASH
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
#endif`,aE=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,sE=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,rE=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,oE=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,lE=`#ifdef USE_AOMAP
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
#endif`,cE=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,uE=`#ifdef USE_BATCHING
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
#endif`,fE=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,dE=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,hE=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,pE=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,mE=`#ifdef USE_IRIDESCENCE
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
#endif`,gE=`#ifdef USE_BUMPMAP
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
#endif`,vE=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,_E=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,xE=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,yE=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,SE=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,ME=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,EE=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,bE=`#if defined( USE_COLOR_ALPHA )
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
#endif`,TE=`#define PI 3.141592653589793
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
} // validated`,AE=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,RE=`vec3 transformedNormal = objectNormal;
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
#endif`,CE=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wE=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,NE=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,DE=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,UE="gl_FragColor = linearToOutputTexel( gl_FragColor );",LE=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,OE=`#ifdef USE_ENVMAP
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
#endif`,PE=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,BE=`#ifdef USE_ENVMAP
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
#endif`,zE=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,IE=`#ifdef USE_ENVMAP
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
#endif`,FE=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,HE=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,GE=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,VE=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,jE=`#ifdef USE_GRADIENTMAP
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
}`,kE=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,XE=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,WE=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,qE=`uniform bool receiveShadow;
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
#endif`,YE=`#ifdef USE_ENVMAP
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
#endif`,ZE=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,KE=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,QE=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,JE=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,$E=`PhysicalMaterial material;
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
#endif`,eb=`struct PhysicalMaterial {
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
}`,tb=`
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
#endif`,nb=`#if defined( RE_IndirectDiffuse )
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
#endif`,ib=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ab=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,sb=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,rb=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ob=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,lb=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,cb=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ub=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,fb=`#if defined( USE_POINTS_UV )
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
#endif`,db=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,hb=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,pb=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,mb=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,gb=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,vb=`#ifdef USE_MORPHTARGETS
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
#endif`,_b=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xb=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,yb=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Sb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Mb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Eb=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,bb=`#ifdef USE_NORMALMAP
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
#endif`,Tb=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ab=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Rb=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Cb=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,wb=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Nb=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Db=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ub=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Lb=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ob=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Pb=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Bb=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,zb=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ib=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Fb=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Hb=`float getShadowMask() {
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
}`,Gb=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Vb=`#ifdef USE_SKINNING
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
#endif`,jb=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,kb=`#ifdef USE_SKINNING
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
#endif`,Xb=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Wb=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,qb=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Yb=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Zb=`#ifdef USE_TRANSMISSION
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
#endif`,Kb=`#ifdef USE_TRANSMISSION
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
#endif`,Qb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Jb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,$b=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`;const tT=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,nT=`uniform sampler2D t2D;
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
}`,iT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,aT=`#ifdef ENVMAP_TYPE_CUBE
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
}`,rT=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,oT=`#include <common>
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
}`,lT=`#if DEPTH_PACKING == 3200
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
}`,uT=`#define DISTANCE
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
}`,fT=`varying vec3 vWorldDirection;
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
}`,hT=`uniform float scale;
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
}`,pT=`uniform vec3 diffuse;
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
}`,mT=`#include <common>
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
}`,gT=`uniform vec3 diffuse;
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
}`,_T=`#define LAMBERT
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
}`,ST=`#define NORMAL
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
}`,MT=`#define NORMAL
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
}`,ET=`#define PHONG
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
}`,TT=`#define STANDARD
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
}`,AT=`#define STANDARD
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
}`,RT=`#define TOON
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
}`,CT=`#define TOON
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
}`,wT=`uniform float size;
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
}`,NT=`uniform vec3 diffuse;
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
}`,DT=`#include <common>
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
}`,UT=`uniform vec3 color;
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
}`,LT=`uniform float rotation;
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
}`,OT=`uniform vec3 diffuse;
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
}`,pt={alphahash_fragment:nE,alphahash_pars_fragment:iE,alphamap_fragment:aE,alphamap_pars_fragment:sE,alphatest_fragment:rE,alphatest_pars_fragment:oE,aomap_fragment:lE,aomap_pars_fragment:cE,batching_pars_vertex:uE,batching_vertex:fE,begin_vertex:dE,beginnormal_vertex:hE,bsdfs:pE,iridescence_fragment:mE,bumpmap_pars_fragment:gE,clipping_planes_fragment:vE,clipping_planes_pars_fragment:_E,clipping_planes_pars_vertex:xE,clipping_planes_vertex:yE,color_fragment:SE,color_pars_fragment:ME,color_pars_vertex:EE,color_vertex:bE,common:TE,cube_uv_reflection_fragment:AE,defaultnormal_vertex:RE,displacementmap_pars_vertex:CE,displacementmap_vertex:wE,emissivemap_fragment:NE,emissivemap_pars_fragment:DE,colorspace_fragment:UE,colorspace_pars_fragment:LE,envmap_fragment:OE,envmap_common_pars_fragment:PE,envmap_pars_fragment:BE,envmap_pars_vertex:zE,envmap_physical_pars_fragment:YE,envmap_vertex:IE,fog_vertex:FE,fog_pars_vertex:HE,fog_fragment:GE,fog_pars_fragment:VE,gradientmap_pars_fragment:jE,lightmap_pars_fragment:kE,lights_lambert_fragment:XE,lights_lambert_pars_fragment:WE,lights_pars_begin:qE,lights_toon_fragment:ZE,lights_toon_pars_fragment:KE,lights_phong_fragment:QE,lights_phong_pars_fragment:JE,lights_physical_fragment:$E,lights_physical_pars_fragment:eb,lights_fragment_begin:tb,lights_fragment_maps:nb,lights_fragment_end:ib,logdepthbuf_fragment:ab,logdepthbuf_pars_fragment:sb,logdepthbuf_pars_vertex:rb,logdepthbuf_vertex:ob,map_fragment:lb,map_pars_fragment:cb,map_particle_fragment:ub,map_particle_pars_fragment:fb,metalnessmap_fragment:db,metalnessmap_pars_fragment:hb,morphinstance_vertex:pb,morphcolor_vertex:mb,morphnormal_vertex:gb,morphtarget_pars_vertex:vb,morphtarget_vertex:_b,normal_fragment_begin:xb,normal_fragment_maps:yb,normal_pars_fragment:Sb,normal_pars_vertex:Mb,normal_vertex:Eb,normalmap_pars_fragment:bb,clearcoat_normal_fragment_begin:Tb,clearcoat_normal_fragment_maps:Ab,clearcoat_pars_fragment:Rb,iridescence_pars_fragment:Cb,opaque_fragment:wb,packing:Nb,premultiplied_alpha_fragment:Db,project_vertex:Ub,dithering_fragment:Lb,dithering_pars_fragment:Ob,roughnessmap_fragment:Pb,roughnessmap_pars_fragment:Bb,shadowmap_pars_fragment:zb,shadowmap_pars_vertex:Ib,shadowmap_vertex:Fb,shadowmask_pars_fragment:Hb,skinbase_vertex:Gb,skinning_pars_vertex:Vb,skinning_vertex:jb,skinnormal_vertex:kb,specularmap_fragment:Xb,specularmap_pars_fragment:Wb,tonemapping_fragment:qb,tonemapping_pars_fragment:Yb,transmission_fragment:Zb,transmission_pars_fragment:Kb,uv_pars_fragment:Qb,uv_pars_vertex:Jb,uv_vertex:$b,worldpos_vertex:eT,background_vert:tT,background_frag:nT,backgroundCube_vert:iT,backgroundCube_frag:aT,cube_vert:sT,cube_frag:rT,depth_vert:oT,depth_frag:lT,distanceRGBA_vert:cT,distanceRGBA_frag:uT,equirect_vert:fT,equirect_frag:dT,linedashed_vert:hT,linedashed_frag:pT,meshbasic_vert:mT,meshbasic_frag:gT,meshlambert_vert:vT,meshlambert_frag:_T,meshmatcap_vert:xT,meshmatcap_frag:yT,meshnormal_vert:ST,meshnormal_frag:MT,meshphong_vert:ET,meshphong_frag:bT,meshphysical_vert:TT,meshphysical_frag:AT,meshtoon_vert:RT,meshtoon_frag:CT,points_vert:wT,points_frag:NT,shadow_vert:DT,shadow_frag:UT,sprite_vert:LT,sprite_frag:OT},Pe={common:{diffuse:{value:new mt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ht},alphaMap:{value:null},alphaMapTransform:{value:new ht},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ht}},envmap:{envMap:{value:null},envMapRotation:{value:new ht},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ht}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ht}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ht},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ht},normalScale:{value:new Bt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ht},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ht}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ht}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ht}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new mt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new mt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ht},alphaTest:{value:0},uvTransform:{value:new ht}},sprite:{diffuse:{value:new mt(16777215)},opacity:{value:1},center:{value:new Bt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ht},alphaMap:{value:null},alphaMapTransform:{value:new ht},alphaTest:{value:0}}},Xi={basic:{uniforms:Vn([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.fog]),vertexShader:pt.meshbasic_vert,fragmentShader:pt.meshbasic_frag},lambert:{uniforms:Vn([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,Pe.lights,{emissive:{value:new mt(0)}}]),vertexShader:pt.meshlambert_vert,fragmentShader:pt.meshlambert_frag},phong:{uniforms:Vn([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,Pe.lights,{emissive:{value:new mt(0)},specular:{value:new mt(1118481)},shininess:{value:30}}]),vertexShader:pt.meshphong_vert,fragmentShader:pt.meshphong_frag},standard:{uniforms:Vn([Pe.common,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.roughnessmap,Pe.metalnessmap,Pe.fog,Pe.lights,{emissive:{value:new mt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag},toon:{uniforms:Vn([Pe.common,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.gradientmap,Pe.fog,Pe.lights,{emissive:{value:new mt(0)}}]),vertexShader:pt.meshtoon_vert,fragmentShader:pt.meshtoon_frag},matcap:{uniforms:Vn([Pe.common,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,{matcap:{value:null}}]),vertexShader:pt.meshmatcap_vert,fragmentShader:pt.meshmatcap_frag},points:{uniforms:Vn([Pe.points,Pe.fog]),vertexShader:pt.points_vert,fragmentShader:pt.points_frag},dashed:{uniforms:Vn([Pe.common,Pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:pt.linedashed_vert,fragmentShader:pt.linedashed_frag},depth:{uniforms:Vn([Pe.common,Pe.displacementmap]),vertexShader:pt.depth_vert,fragmentShader:pt.depth_frag},normal:{uniforms:Vn([Pe.common,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,{opacity:{value:1}}]),vertexShader:pt.meshnormal_vert,fragmentShader:pt.meshnormal_frag},sprite:{uniforms:Vn([Pe.sprite,Pe.fog]),vertexShader:pt.sprite_vert,fragmentShader:pt.sprite_frag},background:{uniforms:{uvTransform:{value:new ht},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:pt.background_vert,fragmentShader:pt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ht}},vertexShader:pt.backgroundCube_vert,fragmentShader:pt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:pt.cube_vert,fragmentShader:pt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:pt.equirect_vert,fragmentShader:pt.equirect_frag},distanceRGBA:{uniforms:Vn([Pe.common,Pe.displacementmap,{referencePosition:{value:new ae},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:pt.distanceRGBA_vert,fragmentShader:pt.distanceRGBA_frag},shadow:{uniforms:Vn([Pe.lights,Pe.fog,{color:{value:new mt(0)},opacity:{value:1}}]),vertexShader:pt.shadow_vert,fragmentShader:pt.shadow_frag}};Xi.physical={uniforms:Vn([Xi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ht},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ht},clearcoatNormalScale:{value:new Bt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ht},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ht},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ht},sheen:{value:0},sheenColor:{value:new mt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ht},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ht},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ht},transmissionSamplerSize:{value:new Bt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ht},attenuationDistance:{value:0},attenuationColor:{value:new mt(0)},specularColor:{value:new mt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ht},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ht},anisotropyVector:{value:new Bt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ht}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag};const kc={r:0,b:0,g:0},Is=new Zi,PT=new sn;function BT(r,e,i,s,l,c,d){const h=new mt(0);let p=c===!0?0:1,m,_,x=null,S=0,M=null;function T(L){let N=L.isScene===!0?L.background:null;return N&&N.isTexture&&(N=(L.backgroundBlurriness>0?i:e).get(N)),N}function R(L){let N=!1;const W=T(L);W===null?v(h,p):W&&W.isColor&&(v(W,1),N=!0);const G=r.xr.getEnvironmentBlendMode();G==="additive"?s.buffers.color.setClear(0,0,0,1,d):G==="alpha-blend"&&s.buffers.color.setClear(0,0,0,0,d),(r.autoClear||N)&&(s.buffers.depth.setTest(!0),s.buffers.depth.setMask(!0),s.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function E(L,N){const W=T(N);W&&(W.isCubeTexture||W.mapping===au)?(_===void 0&&(_=new Pi(new io(1,1,1),new cs({name:"BackgroundCubeMaterial",uniforms:$r(Xi.backgroundCube.uniforms),vertexShader:Xi.backgroundCube.vertexShader,fragmentShader:Xi.backgroundCube.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),_.geometry.deleteAttribute("normal"),_.geometry.deleteAttribute("uv"),_.onBeforeRender=function(G,z,J){this.matrixWorld.copyPosition(J.matrixWorld)},Object.defineProperty(_.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),l.update(_)),Is.copy(N.backgroundRotation),Is.x*=-1,Is.y*=-1,Is.z*=-1,W.isCubeTexture&&W.isRenderTargetTexture===!1&&(Is.y*=-1,Is.z*=-1),_.material.uniforms.envMap.value=W,_.material.uniforms.flipEnvMap.value=W.isCubeTexture&&W.isRenderTargetTexture===!1?-1:1,_.material.uniforms.backgroundBlurriness.value=N.backgroundBlurriness,_.material.uniforms.backgroundIntensity.value=N.backgroundIntensity,_.material.uniforms.backgroundRotation.value.setFromMatrix4(PT.makeRotationFromEuler(Is)),_.material.toneMapped=Ut.getTransfer(W.colorSpace)!==Zt,(x!==W||S!==W.version||M!==r.toneMapping)&&(_.material.needsUpdate=!0,x=W,S=W.version,M=r.toneMapping),_.layers.enableAll(),L.unshift(_,_.geometry,_.material,0,0,null)):W&&W.isTexture&&(m===void 0&&(m=new Pi(new ru(2,2),new cs({name:"BackgroundMaterial",uniforms:$r(Xi.background.uniforms),vertexShader:Xi.background.vertexShader,fragmentShader:Xi.background.fragmentShader,side:ls,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),l.update(m)),m.material.uniforms.t2D.value=W,m.material.uniforms.backgroundIntensity.value=N.backgroundIntensity,m.material.toneMapped=Ut.getTransfer(W.colorSpace)!==Zt,W.matrixAutoUpdate===!0&&W.updateMatrix(),m.material.uniforms.uvTransform.value.copy(W.matrix),(x!==W||S!==W.version||M!==r.toneMapping)&&(m.material.needsUpdate=!0,x=W,S=W.version,M=r.toneMapping),m.layers.enableAll(),L.unshift(m,m.geometry,m.material,0,0,null))}function v(L,N){L.getRGB(kc,d0(r)),s.buffers.color.setClear(kc.r,kc.g,kc.b,N,d)}function B(){_!==void 0&&(_.geometry.dispose(),_.material.dispose(),_=void 0),m!==void 0&&(m.geometry.dispose(),m.material.dispose(),m=void 0)}return{getClearColor:function(){return h},setClearColor:function(L,N=1){h.set(L),p=N,v(h,p)},getClearAlpha:function(){return p},setClearAlpha:function(L){p=L,v(h,p)},render:R,addToRenderList:E,dispose:B}}function zT(r,e){const i=r.getParameter(r.MAX_VERTEX_ATTRIBS),s={},l=S(null);let c=l,d=!1;function h(w,k,ue,q,le){let _e=!1;const U=x(q,ue,k);c!==U&&(c=U,m(c.object)),_e=M(w,q,ue,le),_e&&T(w,q,ue,le),le!==null&&e.update(le,r.ELEMENT_ARRAY_BUFFER),(_e||d)&&(d=!1,N(w,k,ue,q),le!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(le).buffer))}function p(){return r.createVertexArray()}function m(w){return r.bindVertexArray(w)}function _(w){return r.deleteVertexArray(w)}function x(w,k,ue){const q=ue.wireframe===!0;let le=s[w.id];le===void 0&&(le={},s[w.id]=le);let _e=le[k.id];_e===void 0&&(_e={},le[k.id]=_e);let U=_e[q];return U===void 0&&(U=S(p()),_e[q]=U),U}function S(w){const k=[],ue=[],q=[];for(let le=0;le<i;le++)k[le]=0,ue[le]=0,q[le]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:k,enabledAttributes:ue,attributeDivisors:q,object:w,attributes:{},index:null}}function M(w,k,ue,q){const le=c.attributes,_e=k.attributes;let U=0;const $=ue.getAttributes();for(const Z in $)if($[Z].location>=0){const Ae=le[Z];let O=_e[Z];if(O===void 0&&(Z==="instanceMatrix"&&w.instanceMatrix&&(O=w.instanceMatrix),Z==="instanceColor"&&w.instanceColor&&(O=w.instanceColor)),Ae===void 0||Ae.attribute!==O||O&&Ae.data!==O.data)return!0;U++}return c.attributesNum!==U||c.index!==q}function T(w,k,ue,q){const le={},_e=k.attributes;let U=0;const $=ue.getAttributes();for(const Z in $)if($[Z].location>=0){let Ae=_e[Z];Ae===void 0&&(Z==="instanceMatrix"&&w.instanceMatrix&&(Ae=w.instanceMatrix),Z==="instanceColor"&&w.instanceColor&&(Ae=w.instanceColor));const O={};O.attribute=Ae,Ae&&Ae.data&&(O.data=Ae.data),le[Z]=O,U++}c.attributes=le,c.attributesNum=U,c.index=q}function R(){const w=c.newAttributes;for(let k=0,ue=w.length;k<ue;k++)w[k]=0}function E(w){v(w,0)}function v(w,k){const ue=c.newAttributes,q=c.enabledAttributes,le=c.attributeDivisors;ue[w]=1,q[w]===0&&(r.enableVertexAttribArray(w),q[w]=1),le[w]!==k&&(r.vertexAttribDivisor(w,k),le[w]=k)}function B(){const w=c.newAttributes,k=c.enabledAttributes;for(let ue=0,q=k.length;ue<q;ue++)k[ue]!==w[ue]&&(r.disableVertexAttribArray(ue),k[ue]=0)}function L(w,k,ue,q,le,_e,U){U===!0?r.vertexAttribIPointer(w,k,ue,le,_e):r.vertexAttribPointer(w,k,ue,q,le,_e)}function N(w,k,ue,q){R();const le=q.attributes,_e=ue.getAttributes(),U=k.defaultAttributeValues;for(const $ in _e){const Z=_e[$];if(Z.location>=0){let xe=le[$];if(xe===void 0&&($==="instanceMatrix"&&w.instanceMatrix&&(xe=w.instanceMatrix),$==="instanceColor"&&w.instanceColor&&(xe=w.instanceColor)),xe!==void 0){const Ae=xe.normalized,O=xe.itemSize,se=e.get(xe);if(se===void 0)continue;const Me=se.buffer,K=se.type,he=se.bytesPerElement,Re=K===r.INT||K===r.UNSIGNED_INT||xe.gpuType===Oh;if(xe.isInterleavedBufferAttribute){const Ee=xe.data,ze=Ee.stride,Je=xe.offset;if(Ee.isInstancedInterleavedBuffer){for(let $e=0;$e<Z.locationSize;$e++)v(Z.location+$e,Ee.meshPerAttribute);w.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=Ee.meshPerAttribute*Ee.count)}else for(let $e=0;$e<Z.locationSize;$e++)E(Z.location+$e);r.bindBuffer(r.ARRAY_BUFFER,Me);for(let $e=0;$e<Z.locationSize;$e++)L(Z.location+$e,O/Z.locationSize,K,Ae,ze*he,(Je+O/Z.locationSize*$e)*he,Re)}else{if(xe.isInstancedBufferAttribute){for(let Ee=0;Ee<Z.locationSize;Ee++)v(Z.location+Ee,xe.meshPerAttribute);w.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=xe.meshPerAttribute*xe.count)}else for(let Ee=0;Ee<Z.locationSize;Ee++)E(Z.location+Ee);r.bindBuffer(r.ARRAY_BUFFER,Me);for(let Ee=0;Ee<Z.locationSize;Ee++)L(Z.location+Ee,O/Z.locationSize,K,Ae,O*he,O/Z.locationSize*Ee*he,Re)}}else if(U!==void 0){const Ae=U[$];if(Ae!==void 0)switch(Ae.length){case 2:r.vertexAttrib2fv(Z.location,Ae);break;case 3:r.vertexAttrib3fv(Z.location,Ae);break;case 4:r.vertexAttrib4fv(Z.location,Ae);break;default:r.vertexAttrib1fv(Z.location,Ae)}}}}B()}function W(){J();for(const w in s){const k=s[w];for(const ue in k){const q=k[ue];for(const le in q)_(q[le].object),delete q[le];delete k[ue]}delete s[w]}}function G(w){if(s[w.id]===void 0)return;const k=s[w.id];for(const ue in k){const q=k[ue];for(const le in q)_(q[le].object),delete q[le];delete k[ue]}delete s[w.id]}function z(w){for(const k in s){const ue=s[k];if(ue[w.id]===void 0)continue;const q=ue[w.id];for(const le in q)_(q[le].object),delete q[le];delete ue[w.id]}}function J(){D(),d=!0,c!==l&&(c=l,m(c.object))}function D(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:J,resetDefaultState:D,dispose:W,releaseStatesOfGeometry:G,releaseStatesOfProgram:z,initAttributes:R,enableAttribute:E,disableUnusedAttributes:B}}function IT(r,e,i){let s;function l(m){s=m}function c(m,_){r.drawArrays(s,m,_),i.update(_,s,1)}function d(m,_,x){x!==0&&(r.drawArraysInstanced(s,m,_,x),i.update(_,s,x))}function h(m,_,x){if(x===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(s,m,0,_,0,x);let M=0;for(let T=0;T<x;T++)M+=_[T];i.update(M,s,1)}function p(m,_,x,S){if(x===0)return;const M=e.get("WEBGL_multi_draw");if(M===null)for(let T=0;T<m.length;T++)d(m[T],_[T],S[T]);else{M.multiDrawArraysInstancedWEBGL(s,m,0,_,0,S,0,x);let T=0;for(let R=0;R<x;R++)T+=_[R]*S[R];i.update(T,s,1)}}this.setMode=l,this.render=c,this.renderInstances=d,this.renderMultiDraw=h,this.renderMultiDrawInstances=p}function FT(r,e,i,s){let l;function c(){if(l!==void 0)return l;if(e.has("EXT_texture_filter_anisotropic")===!0){const z=e.get("EXT_texture_filter_anisotropic");l=r.getParameter(z.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else l=0;return l}function d(z){return!(z!==Oi&&s.convert(z)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function h(z){const J=z===ml&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(z!==Yi&&s.convert(z)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&z!==ba&&!J)}function p(z){if(z==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";z="mediump"}return z==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let m=i.precision!==void 0?i.precision:"highp";const _=p(m);_!==m&&(console.warn("THREE.WebGLRenderer:",m,"not supported, using",_,"instead."),m=_);const x=i.logarithmicDepthBuffer===!0,S=i.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),M=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),T=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),R=r.getParameter(r.MAX_TEXTURE_SIZE),E=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),v=r.getParameter(r.MAX_VERTEX_ATTRIBS),B=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),L=r.getParameter(r.MAX_VARYING_VECTORS),N=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),W=T>0,G=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:c,getMaxPrecision:p,textureFormatReadable:d,textureTypeReadable:h,precision:m,logarithmicDepthBuffer:x,reverseDepthBuffer:S,maxTextures:M,maxVertexTextures:T,maxTextureSize:R,maxCubemapSize:E,maxAttributes:v,maxVertexUniforms:B,maxVaryings:L,maxFragmentUniforms:N,vertexTextures:W,maxSamples:G}}function HT(r){const e=this;let i=null,s=0,l=!1,c=!1;const d=new Hs,h=new ht,p={value:null,needsUpdate:!1};this.uniform=p,this.numPlanes=0,this.numIntersection=0,this.init=function(x,S){const M=x.length!==0||S||s!==0||l;return l=S,s=x.length,M},this.beginShadows=function(){c=!0,_(null)},this.endShadows=function(){c=!1},this.setGlobalState=function(x,S){i=_(x,S,0)},this.setState=function(x,S,M){const T=x.clippingPlanes,R=x.clipIntersection,E=x.clipShadows,v=r.get(x);if(!l||T===null||T.length===0||c&&!E)c?_(null):m();else{const B=c?0:s,L=B*4;let N=v.clippingState||null;p.value=N,N=_(T,S,L,M);for(let W=0;W!==L;++W)N[W]=i[W];v.clippingState=N,this.numIntersection=R?this.numPlanes:0,this.numPlanes+=B}};function m(){p.value!==i&&(p.value=i,p.needsUpdate=s>0),e.numPlanes=s,e.numIntersection=0}function _(x,S,M,T){const R=x!==null?x.length:0;let E=null;if(R!==0){if(E=p.value,T!==!0||E===null){const v=M+R*4,B=S.matrixWorldInverse;h.getNormalMatrix(B),(E===null||E.length<v)&&(E=new Float32Array(v));for(let L=0,N=M;L!==R;++L,N+=4)d.copy(x[L]).applyMatrix4(B,h),d.normal.toArray(E,N),E[N+3]=d.constant}p.value=E,p.needsUpdate=!0}return e.numPlanes=R,e.numIntersection=0,E}}function GT(r){let e=new WeakMap;function i(d,h){return h===eh?d.mapping=Kr:h===th&&(d.mapping=Qr),d}function s(d){if(d&&d.isTexture){const h=d.mapping;if(h===eh||h===th)if(e.has(d)){const p=e.get(d).texture;return i(p,d.mapping)}else{const p=d.image;if(p&&p.height>0){const m=new wM(p.height);return m.fromEquirectangularTexture(r,d),e.set(d,m),d.addEventListener("dispose",l),i(m.texture,d.mapping)}else return null}}return d}function l(d){const h=d.target;h.removeEventListener("dispose",l);const p=e.get(h);p!==void 0&&(e.delete(h),p.dispose())}function c(){e=new WeakMap}return{get:s,dispose:c}}const kr=4,h_=[.125,.215,.35,.446,.526,.582],js=20,Id=new _0,p_=new mt;let Fd=null,Hd=0,Gd=0,Vd=!1;const Gs=(1+Math.sqrt(5))/2,Gr=1/Gs,m_=[new ae(-Gs,Gr,0),new ae(Gs,Gr,0),new ae(-Gr,0,Gs),new ae(Gr,0,Gs),new ae(0,Gs,-Gr),new ae(0,Gs,Gr),new ae(-1,1,-1),new ae(1,1,-1),new ae(-1,1,1),new ae(1,1,1)],VT=new ae;class g_{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,i=0,s=.1,l=100,c={}){const{size:d=256,position:h=VT}=c;Fd=this._renderer.getRenderTarget(),Hd=this._renderer.getActiveCubeFace(),Gd=this._renderer.getActiveMipmapLevel(),Vd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(d);const p=this._allocateTargets();return p.depthBuffer=!0,this._sceneToCubeUV(e,s,l,p,h),i>0&&this._blur(p,0,0,i),this._applyPMREM(p),this._cleanup(p),p}fromEquirectangular(e,i=null){return this._fromTexture(e,i)}fromCubemap(e,i=null){return this._fromTexture(e,i)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=x_(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=__(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Fd,Hd,Gd),this._renderer.xr.enabled=Vd,e.scissorTest=!1,Xc(e,0,0,e.width,e.height)}_fromTexture(e,i){e.mapping===Kr||e.mapping===Qr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Fd=this._renderer.getRenderTarget(),Hd=this._renderer.getActiveCubeFace(),Gd=this._renderer.getActiveMipmapLevel(),Vd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const s=i||this._allocateTargets();return this._textureToCubeUV(e,s),this._applyPMREM(s),this._cleanup(s),s}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),i=4*this._cubeSize,s={magFilter:Wi,minFilter:Wi,generateMipmaps:!1,type:ml,format:Oi,colorSpace:Jr,depthBuffer:!1},l=v_(e,i,s);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==i){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=v_(e,i,s);const{_lodMax:c}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=jT(c)),this._blurMaterial=kT(c,e,i)}return l}_compileMaterial(e){const i=new Pi(this._lodPlanes[0],e);this._renderer.compile(i,Id)}_sceneToCubeUV(e,i,s,l,c){const p=new Mi(90,1,i,s),m=[1,-1,1,1,1,1],_=[1,1,1,-1,-1,-1],x=this._renderer,S=x.autoClear,M=x.toneMapping;x.getClearColor(p_),x.toneMapping=os,x.autoClear=!1;const T=new c0({name:"PMREM.Background",side:Kn,depthWrite:!1,depthTest:!1}),R=new Pi(new io,T);let E=!1;const v=e.background;v?v.isColor&&(T.color.copy(v),e.background=null,E=!0):(T.color.copy(p_),E=!0);for(let B=0;B<6;B++){const L=B%3;L===0?(p.up.set(0,m[B],0),p.position.set(c.x,c.y,c.z),p.lookAt(c.x+_[B],c.y,c.z)):L===1?(p.up.set(0,0,m[B]),p.position.set(c.x,c.y,c.z),p.lookAt(c.x,c.y+_[B],c.z)):(p.up.set(0,m[B],0),p.position.set(c.x,c.y,c.z),p.lookAt(c.x,c.y,c.z+_[B]));const N=this._cubeSize;Xc(l,L*N,B>2?N:0,N,N),x.setRenderTarget(l),E&&x.render(R,p),x.render(e,p)}R.geometry.dispose(),R.material.dispose(),x.toneMapping=M,x.autoClear=S,e.background=v}_textureToCubeUV(e,i){const s=this._renderer,l=e.mapping===Kr||e.mapping===Qr;l?(this._cubemapMaterial===null&&(this._cubemapMaterial=x_()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=__());const c=l?this._cubemapMaterial:this._equirectMaterial,d=new Pi(this._lodPlanes[0],c),h=c.uniforms;h.envMap.value=e;const p=this._cubeSize;Xc(i,0,0,3*p,2*p),s.setRenderTarget(i),s.render(d,Id)}_applyPMREM(e){const i=this._renderer,s=i.autoClear;i.autoClear=!1;const l=this._lodPlanes.length;for(let c=1;c<l;c++){const d=Math.sqrt(this._sigmas[c]*this._sigmas[c]-this._sigmas[c-1]*this._sigmas[c-1]),h=m_[(l-c-1)%m_.length];this._blur(e,c-1,c,d,h)}i.autoClear=s}_blur(e,i,s,l,c){const d=this._pingPongRenderTarget;this._halfBlur(e,d,i,s,l,"latitudinal",c),this._halfBlur(d,e,s,s,l,"longitudinal",c)}_halfBlur(e,i,s,l,c,d,h){const p=this._renderer,m=this._blurMaterial;d!=="latitudinal"&&d!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const _=3,x=new Pi(this._lodPlanes[l],m),S=m.uniforms,M=this._sizeLods[s]-1,T=isFinite(c)?Math.PI/(2*M):2*Math.PI/(2*js-1),R=c/T,E=isFinite(c)?1+Math.floor(_*R):js;E>js&&console.warn(`sigmaRadians, ${c}, is too large and will clip, as it requested ${E} samples when the maximum is set to ${js}`);const v=[];let B=0;for(let z=0;z<js;++z){const J=z/R,D=Math.exp(-J*J/2);v.push(D),z===0?B+=D:z<E&&(B+=2*D)}for(let z=0;z<v.length;z++)v[z]=v[z]/B;S.envMap.value=e.texture,S.samples.value=E,S.weights.value=v,S.latitudinal.value=d==="latitudinal",h&&(S.poleAxis.value=h);const{_lodMax:L}=this;S.dTheta.value=T,S.mipInt.value=L-s;const N=this._sizeLods[l],W=3*N*(l>L-kr?l-L+kr:0),G=4*(this._cubeSize-N);Xc(i,W,G,3*N,2*N),p.setRenderTarget(i),p.render(x,Id)}}function jT(r){const e=[],i=[],s=[];let l=r;const c=r-kr+1+h_.length;for(let d=0;d<c;d++){const h=Math.pow(2,l);i.push(h);let p=1/h;d>r-kr?p=h_[d-r+kr-1]:d===0&&(p=0),s.push(p);const m=1/(h-2),_=-m,x=1+m,S=[_,_,x,_,x,x,_,_,x,x,_,x],M=6,T=6,R=3,E=2,v=1,B=new Float32Array(R*T*M),L=new Float32Array(E*T*M),N=new Float32Array(v*T*M);for(let G=0;G<M;G++){const z=G%3*2/3-1,J=G>2?0:-1,D=[z,J,0,z+2/3,J,0,z+2/3,J+1,0,z,J,0,z+2/3,J+1,0,z,J+1,0];B.set(D,R*T*G),L.set(S,E*T*G);const w=[G,G,G,G,G,G];N.set(w,v*T*G)}const W=new zi;W.setAttribute("position",new qi(B,R)),W.setAttribute("uv",new qi(L,E)),W.setAttribute("faceIndex",new qi(N,v)),e.push(W),l>kr&&l--}return{lodPlanes:e,sizeLods:i,sigmas:s}}function v_(r,e,i){const s=new qs(r,e,i);return s.texture.mapping=au,s.texture.name="PMREM.cubeUv",s.scissorTest=!0,s}function Xc(r,e,i,s,l){r.viewport.set(e,i,s,l),r.scissor.set(e,i,s,l)}function kT(r,e,i){const s=new Float32Array(js),l=new ae(0,1,0);return new cs({name:"SphericalGaussianBlur",defines:{n:js,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/i,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:s},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:l}},vertexShader:qh(),fragmentShader:`

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
		`,blending:rs,depthTest:!1,depthWrite:!1})}function __(){return new cs({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:qh(),fragmentShader:`

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
		`,blending:rs,depthTest:!1,depthWrite:!1})}function x_(){return new cs({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:rs,depthTest:!1,depthWrite:!1})}function qh(){return`

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
	`}function XT(r){let e=new WeakMap,i=null;function s(h){if(h&&h.isTexture){const p=h.mapping,m=p===eh||p===th,_=p===Kr||p===Qr;if(m||_){let x=e.get(h);const S=x!==void 0?x.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==S)return i===null&&(i=new g_(r)),x=m?i.fromEquirectangular(h,x):i.fromCubemap(h,x),x.texture.pmremVersion=h.pmremVersion,e.set(h,x),x.texture;if(x!==void 0)return x.texture;{const M=h.image;return m&&M&&M.height>0||_&&M&&l(M)?(i===null&&(i=new g_(r)),x=m?i.fromEquirectangular(h):i.fromCubemap(h),x.texture.pmremVersion=h.pmremVersion,e.set(h,x),h.addEventListener("dispose",c),x.texture):null}}}return h}function l(h){let p=0;const m=6;for(let _=0;_<m;_++)h[_]!==void 0&&p++;return p===m}function c(h){const p=h.target;p.removeEventListener("dispose",c);const m=e.get(p);m!==void 0&&(e.delete(p),m.dispose())}function d(){e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:d}}function WT(r){const e={};function i(s){if(e[s]!==void 0)return e[s];let l;switch(s){case"WEBGL_depth_texture":l=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":l=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":l=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":l=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:l=r.getExtension(s)}return e[s]=l,l}return{has:function(s){return i(s)!==null},init:function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},get:function(s){const l=i(s);return l===null&&qr("THREE.WebGLRenderer: "+s+" extension not supported."),l}}}function qT(r,e,i,s){const l={},c=new WeakMap;function d(x){const S=x.target;S.index!==null&&e.remove(S.index);for(const T in S.attributes)e.remove(S.attributes[T]);S.removeEventListener("dispose",d),delete l[S.id];const M=c.get(S);M&&(e.remove(M),c.delete(S)),s.releaseStatesOfGeometry(S),S.isInstancedBufferGeometry===!0&&delete S._maxInstanceCount,i.memory.geometries--}function h(x,S){return l[S.id]===!0||(S.addEventListener("dispose",d),l[S.id]=!0,i.memory.geometries++),S}function p(x){const S=x.attributes;for(const M in S)e.update(S[M],r.ARRAY_BUFFER)}function m(x){const S=[],M=x.index,T=x.attributes.position;let R=0;if(M!==null){const B=M.array;R=M.version;for(let L=0,N=B.length;L<N;L+=3){const W=B[L+0],G=B[L+1],z=B[L+2];S.push(W,G,G,z,z,W)}}else if(T!==void 0){const B=T.array;R=T.version;for(let L=0,N=B.length/3-1;L<N;L+=3){const W=L+0,G=L+1,z=L+2;S.push(W,G,G,z,z,W)}}else return;const E=new(a0(S)?f0:u0)(S,1);E.version=R;const v=c.get(x);v&&e.remove(v),c.set(x,E)}function _(x){const S=c.get(x);if(S){const M=x.index;M!==null&&S.version<M.version&&m(x)}else m(x);return c.get(x)}return{get:h,update:p,getWireframeAttribute:_}}function YT(r,e,i){let s;function l(S){s=S}let c,d;function h(S){c=S.type,d=S.bytesPerElement}function p(S,M){r.drawElements(s,M,c,S*d),i.update(M,s,1)}function m(S,M,T){T!==0&&(r.drawElementsInstanced(s,M,c,S*d,T),i.update(M,s,T))}function _(S,M,T){if(T===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(s,M,0,c,S,0,T);let E=0;for(let v=0;v<T;v++)E+=M[v];i.update(E,s,1)}function x(S,M,T,R){if(T===0)return;const E=e.get("WEBGL_multi_draw");if(E===null)for(let v=0;v<S.length;v++)m(S[v]/d,M[v],R[v]);else{E.multiDrawElementsInstancedWEBGL(s,M,0,c,S,0,R,0,T);let v=0;for(let B=0;B<T;B++)v+=M[B]*R[B];i.update(v,s,1)}}this.setMode=l,this.setIndex=h,this.render=p,this.renderInstances=m,this.renderMultiDraw=_,this.renderMultiDrawInstances=x}function ZT(r){const e={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function s(c,d,h){switch(i.calls++,d){case r.TRIANGLES:i.triangles+=h*(c/3);break;case r.LINES:i.lines+=h*(c/2);break;case r.LINE_STRIP:i.lines+=h*(c-1);break;case r.LINE_LOOP:i.lines+=h*c;break;case r.POINTS:i.points+=h*c;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",d);break}}function l(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return{memory:e,render:i,programs:null,autoReset:!0,reset:l,update:s}}function KT(r,e,i){const s=new WeakMap,l=new cn;function c(d,h,p){const m=d.morphTargetInfluences,_=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,x=_!==void 0?_.length:0;let S=s.get(h);if(S===void 0||S.count!==x){let D=function(){z.dispose(),s.delete(h),h.removeEventListener("dispose",D)};S!==void 0&&S.texture.dispose();const M=h.morphAttributes.position!==void 0,T=h.morphAttributes.normal!==void 0,R=h.morphAttributes.color!==void 0,E=h.morphAttributes.position||[],v=h.morphAttributes.normal||[],B=h.morphAttributes.color||[];let L=0;M===!0&&(L=1),T===!0&&(L=2),R===!0&&(L=3);let N=h.attributes.position.count*L,W=1;N>e.maxTextureSize&&(W=Math.ceil(N/e.maxTextureSize),N=e.maxTextureSize);const G=new Float32Array(N*W*4*x),z=new s0(G,N,W,x);z.type=ba,z.needsUpdate=!0;const J=L*4;for(let w=0;w<x;w++){const k=E[w],ue=v[w],q=B[w],le=N*W*4*w;for(let _e=0;_e<k.count;_e++){const U=_e*J;M===!0&&(l.fromBufferAttribute(k,_e),G[le+U+0]=l.x,G[le+U+1]=l.y,G[le+U+2]=l.z,G[le+U+3]=0),T===!0&&(l.fromBufferAttribute(ue,_e),G[le+U+4]=l.x,G[le+U+5]=l.y,G[le+U+6]=l.z,G[le+U+7]=0),R===!0&&(l.fromBufferAttribute(q,_e),G[le+U+8]=l.x,G[le+U+9]=l.y,G[le+U+10]=l.z,G[le+U+11]=q.itemSize===4?l.w:1)}}S={count:x,texture:z,size:new Bt(N,W)},s.set(h,S),h.addEventListener("dispose",D)}if(d.isInstancedMesh===!0&&d.morphTexture!==null)p.getUniforms().setValue(r,"morphTexture",d.morphTexture,i);else{let M=0;for(let R=0;R<m.length;R++)M+=m[R];const T=h.morphTargetsRelative?1:1-M;p.getUniforms().setValue(r,"morphTargetBaseInfluence",T),p.getUniforms().setValue(r,"morphTargetInfluences",m)}p.getUniforms().setValue(r,"morphTargetsTexture",S.texture,i),p.getUniforms().setValue(r,"morphTargetsTextureSize",S.size)}return{update:c}}function QT(r,e,i,s){let l=new WeakMap;function c(p){const m=s.render.frame,_=p.geometry,x=e.get(p,_);if(l.get(x)!==m&&(e.update(x),l.set(x,m)),p.isInstancedMesh&&(p.hasEventListener("dispose",h)===!1&&p.addEventListener("dispose",h),l.get(p)!==m&&(i.update(p.instanceMatrix,r.ARRAY_BUFFER),p.instanceColor!==null&&i.update(p.instanceColor,r.ARRAY_BUFFER),l.set(p,m))),p.isSkinnedMesh){const S=p.skeleton;l.get(S)!==m&&(S.update(),l.set(S,m))}return x}function d(){l=new WeakMap}function h(p){const m=p.target;m.removeEventListener("dispose",h),i.remove(m.instanceMatrix),m.instanceColor!==null&&i.remove(m.instanceColor)}return{update:c,dispose:d}}const y0=new jn,y_=new g0(1,1),S0=new s0,M0=new dM,E0=new p0,S_=[],M_=[],E_=new Float32Array(16),b_=new Float32Array(9),T_=new Float32Array(4);function ao(r,e,i){const s=r[0];if(s<=0||s>0)return r;const l=e*i;let c=S_[l];if(c===void 0&&(c=new Float32Array(l),S_[l]=c),e!==0){s.toArray(c,0);for(let d=1,h=0;d!==e;++d)h+=i,r[d].toArray(c,h)}return c}function En(r,e){if(r.length!==e.length)return!1;for(let i=0,s=r.length;i<s;i++)if(r[i]!==e[i])return!1;return!0}function bn(r,e){for(let i=0,s=e.length;i<s;i++)r[i]=e[i]}function ou(r,e){let i=M_[e];i===void 0&&(i=new Int32Array(e),M_[e]=i);for(let s=0;s!==e;++s)i[s]=r.allocateTextureUnit();return i}function JT(r,e){const i=this.cache;i[0]!==e&&(r.uniform1f(this.addr,e),i[0]=e)}function $T(r,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y);else{if(En(i,e))return;r.uniform2fv(this.addr,e),bn(i,e)}}function e1(r,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z);else if(e.r!==void 0)(i[0]!==e.r||i[1]!==e.g||i[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),i[0]=e.r,i[1]=e.g,i[2]=e.b);else{if(En(i,e))return;r.uniform3fv(this.addr,e),bn(i,e)}}function t1(r,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w);else{if(En(i,e))return;r.uniform4fv(this.addr,e),bn(i,e)}}function n1(r,e){const i=this.cache,s=e.elements;if(s===void 0){if(En(i,e))return;r.uniformMatrix2fv(this.addr,!1,e),bn(i,e)}else{if(En(i,s))return;T_.set(s),r.uniformMatrix2fv(this.addr,!1,T_),bn(i,s)}}function i1(r,e){const i=this.cache,s=e.elements;if(s===void 0){if(En(i,e))return;r.uniformMatrix3fv(this.addr,!1,e),bn(i,e)}else{if(En(i,s))return;b_.set(s),r.uniformMatrix3fv(this.addr,!1,b_),bn(i,s)}}function a1(r,e){const i=this.cache,s=e.elements;if(s===void 0){if(En(i,e))return;r.uniformMatrix4fv(this.addr,!1,e),bn(i,e)}else{if(En(i,s))return;E_.set(s),r.uniformMatrix4fv(this.addr,!1,E_),bn(i,s)}}function s1(r,e){const i=this.cache;i[0]!==e&&(r.uniform1i(this.addr,e),i[0]=e)}function r1(r,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y);else{if(En(i,e))return;r.uniform2iv(this.addr,e),bn(i,e)}}function o1(r,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z);else{if(En(i,e))return;r.uniform3iv(this.addr,e),bn(i,e)}}function l1(r,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w);else{if(En(i,e))return;r.uniform4iv(this.addr,e),bn(i,e)}}function c1(r,e){const i=this.cache;i[0]!==e&&(r.uniform1ui(this.addr,e),i[0]=e)}function u1(r,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y);else{if(En(i,e))return;r.uniform2uiv(this.addr,e),bn(i,e)}}function f1(r,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z);else{if(En(i,e))return;r.uniform3uiv(this.addr,e),bn(i,e)}}function d1(r,e){const i=this.cache;if(e.x!==void 0)(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w);else{if(En(i,e))return;r.uniform4uiv(this.addr,e),bn(i,e)}}function h1(r,e,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(r.uniform1i(this.addr,l),s[0]=l);let c;this.type===r.SAMPLER_2D_SHADOW?(y_.compareFunction=i0,c=y_):c=y0,i.setTexture2D(e||c,l)}function p1(r,e,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(r.uniform1i(this.addr,l),s[0]=l),i.setTexture3D(e||M0,l)}function m1(r,e,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(r.uniform1i(this.addr,l),s[0]=l),i.setTextureCube(e||E0,l)}function g1(r,e,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(r.uniform1i(this.addr,l),s[0]=l),i.setTexture2DArray(e||S0,l)}function v1(r){switch(r){case 5126:return JT;case 35664:return $T;case 35665:return e1;case 35666:return t1;case 35674:return n1;case 35675:return i1;case 35676:return a1;case 5124:case 35670:return s1;case 35667:case 35671:return r1;case 35668:case 35672:return o1;case 35669:case 35673:return l1;case 5125:return c1;case 36294:return u1;case 36295:return f1;case 36296:return d1;case 35678:case 36198:case 36298:case 36306:case 35682:return h1;case 35679:case 36299:case 36307:return p1;case 35680:case 36300:case 36308:case 36293:return m1;case 36289:case 36303:case 36311:case 36292:return g1}}function _1(r,e){r.uniform1fv(this.addr,e)}function x1(r,e){const i=ao(e,this.size,2);r.uniform2fv(this.addr,i)}function y1(r,e){const i=ao(e,this.size,3);r.uniform3fv(this.addr,i)}function S1(r,e){const i=ao(e,this.size,4);r.uniform4fv(this.addr,i)}function M1(r,e){const i=ao(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,i)}function E1(r,e){const i=ao(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,i)}function b1(r,e){const i=ao(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,i)}function T1(r,e){r.uniform1iv(this.addr,e)}function A1(r,e){r.uniform2iv(this.addr,e)}function R1(r,e){r.uniform3iv(this.addr,e)}function C1(r,e){r.uniform4iv(this.addr,e)}function w1(r,e){r.uniform1uiv(this.addr,e)}function N1(r,e){r.uniform2uiv(this.addr,e)}function D1(r,e){r.uniform3uiv(this.addr,e)}function U1(r,e){r.uniform4uiv(this.addr,e)}function L1(r,e,i){const s=this.cache,l=e.length,c=ou(i,l);En(s,c)||(r.uniform1iv(this.addr,c),bn(s,c));for(let d=0;d!==l;++d)i.setTexture2D(e[d]||y0,c[d])}function O1(r,e,i){const s=this.cache,l=e.length,c=ou(i,l);En(s,c)||(r.uniform1iv(this.addr,c),bn(s,c));for(let d=0;d!==l;++d)i.setTexture3D(e[d]||M0,c[d])}function P1(r,e,i){const s=this.cache,l=e.length,c=ou(i,l);En(s,c)||(r.uniform1iv(this.addr,c),bn(s,c));for(let d=0;d!==l;++d)i.setTextureCube(e[d]||E0,c[d])}function B1(r,e,i){const s=this.cache,l=e.length,c=ou(i,l);En(s,c)||(r.uniform1iv(this.addr,c),bn(s,c));for(let d=0;d!==l;++d)i.setTexture2DArray(e[d]||S0,c[d])}function z1(r){switch(r){case 5126:return _1;case 35664:return x1;case 35665:return y1;case 35666:return S1;case 35674:return M1;case 35675:return E1;case 35676:return b1;case 5124:case 35670:return T1;case 35667:case 35671:return A1;case 35668:case 35672:return R1;case 35669:case 35673:return C1;case 5125:return w1;case 36294:return N1;case 36295:return D1;case 36296:return U1;case 35678:case 36198:case 36298:case 36306:case 35682:return L1;case 35679:case 36299:case 36307:return O1;case 35680:case 36300:case 36308:case 36293:return P1;case 36289:case 36303:case 36311:case 36292:return B1}}class I1{constructor(e,i,s){this.id=e,this.addr=s,this.cache=[],this.type=i.type,this.setValue=v1(i.type)}}class F1{constructor(e,i,s){this.id=e,this.addr=s,this.cache=[],this.type=i.type,this.size=i.size,this.setValue=z1(i.type)}}class H1{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,i,s){const l=this.seq;for(let c=0,d=l.length;c!==d;++c){const h=l[c];h.setValue(e,i[h.id],s)}}}const jd=/(\w+)(\])?(\[|\.)?/g;function A_(r,e){r.seq.push(e),r.map[e.id]=e}function G1(r,e,i){const s=r.name,l=s.length;for(jd.lastIndex=0;;){const c=jd.exec(s),d=jd.lastIndex;let h=c[1];const p=c[2]==="]",m=c[3];if(p&&(h=h|0),m===void 0||m==="["&&d+2===l){A_(i,m===void 0?new I1(h,r,e):new F1(h,r,e));break}else{let x=i.map[h];x===void 0&&(x=new H1(h),A_(i,x)),i=x}}}class Jc{constructor(e,i){this.seq=[],this.map={};const s=e.getProgramParameter(i,e.ACTIVE_UNIFORMS);for(let l=0;l<s;++l){const c=e.getActiveUniform(i,l),d=e.getUniformLocation(i,c.name);G1(c,d,this)}}setValue(e,i,s,l){const c=this.map[i];c!==void 0&&c.setValue(e,s,l)}setOptional(e,i,s){const l=i[s];l!==void 0&&this.setValue(e,s,l)}static upload(e,i,s,l){for(let c=0,d=i.length;c!==d;++c){const h=i[c],p=s[h.id];p.needsUpdate!==!1&&h.setValue(e,p.value,l)}}static seqWithValue(e,i){const s=[];for(let l=0,c=e.length;l!==c;++l){const d=e[l];d.id in i&&s.push(d)}return s}}function R_(r,e,i){const s=r.createShader(e);return r.shaderSource(s,i),r.compileShader(s),s}const V1=37297;let j1=0;function k1(r,e){const i=r.split(`
`),s=[],l=Math.max(e-6,0),c=Math.min(e+6,i.length);for(let d=l;d<c;d++){const h=d+1;s.push(`${h===e?">":" "} ${h}: ${i[d]}`)}return s.join(`
`)}const C_=new ht;function X1(r){Ut._getMatrix(C_,Ut.workingColorSpace,r);const e=`mat3( ${C_.elements.map(i=>i.toFixed(4))} )`;switch(Ut.getTransfer(r)){case $c:return[e,"LinearTransferOETF"];case Zt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function w_(r,e,i){const s=r.getShaderParameter(e,r.COMPILE_STATUS),l=r.getShaderInfoLog(e).trim();if(s&&l==="")return"";const c=/ERROR: 0:(\d+)/.exec(l);if(c){const d=parseInt(c[1]);return i.toUpperCase()+`

`+l+`

`+k1(r.getShaderSource(e),d)}else return l}function W1(r,e){const i=X1(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${i[1]}( vec4( value.rgb * ${i[0]}, value.a ) );`,"}"].join(`
`)}function q1(r,e){let i;switch(e){case ES:i="Linear";break;case bS:i="Reinhard";break;case TS:i="Cineon";break;case AS:i="ACESFilmic";break;case CS:i="AgX";break;case wS:i="Neutral";break;case RS:i="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),i="Linear"}return"vec3 "+r+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}const Wc=new ae;function Y1(){Ut.getLuminanceCoefficients(Wc);const r=Wc.x.toFixed(4),e=Wc.y.toFixed(4),i=Wc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${i} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Z1(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(rl).join(`
`)}function K1(r){const e=[];for(const i in r){const s=r[i];s!==!1&&e.push("#define "+i+" "+s)}return e.join(`
`)}function Q1(r,e){const i={},s=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let l=0;l<s;l++){const c=r.getActiveAttrib(e,l),d=c.name;let h=1;c.type===r.FLOAT_MAT2&&(h=2),c.type===r.FLOAT_MAT3&&(h=3),c.type===r.FLOAT_MAT4&&(h=4),i[d]={type:c.type,location:r.getAttribLocation(e,d),locationSize:h}}return i}function rl(r){return r!==""}function N_(r,e){const i=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function D_(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const J1=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nh(r){return r.replace(J1,eA)}const $1=new Map;function eA(r,e){let i=pt[e];if(i===void 0){const s=$1.get(e);if(s!==void 0)i=pt[s],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,s);else throw new Error("Can not resolve #include <"+e+">")}return Nh(i)}const tA=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function U_(r){return r.replace(tA,nA)}function nA(r,e,i,s){let l="";for(let c=parseInt(e);c<parseInt(i);c++)l+=s.replace(/\[\s*i\s*\]/g,"[ "+c+" ]").replace(/UNROLLED_LOOP_INDEX/g,c);return l}function L_(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function iA(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===X_?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===nS?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Ma&&(e="SHADOWMAP_TYPE_VSM"),e}function aA(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case Kr:case Qr:e="ENVMAP_TYPE_CUBE";break;case au:e="ENVMAP_TYPE_CUBE_UV";break}return e}function sA(r){let e="ENVMAP_MODE_REFLECTION";return r.envMap&&r.envMapMode===Qr&&(e="ENVMAP_MODE_REFRACTION"),e}function rA(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case W_:e="ENVMAP_BLENDING_MULTIPLY";break;case SS:e="ENVMAP_BLENDING_MIX";break;case MS:e="ENVMAP_BLENDING_ADD";break}return e}function oA(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const i=Math.log2(e)-2,s=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,i),112)),texelHeight:s,maxMip:i}}function lA(r,e,i,s){const l=r.getContext(),c=i.defines;let d=i.vertexShader,h=i.fragmentShader;const p=iA(i),m=aA(i),_=sA(i),x=rA(i),S=oA(i),M=Z1(i),T=K1(c),R=l.createProgram();let E,v,B=i.glslVersion?"#version "+i.glslVersion+`
`:"";i.isRawShaderMaterial?(E=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,T].filter(rl).join(`
`),E.length>0&&(E+=`
`),v=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,T].filter(rl).join(`
`),v.length>0&&(v+=`
`)):(E=[L_(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,T,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+_:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+p:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",i.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(rl).join(`
`),v=[L_(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,T,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+m:"",i.envMap?"#define "+_:"",i.envMap?"#define "+x:"",S?"#define CUBEUV_TEXEL_WIDTH "+S.texelWidth:"",S?"#define CUBEUV_TEXEL_HEIGHT "+S.texelHeight:"",S?"#define CUBEUV_MAX_MIP "+S.maxMip+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor||i.batchingColor?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+p:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",i.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==os?"#define TONE_MAPPING":"",i.toneMapping!==os?pt.tonemapping_pars_fragment:"",i.toneMapping!==os?q1("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",pt.colorspace_pars_fragment,W1("linearToOutputTexel",i.outputColorSpace),Y1(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(rl).join(`
`)),d=Nh(d),d=N_(d,i),d=D_(d,i),h=Nh(h),h=N_(h,i),h=D_(h,i),d=U_(d),h=U_(h),i.isRawShaderMaterial!==!0&&(B=`#version 300 es
`,E=[M,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+E,v=["#define varying in",i.glslVersion===Gv?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion===Gv?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);const L=B+E+d,N=B+v+h,W=R_(l,l.VERTEX_SHADER,L),G=R_(l,l.FRAGMENT_SHADER,N);l.attachShader(R,W),l.attachShader(R,G),i.index0AttributeName!==void 0?l.bindAttribLocation(R,0,i.index0AttributeName):i.morphTargets===!0&&l.bindAttribLocation(R,0,"position"),l.linkProgram(R);function z(k){if(r.debug.checkShaderErrors){const ue=l.getProgramInfoLog(R).trim(),q=l.getShaderInfoLog(W).trim(),le=l.getShaderInfoLog(G).trim();let _e=!0,U=!0;if(l.getProgramParameter(R,l.LINK_STATUS)===!1)if(_e=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(l,R,W,G);else{const $=w_(l,W,"vertex"),Z=w_(l,G,"fragment");console.error("THREE.WebGLProgram: Shader Error "+l.getError()+" - VALIDATE_STATUS "+l.getProgramParameter(R,l.VALIDATE_STATUS)+`

Material Name: `+k.name+`
Material Type: `+k.type+`

Program Info Log: `+ue+`
`+$+`
`+Z)}else ue!==""?console.warn("THREE.WebGLProgram: Program Info Log:",ue):(q===""||le==="")&&(U=!1);U&&(k.diagnostics={runnable:_e,programLog:ue,vertexShader:{log:q,prefix:E},fragmentShader:{log:le,prefix:v}})}l.deleteShader(W),l.deleteShader(G),J=new Jc(l,R),D=Q1(l,R)}let J;this.getUniforms=function(){return J===void 0&&z(this),J};let D;this.getAttributes=function(){return D===void 0&&z(this),D};let w=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=l.getProgramParameter(R,V1)),w},this.destroy=function(){s.releaseStatesOfProgram(this),l.deleteProgram(R),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=j1++,this.cacheKey=e,this.usedTimes=1,this.program=R,this.vertexShader=W,this.fragmentShader=G,this}let cA=0;class uA{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const i=e.vertexShader,s=e.fragmentShader,l=this._getShaderStage(i),c=this._getShaderStage(s),d=this._getShaderCacheForMaterial(e);return d.has(l)===!1&&(d.add(l),l.usedTimes++),d.has(c)===!1&&(d.add(c),c.usedTimes++),this}remove(e){const i=this.materialCache.get(e);for(const s of i)s.usedTimes--,s.usedTimes===0&&this.shaderCache.delete(s.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const i=this.materialCache;let s=i.get(e);return s===void 0&&(s=new Set,i.set(e,s)),s}_getShaderStage(e){const i=this.shaderCache;let s=i.get(e);return s===void 0&&(s=new fA(e),i.set(e,s)),s}}class fA{constructor(e){this.id=cA++,this.code=e,this.usedTimes=0}}function dA(r,e,i,s,l,c,d){const h=new o0,p=new uA,m=new Set,_=[],x=l.logarithmicDepthBuffer,S=l.vertexTextures;let M=l.precision;const T={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function R(D){return m.add(D),D===0?"uv":`uv${D}`}function E(D,w,k,ue,q){const le=ue.fog,_e=q.geometry,U=D.isMeshStandardMaterial?ue.environment:null,$=(D.isMeshStandardMaterial?i:e).get(D.envMap||U),Z=$&&$.mapping===au?$.image.height:null,xe=T[D.type];D.precision!==null&&(M=l.getMaxPrecision(D.precision),M!==D.precision&&console.warn("THREE.WebGLProgram.getParameters:",D.precision,"not supported, using",M,"instead."));const Ae=_e.morphAttributes.position||_e.morphAttributes.normal||_e.morphAttributes.color,O=Ae!==void 0?Ae.length:0;let se=0;_e.morphAttributes.position!==void 0&&(se=1),_e.morphAttributes.normal!==void 0&&(se=2),_e.morphAttributes.color!==void 0&&(se=3);let Me,K,he,Re;if(xe){const Et=Xi[xe];Me=Et.vertexShader,K=Et.fragmentShader}else Me=D.vertexShader,K=D.fragmentShader,p.update(D),he=p.getVertexShaderID(D),Re=p.getFragmentShaderID(D);const Ee=r.getRenderTarget(),ze=r.state.buffers.depth.getReversed(),Je=q.isInstancedMesh===!0,$e=q.isBatchedMesh===!0,zt=!!D.map,It=!!D.matcap,_t=!!$,H=!!D.aoMap,un=!!D.lightMap,xt=!!D.bumpMap,Ft=!!D.normalMap,ke=!!D.displacementMap,gt=!!D.emissiveMap,Qe=!!D.metalnessMap,rt=!!D.roughnessMap,an=D.anisotropy>0,P=D.clearcoat>0,b=D.dispersion>0,ne=D.iridescence>0,me=D.sheen>0,ye=D.transmission>0,fe=an&&!!D.anisotropyMap,We=P&&!!D.clearcoatMap,Ue=P&&!!D.clearcoatNormalMap,je=P&&!!D.clearcoatRoughnessMap,qe=ne&&!!D.iridescenceMap,Se=ne&&!!D.iridescenceThicknessMap,Ne=me&&!!D.sheenColorMap,Ye=me&&!!D.sheenRoughnessMap,Ge=!!D.specularMap,Le=!!D.specularColorMap,at=!!D.specularIntensityMap,j=ye&&!!D.transmissionMap,De=ye&&!!D.thicknessMap,be=!!D.gradientMap,Ie=!!D.alphaMap,Te=D.alphaTest>0,ge=!!D.alphaHash,He=!!D.extensions;let st=os;D.toneMapped&&(Ee===null||Ee.isXRRenderTarget===!0)&&(st=r.toneMapping);const Ht={shaderID:xe,shaderType:D.type,shaderName:D.name,vertexShader:Me,fragmentShader:K,defines:D.defines,customVertexShaderID:he,customFragmentShaderID:Re,isRawShaderMaterial:D.isRawShaderMaterial===!0,glslVersion:D.glslVersion,precision:M,batching:$e,batchingColor:$e&&q._colorsTexture!==null,instancing:Je,instancingColor:Je&&q.instanceColor!==null,instancingMorph:Je&&q.morphTexture!==null,supportsVertexTextures:S,outputColorSpace:Ee===null?r.outputColorSpace:Ee.isXRRenderTarget===!0?Ee.texture.colorSpace:Jr,alphaToCoverage:!!D.alphaToCoverage,map:zt,matcap:It,envMap:_t,envMapMode:_t&&$.mapping,envMapCubeUVHeight:Z,aoMap:H,lightMap:un,bumpMap:xt,normalMap:Ft,displacementMap:S&&ke,emissiveMap:gt,normalMapObjectSpace:Ft&&D.normalMapType===LS,normalMapTangentSpace:Ft&&D.normalMapType===n0,metalnessMap:Qe,roughnessMap:rt,anisotropy:an,anisotropyMap:fe,clearcoat:P,clearcoatMap:We,clearcoatNormalMap:Ue,clearcoatRoughnessMap:je,dispersion:b,iridescence:ne,iridescenceMap:qe,iridescenceThicknessMap:Se,sheen:me,sheenColorMap:Ne,sheenRoughnessMap:Ye,specularMap:Ge,specularColorMap:Le,specularIntensityMap:at,transmission:ye,transmissionMap:j,thicknessMap:De,gradientMap:be,opaque:D.transparent===!1&&D.blending===Wr&&D.alphaToCoverage===!1,alphaMap:Ie,alphaTest:Te,alphaHash:ge,combine:D.combine,mapUv:zt&&R(D.map.channel),aoMapUv:H&&R(D.aoMap.channel),lightMapUv:un&&R(D.lightMap.channel),bumpMapUv:xt&&R(D.bumpMap.channel),normalMapUv:Ft&&R(D.normalMap.channel),displacementMapUv:ke&&R(D.displacementMap.channel),emissiveMapUv:gt&&R(D.emissiveMap.channel),metalnessMapUv:Qe&&R(D.metalnessMap.channel),roughnessMapUv:rt&&R(D.roughnessMap.channel),anisotropyMapUv:fe&&R(D.anisotropyMap.channel),clearcoatMapUv:We&&R(D.clearcoatMap.channel),clearcoatNormalMapUv:Ue&&R(D.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:je&&R(D.clearcoatRoughnessMap.channel),iridescenceMapUv:qe&&R(D.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&R(D.iridescenceThicknessMap.channel),sheenColorMapUv:Ne&&R(D.sheenColorMap.channel),sheenRoughnessMapUv:Ye&&R(D.sheenRoughnessMap.channel),specularMapUv:Ge&&R(D.specularMap.channel),specularColorMapUv:Le&&R(D.specularColorMap.channel),specularIntensityMapUv:at&&R(D.specularIntensityMap.channel),transmissionMapUv:j&&R(D.transmissionMap.channel),thicknessMapUv:De&&R(D.thicknessMap.channel),alphaMapUv:Ie&&R(D.alphaMap.channel),vertexTangents:!!_e.attributes.tangent&&(Ft||an),vertexColors:D.vertexColors,vertexAlphas:D.vertexColors===!0&&!!_e.attributes.color&&_e.attributes.color.itemSize===4,pointsUvs:q.isPoints===!0&&!!_e.attributes.uv&&(zt||Ie),fog:!!le,useFog:D.fog===!0,fogExp2:!!le&&le.isFogExp2,flatShading:D.flatShading===!0&&D.wireframe===!1,sizeAttenuation:D.sizeAttenuation===!0,logarithmicDepthBuffer:x,reverseDepthBuffer:ze,skinning:q.isSkinnedMesh===!0,morphTargets:_e.morphAttributes.position!==void 0,morphNormals:_e.morphAttributes.normal!==void 0,morphColors:_e.morphAttributes.color!==void 0,morphTargetsCount:O,morphTextureStride:se,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:d.numPlanes,numClipIntersection:d.numIntersection,dithering:D.dithering,shadowMapEnabled:r.shadowMap.enabled&&k.length>0,shadowMapType:r.shadowMap.type,toneMapping:st,decodeVideoTexture:zt&&D.map.isVideoTexture===!0&&Ut.getTransfer(D.map.colorSpace)===Zt,decodeVideoTextureEmissive:gt&&D.emissiveMap.isVideoTexture===!0&&Ut.getTransfer(D.emissiveMap.colorSpace)===Zt,premultipliedAlpha:D.premultipliedAlpha,doubleSided:D.side===Ea,flipSided:D.side===Kn,useDepthPacking:D.depthPacking>=0,depthPacking:D.depthPacking||0,index0AttributeName:D.index0AttributeName,extensionClipCullDistance:He&&D.extensions.clipCullDistance===!0&&s.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(He&&D.extensions.multiDraw===!0||$e)&&s.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:s.has("KHR_parallel_shader_compile"),customProgramCacheKey:D.customProgramCacheKey()};return Ht.vertexUv1s=m.has(1),Ht.vertexUv2s=m.has(2),Ht.vertexUv3s=m.has(3),m.clear(),Ht}function v(D){const w=[];if(D.shaderID?w.push(D.shaderID):(w.push(D.customVertexShaderID),w.push(D.customFragmentShaderID)),D.defines!==void 0)for(const k in D.defines)w.push(k),w.push(D.defines[k]);return D.isRawShaderMaterial===!1&&(B(w,D),L(w,D),w.push(r.outputColorSpace)),w.push(D.customProgramCacheKey),w.join()}function B(D,w){D.push(w.precision),D.push(w.outputColorSpace),D.push(w.envMapMode),D.push(w.envMapCubeUVHeight),D.push(w.mapUv),D.push(w.alphaMapUv),D.push(w.lightMapUv),D.push(w.aoMapUv),D.push(w.bumpMapUv),D.push(w.normalMapUv),D.push(w.displacementMapUv),D.push(w.emissiveMapUv),D.push(w.metalnessMapUv),D.push(w.roughnessMapUv),D.push(w.anisotropyMapUv),D.push(w.clearcoatMapUv),D.push(w.clearcoatNormalMapUv),D.push(w.clearcoatRoughnessMapUv),D.push(w.iridescenceMapUv),D.push(w.iridescenceThicknessMapUv),D.push(w.sheenColorMapUv),D.push(w.sheenRoughnessMapUv),D.push(w.specularMapUv),D.push(w.specularColorMapUv),D.push(w.specularIntensityMapUv),D.push(w.transmissionMapUv),D.push(w.thicknessMapUv),D.push(w.combine),D.push(w.fogExp2),D.push(w.sizeAttenuation),D.push(w.morphTargetsCount),D.push(w.morphAttributeCount),D.push(w.numDirLights),D.push(w.numPointLights),D.push(w.numSpotLights),D.push(w.numSpotLightMaps),D.push(w.numHemiLights),D.push(w.numRectAreaLights),D.push(w.numDirLightShadows),D.push(w.numPointLightShadows),D.push(w.numSpotLightShadows),D.push(w.numSpotLightShadowsWithMaps),D.push(w.numLightProbes),D.push(w.shadowMapType),D.push(w.toneMapping),D.push(w.numClippingPlanes),D.push(w.numClipIntersection),D.push(w.depthPacking)}function L(D,w){h.disableAll(),w.supportsVertexTextures&&h.enable(0),w.instancing&&h.enable(1),w.instancingColor&&h.enable(2),w.instancingMorph&&h.enable(3),w.matcap&&h.enable(4),w.envMap&&h.enable(5),w.normalMapObjectSpace&&h.enable(6),w.normalMapTangentSpace&&h.enable(7),w.clearcoat&&h.enable(8),w.iridescence&&h.enable(9),w.alphaTest&&h.enable(10),w.vertexColors&&h.enable(11),w.vertexAlphas&&h.enable(12),w.vertexUv1s&&h.enable(13),w.vertexUv2s&&h.enable(14),w.vertexUv3s&&h.enable(15),w.vertexTangents&&h.enable(16),w.anisotropy&&h.enable(17),w.alphaHash&&h.enable(18),w.batching&&h.enable(19),w.dispersion&&h.enable(20),w.batchingColor&&h.enable(21),w.gradientMap&&h.enable(22),D.push(h.mask),h.disableAll(),w.fog&&h.enable(0),w.useFog&&h.enable(1),w.flatShading&&h.enable(2),w.logarithmicDepthBuffer&&h.enable(3),w.reverseDepthBuffer&&h.enable(4),w.skinning&&h.enable(5),w.morphTargets&&h.enable(6),w.morphNormals&&h.enable(7),w.morphColors&&h.enable(8),w.premultipliedAlpha&&h.enable(9),w.shadowMapEnabled&&h.enable(10),w.doubleSided&&h.enable(11),w.flipSided&&h.enable(12),w.useDepthPacking&&h.enable(13),w.dithering&&h.enable(14),w.transmission&&h.enable(15),w.sheen&&h.enable(16),w.opaque&&h.enable(17),w.pointsUvs&&h.enable(18),w.decodeVideoTexture&&h.enable(19),w.decodeVideoTextureEmissive&&h.enable(20),w.alphaToCoverage&&h.enable(21),D.push(h.mask)}function N(D){const w=T[D.type];let k;if(w){const ue=Xi[w];k=TM.clone(ue.uniforms)}else k=D.uniforms;return k}function W(D,w){let k;for(let ue=0,q=_.length;ue<q;ue++){const le=_[ue];if(le.cacheKey===w){k=le,++k.usedTimes;break}}return k===void 0&&(k=new lA(r,w,D,c),_.push(k)),k}function G(D){if(--D.usedTimes===0){const w=_.indexOf(D);_[w]=_[_.length-1],_.pop(),D.destroy()}}function z(D){p.remove(D)}function J(){p.dispose()}return{getParameters:E,getProgramCacheKey:v,getUniforms:N,acquireProgram:W,releaseProgram:G,releaseShaderCache:z,programs:_,dispose:J}}function hA(){let r=new WeakMap;function e(d){return r.has(d)}function i(d){let h=r.get(d);return h===void 0&&(h={},r.set(d,h)),h}function s(d){r.delete(d)}function l(d,h,p){r.get(d)[h]=p}function c(){r=new WeakMap}return{has:e,get:i,remove:s,update:l,dispose:c}}function pA(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function O_(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function P_(){const r=[];let e=0;const i=[],s=[],l=[];function c(){e=0,i.length=0,s.length=0,l.length=0}function d(x,S,M,T,R,E){let v=r[e];return v===void 0?(v={id:x.id,object:x,geometry:S,material:M,groupOrder:T,renderOrder:x.renderOrder,z:R,group:E},r[e]=v):(v.id=x.id,v.object=x,v.geometry=S,v.material=M,v.groupOrder=T,v.renderOrder=x.renderOrder,v.z=R,v.group=E),e++,v}function h(x,S,M,T,R,E){const v=d(x,S,M,T,R,E);M.transmission>0?s.push(v):M.transparent===!0?l.push(v):i.push(v)}function p(x,S,M,T,R,E){const v=d(x,S,M,T,R,E);M.transmission>0?s.unshift(v):M.transparent===!0?l.unshift(v):i.unshift(v)}function m(x,S){i.length>1&&i.sort(x||pA),s.length>1&&s.sort(S||O_),l.length>1&&l.sort(S||O_)}function _(){for(let x=e,S=r.length;x<S;x++){const M=r[x];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:i,transmissive:s,transparent:l,init:c,push:h,unshift:p,finish:_,sort:m}}function mA(){let r=new WeakMap;function e(s,l){const c=r.get(s);let d;return c===void 0?(d=new P_,r.set(s,[d])):l>=c.length?(d=new P_,c.push(d)):d=c[l],d}function i(){r=new WeakMap}return{get:e,dispose:i}}function gA(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let i;switch(e.type){case"DirectionalLight":i={direction:new ae,color:new mt};break;case"SpotLight":i={position:new ae,direction:new ae,color:new mt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new ae,color:new mt,distance:0,decay:0};break;case"HemisphereLight":i={direction:new ae,skyColor:new mt,groundColor:new mt};break;case"RectAreaLight":i={color:new mt,position:new ae,halfWidth:new ae,halfHeight:new ae};break}return r[e.id]=i,i}}}function vA(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let i;switch(e.type){case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=i,i}}}let _A=0;function xA(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function yA(r){const e=new gA,i=vA(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let m=0;m<9;m++)s.probe.push(new ae);const l=new ae,c=new sn,d=new sn;function h(m){let _=0,x=0,S=0;for(let D=0;D<9;D++)s.probe[D].set(0,0,0);let M=0,T=0,R=0,E=0,v=0,B=0,L=0,N=0,W=0,G=0,z=0;m.sort(xA);for(let D=0,w=m.length;D<w;D++){const k=m[D],ue=k.color,q=k.intensity,le=k.distance,_e=k.shadow&&k.shadow.map?k.shadow.map.texture:null;if(k.isAmbientLight)_+=ue.r*q,x+=ue.g*q,S+=ue.b*q;else if(k.isLightProbe){for(let U=0;U<9;U++)s.probe[U].addScaledVector(k.sh.coefficients[U],q);z++}else if(k.isDirectionalLight){const U=e.get(k);if(U.color.copy(k.color).multiplyScalar(k.intensity),k.castShadow){const $=k.shadow,Z=i.get(k);Z.shadowIntensity=$.intensity,Z.shadowBias=$.bias,Z.shadowNormalBias=$.normalBias,Z.shadowRadius=$.radius,Z.shadowMapSize=$.mapSize,s.directionalShadow[M]=Z,s.directionalShadowMap[M]=_e,s.directionalShadowMatrix[M]=k.shadow.matrix,B++}s.directional[M]=U,M++}else if(k.isSpotLight){const U=e.get(k);U.position.setFromMatrixPosition(k.matrixWorld),U.color.copy(ue).multiplyScalar(q),U.distance=le,U.coneCos=Math.cos(k.angle),U.penumbraCos=Math.cos(k.angle*(1-k.penumbra)),U.decay=k.decay,s.spot[R]=U;const $=k.shadow;if(k.map&&(s.spotLightMap[W]=k.map,W++,$.updateMatrices(k),k.castShadow&&G++),s.spotLightMatrix[R]=$.matrix,k.castShadow){const Z=i.get(k);Z.shadowIntensity=$.intensity,Z.shadowBias=$.bias,Z.shadowNormalBias=$.normalBias,Z.shadowRadius=$.radius,Z.shadowMapSize=$.mapSize,s.spotShadow[R]=Z,s.spotShadowMap[R]=_e,N++}R++}else if(k.isRectAreaLight){const U=e.get(k);U.color.copy(ue).multiplyScalar(q),U.halfWidth.set(k.width*.5,0,0),U.halfHeight.set(0,k.height*.5,0),s.rectArea[E]=U,E++}else if(k.isPointLight){const U=e.get(k);if(U.color.copy(k.color).multiplyScalar(k.intensity),U.distance=k.distance,U.decay=k.decay,k.castShadow){const $=k.shadow,Z=i.get(k);Z.shadowIntensity=$.intensity,Z.shadowBias=$.bias,Z.shadowNormalBias=$.normalBias,Z.shadowRadius=$.radius,Z.shadowMapSize=$.mapSize,Z.shadowCameraNear=$.camera.near,Z.shadowCameraFar=$.camera.far,s.pointShadow[T]=Z,s.pointShadowMap[T]=_e,s.pointShadowMatrix[T]=k.shadow.matrix,L++}s.point[T]=U,T++}else if(k.isHemisphereLight){const U=e.get(k);U.skyColor.copy(k.color).multiplyScalar(q),U.groundColor.copy(k.groundColor).multiplyScalar(q),s.hemi[v]=U,v++}}E>0&&(r.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=Pe.LTC_FLOAT_1,s.rectAreaLTC2=Pe.LTC_FLOAT_2):(s.rectAreaLTC1=Pe.LTC_HALF_1,s.rectAreaLTC2=Pe.LTC_HALF_2)),s.ambient[0]=_,s.ambient[1]=x,s.ambient[2]=S;const J=s.hash;(J.directionalLength!==M||J.pointLength!==T||J.spotLength!==R||J.rectAreaLength!==E||J.hemiLength!==v||J.numDirectionalShadows!==B||J.numPointShadows!==L||J.numSpotShadows!==N||J.numSpotMaps!==W||J.numLightProbes!==z)&&(s.directional.length=M,s.spot.length=R,s.rectArea.length=E,s.point.length=T,s.hemi.length=v,s.directionalShadow.length=B,s.directionalShadowMap.length=B,s.pointShadow.length=L,s.pointShadowMap.length=L,s.spotShadow.length=N,s.spotShadowMap.length=N,s.directionalShadowMatrix.length=B,s.pointShadowMatrix.length=L,s.spotLightMatrix.length=N+W-G,s.spotLightMap.length=W,s.numSpotLightShadowsWithMaps=G,s.numLightProbes=z,J.directionalLength=M,J.pointLength=T,J.spotLength=R,J.rectAreaLength=E,J.hemiLength=v,J.numDirectionalShadows=B,J.numPointShadows=L,J.numSpotShadows=N,J.numSpotMaps=W,J.numLightProbes=z,s.version=_A++)}function p(m,_){let x=0,S=0,M=0,T=0,R=0;const E=_.matrixWorldInverse;for(let v=0,B=m.length;v<B;v++){const L=m[v];if(L.isDirectionalLight){const N=s.directional[x];N.direction.setFromMatrixPosition(L.matrixWorld),l.setFromMatrixPosition(L.target.matrixWorld),N.direction.sub(l),N.direction.transformDirection(E),x++}else if(L.isSpotLight){const N=s.spot[M];N.position.setFromMatrixPosition(L.matrixWorld),N.position.applyMatrix4(E),N.direction.setFromMatrixPosition(L.matrixWorld),l.setFromMatrixPosition(L.target.matrixWorld),N.direction.sub(l),N.direction.transformDirection(E),M++}else if(L.isRectAreaLight){const N=s.rectArea[T];N.position.setFromMatrixPosition(L.matrixWorld),N.position.applyMatrix4(E),d.identity(),c.copy(L.matrixWorld),c.premultiply(E),d.extractRotation(c),N.halfWidth.set(L.width*.5,0,0),N.halfHeight.set(0,L.height*.5,0),N.halfWidth.applyMatrix4(d),N.halfHeight.applyMatrix4(d),T++}else if(L.isPointLight){const N=s.point[S];N.position.setFromMatrixPosition(L.matrixWorld),N.position.applyMatrix4(E),S++}else if(L.isHemisphereLight){const N=s.hemi[R];N.direction.setFromMatrixPosition(L.matrixWorld),N.direction.transformDirection(E),R++}}}return{setup:h,setupView:p,state:s}}function B_(r){const e=new yA(r),i=[],s=[];function l(_){m.camera=_,i.length=0,s.length=0}function c(_){i.push(_)}function d(_){s.push(_)}function h(){e.setup(i)}function p(_){e.setupView(i,_)}const m={lightsArray:i,shadowsArray:s,camera:null,lights:e,transmissionRenderTarget:{}};return{init:l,state:m,setupLights:h,setupLightsView:p,pushLight:c,pushShadow:d}}function SA(r){let e=new WeakMap;function i(l,c=0){const d=e.get(l);let h;return d===void 0?(h=new B_(r),e.set(l,[h])):c>=d.length?(h=new B_(r),d.push(h)):h=d[c],h}function s(){e=new WeakMap}return{get:i,dispose:s}}const MA=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,EA=`uniform sampler2D shadow_pass;
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
}`;function bA(r,e,i){let s=new Vh;const l=new Bt,c=new Bt,d=new cn,h=new zM({depthPacking:US}),p=new IM,m={},_=i.maxTextureSize,x={[ls]:Kn,[Kn]:ls,[Ea]:Ea},S=new cs({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Bt},radius:{value:4}},vertexShader:MA,fragmentShader:EA}),M=S.clone();M.defines.HORIZONTAL_PASS=1;const T=new zi;T.setAttribute("position",new qi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const R=new Pi(T,S),E=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=X_;let v=this.type;this.render=function(G,z,J){if(E.enabled===!1||E.autoUpdate===!1&&E.needsUpdate===!1||G.length===0)return;const D=r.getRenderTarget(),w=r.getActiveCubeFace(),k=r.getActiveMipmapLevel(),ue=r.state;ue.setBlending(rs),ue.buffers.color.setClear(1,1,1,1),ue.buffers.depth.setTest(!0),ue.setScissorTest(!1);const q=v!==Ma&&this.type===Ma,le=v===Ma&&this.type!==Ma;for(let _e=0,U=G.length;_e<U;_e++){const $=G[_e],Z=$.shadow;if(Z===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;l.copy(Z.mapSize);const xe=Z.getFrameExtents();if(l.multiply(xe),c.copy(Z.mapSize),(l.x>_||l.y>_)&&(l.x>_&&(c.x=Math.floor(_/xe.x),l.x=c.x*xe.x,Z.mapSize.x=c.x),l.y>_&&(c.y=Math.floor(_/xe.y),l.y=c.y*xe.y,Z.mapSize.y=c.y)),Z.map===null||q===!0||le===!0){const O=this.type!==Ma?{minFilter:Bi,magFilter:Bi}:{};Z.map!==null&&Z.map.dispose(),Z.map=new qs(l.x,l.y,O),Z.map.texture.name=$.name+".shadowMap",Z.camera.updateProjectionMatrix()}r.setRenderTarget(Z.map),r.clear();const Ae=Z.getViewportCount();for(let O=0;O<Ae;O++){const se=Z.getViewport(O);d.set(c.x*se.x,c.y*se.y,c.x*se.z,c.y*se.w),ue.viewport(d),Z.updateMatrices($,O),s=Z.getFrustum(),N(z,J,Z.camera,$,this.type)}Z.isPointLightShadow!==!0&&this.type===Ma&&B(Z,J),Z.needsUpdate=!1}v=this.type,E.needsUpdate=!1,r.setRenderTarget(D,w,k)};function B(G,z){const J=e.update(R);S.defines.VSM_SAMPLES!==G.blurSamples&&(S.defines.VSM_SAMPLES=G.blurSamples,M.defines.VSM_SAMPLES=G.blurSamples,S.needsUpdate=!0,M.needsUpdate=!0),G.mapPass===null&&(G.mapPass=new qs(l.x,l.y)),S.uniforms.shadow_pass.value=G.map.texture,S.uniforms.resolution.value=G.mapSize,S.uniforms.radius.value=G.radius,r.setRenderTarget(G.mapPass),r.clear(),r.renderBufferDirect(z,null,J,S,R,null),M.uniforms.shadow_pass.value=G.mapPass.texture,M.uniforms.resolution.value=G.mapSize,M.uniforms.radius.value=G.radius,r.setRenderTarget(G.map),r.clear(),r.renderBufferDirect(z,null,J,M,R,null)}function L(G,z,J,D){let w=null;const k=J.isPointLight===!0?G.customDistanceMaterial:G.customDepthMaterial;if(k!==void 0)w=k;else if(w=J.isPointLight===!0?p:h,r.localClippingEnabled&&z.clipShadows===!0&&Array.isArray(z.clippingPlanes)&&z.clippingPlanes.length!==0||z.displacementMap&&z.displacementScale!==0||z.alphaMap&&z.alphaTest>0||z.map&&z.alphaTest>0||z.alphaToCoverage===!0){const ue=w.uuid,q=z.uuid;let le=m[ue];le===void 0&&(le={},m[ue]=le);let _e=le[q];_e===void 0&&(_e=w.clone(),le[q]=_e,z.addEventListener("dispose",W)),w=_e}if(w.visible=z.visible,w.wireframe=z.wireframe,D===Ma?w.side=z.shadowSide!==null?z.shadowSide:z.side:w.side=z.shadowSide!==null?z.shadowSide:x[z.side],w.alphaMap=z.alphaMap,w.alphaTest=z.alphaToCoverage===!0?.5:z.alphaTest,w.map=z.map,w.clipShadows=z.clipShadows,w.clippingPlanes=z.clippingPlanes,w.clipIntersection=z.clipIntersection,w.displacementMap=z.displacementMap,w.displacementScale=z.displacementScale,w.displacementBias=z.displacementBias,w.wireframeLinewidth=z.wireframeLinewidth,w.linewidth=z.linewidth,J.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const ue=r.properties.get(w);ue.light=J}return w}function N(G,z,J,D,w){if(G.visible===!1)return;if(G.layers.test(z.layers)&&(G.isMesh||G.isLine||G.isPoints)&&(G.castShadow||G.receiveShadow&&w===Ma)&&(!G.frustumCulled||s.intersectsObject(G))){G.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,G.matrixWorld);const q=e.update(G),le=G.material;if(Array.isArray(le)){const _e=q.groups;for(let U=0,$=_e.length;U<$;U++){const Z=_e[U],xe=le[Z.materialIndex];if(xe&&xe.visible){const Ae=L(G,xe,D,w);G.onBeforeShadow(r,G,z,J,q,Ae,Z),r.renderBufferDirect(J,null,q,Ae,G,Z),G.onAfterShadow(r,G,z,J,q,Ae,Z)}}}else if(le.visible){const _e=L(G,le,D,w);G.onBeforeShadow(r,G,z,J,q,_e,null),r.renderBufferDirect(J,null,q,_e,G,null),G.onAfterShadow(r,G,z,J,q,_e,null)}}const ue=G.children;for(let q=0,le=ue.length;q<le;q++)N(ue[q],z,J,D,w)}function W(G){G.target.removeEventListener("dispose",W);for(const J in m){const D=m[J],w=G.target.uuid;w in D&&(D[w].dispose(),delete D[w])}}}const TA={[qd]:Yd,[Zd]:Jd,[Kd]:$d,[Zr]:Qd,[Yd]:qd,[Jd]:Zd,[$d]:Kd,[Qd]:Zr};function AA(r,e){function i(){let j=!1;const De=new cn;let be=null;const Ie=new cn(0,0,0,0);return{setMask:function(Te){be!==Te&&!j&&(r.colorMask(Te,Te,Te,Te),be=Te)},setLocked:function(Te){j=Te},setClear:function(Te,ge,He,st,Ht){Ht===!0&&(Te*=st,ge*=st,He*=st),De.set(Te,ge,He,st),Ie.equals(De)===!1&&(r.clearColor(Te,ge,He,st),Ie.copy(De))},reset:function(){j=!1,be=null,Ie.set(-1,0,0,0)}}}function s(){let j=!1,De=!1,be=null,Ie=null,Te=null;return{setReversed:function(ge){if(De!==ge){const He=e.get("EXT_clip_control");ge?He.clipControlEXT(He.LOWER_LEFT_EXT,He.ZERO_TO_ONE_EXT):He.clipControlEXT(He.LOWER_LEFT_EXT,He.NEGATIVE_ONE_TO_ONE_EXT),De=ge;const st=Te;Te=null,this.setClear(st)}},getReversed:function(){return De},setTest:function(ge){ge?Ee(r.DEPTH_TEST):ze(r.DEPTH_TEST)},setMask:function(ge){be!==ge&&!j&&(r.depthMask(ge),be=ge)},setFunc:function(ge){if(De&&(ge=TA[ge]),Ie!==ge){switch(ge){case qd:r.depthFunc(r.NEVER);break;case Yd:r.depthFunc(r.ALWAYS);break;case Zd:r.depthFunc(r.LESS);break;case Zr:r.depthFunc(r.LEQUAL);break;case Kd:r.depthFunc(r.EQUAL);break;case Qd:r.depthFunc(r.GEQUAL);break;case Jd:r.depthFunc(r.GREATER);break;case $d:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}Ie=ge}},setLocked:function(ge){j=ge},setClear:function(ge){Te!==ge&&(De&&(ge=1-ge),r.clearDepth(ge),Te=ge)},reset:function(){j=!1,be=null,Ie=null,Te=null,De=!1}}}function l(){let j=!1,De=null,be=null,Ie=null,Te=null,ge=null,He=null,st=null,Ht=null;return{setTest:function(Et){j||(Et?Ee(r.STENCIL_TEST):ze(r.STENCIL_TEST))},setMask:function(Et){De!==Et&&!j&&(r.stencilMask(Et),De=Et)},setFunc:function(Et,yn,Qn){(be!==Et||Ie!==yn||Te!==Qn)&&(r.stencilFunc(Et,yn,Qn),be=Et,Ie=yn,Te=Qn)},setOp:function(Et,yn,Qn){(ge!==Et||He!==yn||st!==Qn)&&(r.stencilOp(Et,yn,Qn),ge=Et,He=yn,st=Qn)},setLocked:function(Et){j=Et},setClear:function(Et){Ht!==Et&&(r.clearStencil(Et),Ht=Et)},reset:function(){j=!1,De=null,be=null,Ie=null,Te=null,ge=null,He=null,st=null,Ht=null}}}const c=new i,d=new s,h=new l,p=new WeakMap,m=new WeakMap;let _={},x={},S=new WeakMap,M=[],T=null,R=!1,E=null,v=null,B=null,L=null,N=null,W=null,G=null,z=new mt(0,0,0),J=0,D=!1,w=null,k=null,ue=null,q=null,le=null;const _e=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let U=!1,$=0;const Z=r.getParameter(r.VERSION);Z.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(Z)[1]),U=$>=1):Z.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),U=$>=2);let xe=null,Ae={};const O=r.getParameter(r.SCISSOR_BOX),se=r.getParameter(r.VIEWPORT),Me=new cn().fromArray(O),K=new cn().fromArray(se);function he(j,De,be,Ie){const Te=new Uint8Array(4),ge=r.createTexture();r.bindTexture(j,ge),r.texParameteri(j,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(j,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let He=0;He<be;He++)j===r.TEXTURE_3D||j===r.TEXTURE_2D_ARRAY?r.texImage3D(De,0,r.RGBA,1,1,Ie,0,r.RGBA,r.UNSIGNED_BYTE,Te):r.texImage2D(De+He,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Te);return ge}const Re={};Re[r.TEXTURE_2D]=he(r.TEXTURE_2D,r.TEXTURE_2D,1),Re[r.TEXTURE_CUBE_MAP]=he(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),Re[r.TEXTURE_2D_ARRAY]=he(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),Re[r.TEXTURE_3D]=he(r.TEXTURE_3D,r.TEXTURE_3D,1,1),c.setClear(0,0,0,1),d.setClear(1),h.setClear(0),Ee(r.DEPTH_TEST),d.setFunc(Zr),xt(!1),Ft(Pv),Ee(r.CULL_FACE),H(rs);function Ee(j){_[j]!==!0&&(r.enable(j),_[j]=!0)}function ze(j){_[j]!==!1&&(r.disable(j),_[j]=!1)}function Je(j,De){return x[j]!==De?(r.bindFramebuffer(j,De),x[j]=De,j===r.DRAW_FRAMEBUFFER&&(x[r.FRAMEBUFFER]=De),j===r.FRAMEBUFFER&&(x[r.DRAW_FRAMEBUFFER]=De),!0):!1}function $e(j,De){let be=M,Ie=!1;if(j){be=S.get(De),be===void 0&&(be=[],S.set(De,be));const Te=j.textures;if(be.length!==Te.length||be[0]!==r.COLOR_ATTACHMENT0){for(let ge=0,He=Te.length;ge<He;ge++)be[ge]=r.COLOR_ATTACHMENT0+ge;be.length=Te.length,Ie=!0}}else be[0]!==r.BACK&&(be[0]=r.BACK,Ie=!0);Ie&&r.drawBuffers(be)}function zt(j){return T!==j?(r.useProgram(j),T=j,!0):!1}const It={[Vs]:r.FUNC_ADD,[aS]:r.FUNC_SUBTRACT,[sS]:r.FUNC_REVERSE_SUBTRACT};It[rS]=r.MIN,It[oS]=r.MAX;const _t={[lS]:r.ZERO,[cS]:r.ONE,[uS]:r.SRC_COLOR,[Xd]:r.SRC_ALPHA,[gS]:r.SRC_ALPHA_SATURATE,[pS]:r.DST_COLOR,[dS]:r.DST_ALPHA,[fS]:r.ONE_MINUS_SRC_COLOR,[Wd]:r.ONE_MINUS_SRC_ALPHA,[mS]:r.ONE_MINUS_DST_COLOR,[hS]:r.ONE_MINUS_DST_ALPHA,[vS]:r.CONSTANT_COLOR,[_S]:r.ONE_MINUS_CONSTANT_COLOR,[xS]:r.CONSTANT_ALPHA,[yS]:r.ONE_MINUS_CONSTANT_ALPHA};function H(j,De,be,Ie,Te,ge,He,st,Ht,Et){if(j===rs){R===!0&&(ze(r.BLEND),R=!1);return}if(R===!1&&(Ee(r.BLEND),R=!0),j!==iS){if(j!==E||Et!==D){if((v!==Vs||N!==Vs)&&(r.blendEquation(r.FUNC_ADD),v=Vs,N=Vs),Et)switch(j){case Wr:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Bv:r.blendFunc(r.ONE,r.ONE);break;case zv:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Iv:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",j);break}else switch(j){case Wr:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Bv:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case zv:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Iv:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",j);break}B=null,L=null,W=null,G=null,z.set(0,0,0),J=0,E=j,D=Et}return}Te=Te||De,ge=ge||be,He=He||Ie,(De!==v||Te!==N)&&(r.blendEquationSeparate(It[De],It[Te]),v=De,N=Te),(be!==B||Ie!==L||ge!==W||He!==G)&&(r.blendFuncSeparate(_t[be],_t[Ie],_t[ge],_t[He]),B=be,L=Ie,W=ge,G=He),(st.equals(z)===!1||Ht!==J)&&(r.blendColor(st.r,st.g,st.b,Ht),z.copy(st),J=Ht),E=j,D=!1}function un(j,De){j.side===Ea?ze(r.CULL_FACE):Ee(r.CULL_FACE);let be=j.side===Kn;De&&(be=!be),xt(be),j.blending===Wr&&j.transparent===!1?H(rs):H(j.blending,j.blendEquation,j.blendSrc,j.blendDst,j.blendEquationAlpha,j.blendSrcAlpha,j.blendDstAlpha,j.blendColor,j.blendAlpha,j.premultipliedAlpha),d.setFunc(j.depthFunc),d.setTest(j.depthTest),d.setMask(j.depthWrite),c.setMask(j.colorWrite);const Ie=j.stencilWrite;h.setTest(Ie),Ie&&(h.setMask(j.stencilWriteMask),h.setFunc(j.stencilFunc,j.stencilRef,j.stencilFuncMask),h.setOp(j.stencilFail,j.stencilZFail,j.stencilZPass)),gt(j.polygonOffset,j.polygonOffsetFactor,j.polygonOffsetUnits),j.alphaToCoverage===!0?Ee(r.SAMPLE_ALPHA_TO_COVERAGE):ze(r.SAMPLE_ALPHA_TO_COVERAGE)}function xt(j){w!==j&&(j?r.frontFace(r.CW):r.frontFace(r.CCW),w=j)}function Ft(j){j!==eS?(Ee(r.CULL_FACE),j!==k&&(j===Pv?r.cullFace(r.BACK):j===tS?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ze(r.CULL_FACE),k=j}function ke(j){j!==ue&&(U&&r.lineWidth(j),ue=j)}function gt(j,De,be){j?(Ee(r.POLYGON_OFFSET_FILL),(q!==De||le!==be)&&(r.polygonOffset(De,be),q=De,le=be)):ze(r.POLYGON_OFFSET_FILL)}function Qe(j){j?Ee(r.SCISSOR_TEST):ze(r.SCISSOR_TEST)}function rt(j){j===void 0&&(j=r.TEXTURE0+_e-1),xe!==j&&(r.activeTexture(j),xe=j)}function an(j,De,be){be===void 0&&(xe===null?be=r.TEXTURE0+_e-1:be=xe);let Ie=Ae[be];Ie===void 0&&(Ie={type:void 0,texture:void 0},Ae[be]=Ie),(Ie.type!==j||Ie.texture!==De)&&(xe!==be&&(r.activeTexture(be),xe=be),r.bindTexture(j,De||Re[j]),Ie.type=j,Ie.texture=De)}function P(){const j=Ae[xe];j!==void 0&&j.type!==void 0&&(r.bindTexture(j.type,null),j.type=void 0,j.texture=void 0)}function b(){try{r.compressedTexImage2D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function ne(){try{r.compressedTexImage3D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function me(){try{r.texSubImage2D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function ye(){try{r.texSubImage3D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function fe(){try{r.compressedTexSubImage2D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function We(){try{r.compressedTexSubImage3D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Ue(){try{r.texStorage2D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function je(){try{r.texStorage3D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function qe(){try{r.texImage2D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Se(){try{r.texImage3D(...arguments)}catch(j){console.error("THREE.WebGLState:",j)}}function Ne(j){Me.equals(j)===!1&&(r.scissor(j.x,j.y,j.z,j.w),Me.copy(j))}function Ye(j){K.equals(j)===!1&&(r.viewport(j.x,j.y,j.z,j.w),K.copy(j))}function Ge(j,De){let be=m.get(De);be===void 0&&(be=new WeakMap,m.set(De,be));let Ie=be.get(j);Ie===void 0&&(Ie=r.getUniformBlockIndex(De,j.name),be.set(j,Ie))}function Le(j,De){const Ie=m.get(De).get(j);p.get(De)!==Ie&&(r.uniformBlockBinding(De,Ie,j.__bindingPointIndex),p.set(De,Ie))}function at(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),d.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),_={},xe=null,Ae={},x={},S=new WeakMap,M=[],T=null,R=!1,E=null,v=null,B=null,L=null,N=null,W=null,G=null,z=new mt(0,0,0),J=0,D=!1,w=null,k=null,ue=null,q=null,le=null,Me.set(0,0,r.canvas.width,r.canvas.height),K.set(0,0,r.canvas.width,r.canvas.height),c.reset(),d.reset(),h.reset()}return{buffers:{color:c,depth:d,stencil:h},enable:Ee,disable:ze,bindFramebuffer:Je,drawBuffers:$e,useProgram:zt,setBlending:H,setMaterial:un,setFlipSided:xt,setCullFace:Ft,setLineWidth:ke,setPolygonOffset:gt,setScissorTest:Qe,activeTexture:rt,bindTexture:an,unbindTexture:P,compressedTexImage2D:b,compressedTexImage3D:ne,texImage2D:qe,texImage3D:Se,updateUBOMapping:Ge,uniformBlockBinding:Le,texStorage2D:Ue,texStorage3D:je,texSubImage2D:me,texSubImage3D:ye,compressedTexSubImage2D:fe,compressedTexSubImage3D:We,scissor:Ne,viewport:Ye,reset:at}}function RA(r,e,i,s,l,c,d){const h=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,p=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),m=new Bt,_=new WeakMap;let x;const S=new WeakMap;let M=!1;try{M=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(P,b){return M?new OffscreenCanvas(P,b):tu("canvas")}function R(P,b,ne){let me=1;const ye=an(P);if((ye.width>ne||ye.height>ne)&&(me=ne/Math.max(ye.width,ye.height)),me<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const fe=Math.floor(me*ye.width),We=Math.floor(me*ye.height);x===void 0&&(x=T(fe,We));const Ue=b?T(fe,We):x;return Ue.width=fe,Ue.height=We,Ue.getContext("2d").drawImage(P,0,0,fe,We),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ye.width+"x"+ye.height+") to ("+fe+"x"+We+")."),Ue}else return"data"in P&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ye.width+"x"+ye.height+")."),P;return P}function E(P){return P.generateMipmaps}function v(P){r.generateMipmap(P)}function B(P){return P.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?r.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function L(P,b,ne,me,ye=!1){if(P!==null){if(r[P]!==void 0)return r[P];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let fe=b;if(b===r.RED&&(ne===r.FLOAT&&(fe=r.R32F),ne===r.HALF_FLOAT&&(fe=r.R16F),ne===r.UNSIGNED_BYTE&&(fe=r.R8)),b===r.RED_INTEGER&&(ne===r.UNSIGNED_BYTE&&(fe=r.R8UI),ne===r.UNSIGNED_SHORT&&(fe=r.R16UI),ne===r.UNSIGNED_INT&&(fe=r.R32UI),ne===r.BYTE&&(fe=r.R8I),ne===r.SHORT&&(fe=r.R16I),ne===r.INT&&(fe=r.R32I)),b===r.RG&&(ne===r.FLOAT&&(fe=r.RG32F),ne===r.HALF_FLOAT&&(fe=r.RG16F),ne===r.UNSIGNED_BYTE&&(fe=r.RG8)),b===r.RG_INTEGER&&(ne===r.UNSIGNED_BYTE&&(fe=r.RG8UI),ne===r.UNSIGNED_SHORT&&(fe=r.RG16UI),ne===r.UNSIGNED_INT&&(fe=r.RG32UI),ne===r.BYTE&&(fe=r.RG8I),ne===r.SHORT&&(fe=r.RG16I),ne===r.INT&&(fe=r.RG32I)),b===r.RGB_INTEGER&&(ne===r.UNSIGNED_BYTE&&(fe=r.RGB8UI),ne===r.UNSIGNED_SHORT&&(fe=r.RGB16UI),ne===r.UNSIGNED_INT&&(fe=r.RGB32UI),ne===r.BYTE&&(fe=r.RGB8I),ne===r.SHORT&&(fe=r.RGB16I),ne===r.INT&&(fe=r.RGB32I)),b===r.RGBA_INTEGER&&(ne===r.UNSIGNED_BYTE&&(fe=r.RGBA8UI),ne===r.UNSIGNED_SHORT&&(fe=r.RGBA16UI),ne===r.UNSIGNED_INT&&(fe=r.RGBA32UI),ne===r.BYTE&&(fe=r.RGBA8I),ne===r.SHORT&&(fe=r.RGBA16I),ne===r.INT&&(fe=r.RGBA32I)),b===r.RGB&&ne===r.UNSIGNED_INT_5_9_9_9_REV&&(fe=r.RGB9_E5),b===r.RGBA){const We=ye?$c:Ut.getTransfer(me);ne===r.FLOAT&&(fe=r.RGBA32F),ne===r.HALF_FLOAT&&(fe=r.RGBA16F),ne===r.UNSIGNED_BYTE&&(fe=We===Zt?r.SRGB8_ALPHA8:r.RGBA8),ne===r.UNSIGNED_SHORT_4_4_4_4&&(fe=r.RGBA4),ne===r.UNSIGNED_SHORT_5_5_5_1&&(fe=r.RGB5_A1)}return(fe===r.R16F||fe===r.R32F||fe===r.RG16F||fe===r.RG32F||fe===r.RGBA16F||fe===r.RGBA32F)&&e.get("EXT_color_buffer_float"),fe}function N(P,b){let ne;return P?b===null||b===Ws||b===fl?ne=r.DEPTH24_STENCIL8:b===ba?ne=r.DEPTH32F_STENCIL8:b===ul&&(ne=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Ws||b===fl?ne=r.DEPTH_COMPONENT24:b===ba?ne=r.DEPTH_COMPONENT32F:b===ul&&(ne=r.DEPTH_COMPONENT16),ne}function W(P,b){return E(P)===!0||P.isFramebufferTexture&&P.minFilter!==Bi&&P.minFilter!==Wi?Math.log2(Math.max(b.width,b.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?b.mipmaps.length:1}function G(P){const b=P.target;b.removeEventListener("dispose",G),J(b),b.isVideoTexture&&_.delete(b)}function z(P){const b=P.target;b.removeEventListener("dispose",z),w(b)}function J(P){const b=s.get(P);if(b.__webglInit===void 0)return;const ne=P.source,me=S.get(ne);if(me){const ye=me[b.__cacheKey];ye.usedTimes--,ye.usedTimes===0&&D(P),Object.keys(me).length===0&&S.delete(ne)}s.remove(P)}function D(P){const b=s.get(P);r.deleteTexture(b.__webglTexture);const ne=P.source,me=S.get(ne);delete me[b.__cacheKey],d.memory.textures--}function w(P){const b=s.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),s.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let me=0;me<6;me++){if(Array.isArray(b.__webglFramebuffer[me]))for(let ye=0;ye<b.__webglFramebuffer[me].length;ye++)r.deleteFramebuffer(b.__webglFramebuffer[me][ye]);else r.deleteFramebuffer(b.__webglFramebuffer[me]);b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer[me])}else{if(Array.isArray(b.__webglFramebuffer))for(let me=0;me<b.__webglFramebuffer.length;me++)r.deleteFramebuffer(b.__webglFramebuffer[me]);else r.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&r.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let me=0;me<b.__webglColorRenderbuffer.length;me++)b.__webglColorRenderbuffer[me]&&r.deleteRenderbuffer(b.__webglColorRenderbuffer[me]);b.__webglDepthRenderbuffer&&r.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const ne=P.textures;for(let me=0,ye=ne.length;me<ye;me++){const fe=s.get(ne[me]);fe.__webglTexture&&(r.deleteTexture(fe.__webglTexture),d.memory.textures--),s.remove(ne[me])}s.remove(P)}let k=0;function ue(){k=0}function q(){const P=k;return P>=l.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+P+" texture units while this GPU supports only "+l.maxTextures),k+=1,P}function le(P){const b=[];return b.push(P.wrapS),b.push(P.wrapT),b.push(P.wrapR||0),b.push(P.magFilter),b.push(P.minFilter),b.push(P.anisotropy),b.push(P.internalFormat),b.push(P.format),b.push(P.type),b.push(P.generateMipmaps),b.push(P.premultiplyAlpha),b.push(P.flipY),b.push(P.unpackAlignment),b.push(P.colorSpace),b.join()}function _e(P,b){const ne=s.get(P);if(P.isVideoTexture&&Qe(P),P.isRenderTargetTexture===!1&&P.version>0&&ne.__version!==P.version){const me=P.image;if(me===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(me.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Re(ne,P,b);return}}i.bindTexture(r.TEXTURE_2D,ne.__webglTexture,r.TEXTURE0+b)}function U(P,b){const ne=s.get(P);if(P.version>0&&ne.__version!==P.version){Re(ne,P,b);return}i.bindTexture(r.TEXTURE_2D_ARRAY,ne.__webglTexture,r.TEXTURE0+b)}function $(P,b){const ne=s.get(P);if(P.version>0&&ne.__version!==P.version){Re(ne,P,b);return}i.bindTexture(r.TEXTURE_3D,ne.__webglTexture,r.TEXTURE0+b)}function Z(P,b){const ne=s.get(P);if(P.version>0&&ne.__version!==P.version){Ee(ne,P,b);return}i.bindTexture(r.TEXTURE_CUBE_MAP,ne.__webglTexture,r.TEXTURE0+b)}const xe={[nh]:r.REPEAT,[ks]:r.CLAMP_TO_EDGE,[ih]:r.MIRRORED_REPEAT},Ae={[Bi]:r.NEAREST,[NS]:r.NEAREST_MIPMAP_NEAREST,[Ec]:r.NEAREST_MIPMAP_LINEAR,[Wi]:r.LINEAR,[hd]:r.LINEAR_MIPMAP_NEAREST,[Xs]:r.LINEAR_MIPMAP_LINEAR},O={[OS]:r.NEVER,[HS]:r.ALWAYS,[PS]:r.LESS,[i0]:r.LEQUAL,[BS]:r.EQUAL,[FS]:r.GEQUAL,[zS]:r.GREATER,[IS]:r.NOTEQUAL};function se(P,b){if(b.type===ba&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Wi||b.magFilter===hd||b.magFilter===Ec||b.magFilter===Xs||b.minFilter===Wi||b.minFilter===hd||b.minFilter===Ec||b.minFilter===Xs)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(P,r.TEXTURE_WRAP_S,xe[b.wrapS]),r.texParameteri(P,r.TEXTURE_WRAP_T,xe[b.wrapT]),(P===r.TEXTURE_3D||P===r.TEXTURE_2D_ARRAY)&&r.texParameteri(P,r.TEXTURE_WRAP_R,xe[b.wrapR]),r.texParameteri(P,r.TEXTURE_MAG_FILTER,Ae[b.magFilter]),r.texParameteri(P,r.TEXTURE_MIN_FILTER,Ae[b.minFilter]),b.compareFunction&&(r.texParameteri(P,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(P,r.TEXTURE_COMPARE_FUNC,O[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Bi||b.minFilter!==Ec&&b.minFilter!==Xs||b.type===ba&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||s.get(b).__currentAnisotropy){const ne=e.get("EXT_texture_filter_anisotropic");r.texParameterf(P,ne.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,l.getMaxAnisotropy())),s.get(b).__currentAnisotropy=b.anisotropy}}}function Me(P,b){let ne=!1;P.__webglInit===void 0&&(P.__webglInit=!0,b.addEventListener("dispose",G));const me=b.source;let ye=S.get(me);ye===void 0&&(ye={},S.set(me,ye));const fe=le(b);if(fe!==P.__cacheKey){ye[fe]===void 0&&(ye[fe]={texture:r.createTexture(),usedTimes:0},d.memory.textures++,ne=!0),ye[fe].usedTimes++;const We=ye[P.__cacheKey];We!==void 0&&(ye[P.__cacheKey].usedTimes--,We.usedTimes===0&&D(b)),P.__cacheKey=fe,P.__webglTexture=ye[fe].texture}return ne}function K(P,b,ne){return Math.floor(Math.floor(P/ne)/b)}function he(P,b,ne,me){const fe=P.updateRanges;if(fe.length===0)i.texSubImage2D(r.TEXTURE_2D,0,0,0,b.width,b.height,ne,me,b.data);else{fe.sort((Se,Ne)=>Se.start-Ne.start);let We=0;for(let Se=1;Se<fe.length;Se++){const Ne=fe[We],Ye=fe[Se],Ge=Ne.start+Ne.count,Le=K(Ye.start,b.width,4),at=K(Ne.start,b.width,4);Ye.start<=Ge+1&&Le===at&&K(Ye.start+Ye.count-1,b.width,4)===Le?Ne.count=Math.max(Ne.count,Ye.start+Ye.count-Ne.start):(++We,fe[We]=Ye)}fe.length=We+1;const Ue=r.getParameter(r.UNPACK_ROW_LENGTH),je=r.getParameter(r.UNPACK_SKIP_PIXELS),qe=r.getParameter(r.UNPACK_SKIP_ROWS);r.pixelStorei(r.UNPACK_ROW_LENGTH,b.width);for(let Se=0,Ne=fe.length;Se<Ne;Se++){const Ye=fe[Se],Ge=Math.floor(Ye.start/4),Le=Math.ceil(Ye.count/4),at=Ge%b.width,j=Math.floor(Ge/b.width),De=Le,be=1;r.pixelStorei(r.UNPACK_SKIP_PIXELS,at),r.pixelStorei(r.UNPACK_SKIP_ROWS,j),i.texSubImage2D(r.TEXTURE_2D,0,at,j,De,be,ne,me,b.data)}P.clearUpdateRanges(),r.pixelStorei(r.UNPACK_ROW_LENGTH,Ue),r.pixelStorei(r.UNPACK_SKIP_PIXELS,je),r.pixelStorei(r.UNPACK_SKIP_ROWS,qe)}}function Re(P,b,ne){let me=r.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(me=r.TEXTURE_2D_ARRAY),b.isData3DTexture&&(me=r.TEXTURE_3D);const ye=Me(P,b),fe=b.source;i.bindTexture(me,P.__webglTexture,r.TEXTURE0+ne);const We=s.get(fe);if(fe.version!==We.__version||ye===!0){i.activeTexture(r.TEXTURE0+ne);const Ue=Ut.getPrimaries(Ut.workingColorSpace),je=b.colorSpace===ss?null:Ut.getPrimaries(b.colorSpace),qe=b.colorSpace===ss||Ue===je?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,qe);let Se=R(b.image,!1,l.maxTextureSize);Se=rt(b,Se);const Ne=c.convert(b.format,b.colorSpace),Ye=c.convert(b.type);let Ge=L(b.internalFormat,Ne,Ye,b.colorSpace,b.isVideoTexture);se(me,b);let Le;const at=b.mipmaps,j=b.isVideoTexture!==!0,De=We.__version===void 0||ye===!0,be=fe.dataReady,Ie=W(b,Se);if(b.isDepthTexture)Ge=N(b.format===hl,b.type),De&&(j?i.texStorage2D(r.TEXTURE_2D,1,Ge,Se.width,Se.height):i.texImage2D(r.TEXTURE_2D,0,Ge,Se.width,Se.height,0,Ne,Ye,null));else if(b.isDataTexture)if(at.length>0){j&&De&&i.texStorage2D(r.TEXTURE_2D,Ie,Ge,at[0].width,at[0].height);for(let Te=0,ge=at.length;Te<ge;Te++)Le=at[Te],j?be&&i.texSubImage2D(r.TEXTURE_2D,Te,0,0,Le.width,Le.height,Ne,Ye,Le.data):i.texImage2D(r.TEXTURE_2D,Te,Ge,Le.width,Le.height,0,Ne,Ye,Le.data);b.generateMipmaps=!1}else j?(De&&i.texStorage2D(r.TEXTURE_2D,Ie,Ge,Se.width,Se.height),be&&he(b,Se,Ne,Ye)):i.texImage2D(r.TEXTURE_2D,0,Ge,Se.width,Se.height,0,Ne,Ye,Se.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){j&&De&&i.texStorage3D(r.TEXTURE_2D_ARRAY,Ie,Ge,at[0].width,at[0].height,Se.depth);for(let Te=0,ge=at.length;Te<ge;Te++)if(Le=at[Te],b.format!==Oi)if(Ne!==null)if(j){if(be)if(b.layerUpdates.size>0){const He=d_(Le.width,Le.height,b.format,b.type);for(const st of b.layerUpdates){const Ht=Le.data.subarray(st*He/Le.data.BYTES_PER_ELEMENT,(st+1)*He/Le.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Te,0,0,st,Le.width,Le.height,1,Ne,Ht)}b.clearLayerUpdates()}else i.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Te,0,0,0,Le.width,Le.height,Se.depth,Ne,Le.data)}else i.compressedTexImage3D(r.TEXTURE_2D_ARRAY,Te,Ge,Le.width,Le.height,Se.depth,0,Le.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else j?be&&i.texSubImage3D(r.TEXTURE_2D_ARRAY,Te,0,0,0,Le.width,Le.height,Se.depth,Ne,Ye,Le.data):i.texImage3D(r.TEXTURE_2D_ARRAY,Te,Ge,Le.width,Le.height,Se.depth,0,Ne,Ye,Le.data)}else{j&&De&&i.texStorage2D(r.TEXTURE_2D,Ie,Ge,at[0].width,at[0].height);for(let Te=0,ge=at.length;Te<ge;Te++)Le=at[Te],b.format!==Oi?Ne!==null?j?be&&i.compressedTexSubImage2D(r.TEXTURE_2D,Te,0,0,Le.width,Le.height,Ne,Le.data):i.compressedTexImage2D(r.TEXTURE_2D,Te,Ge,Le.width,Le.height,0,Le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):j?be&&i.texSubImage2D(r.TEXTURE_2D,Te,0,0,Le.width,Le.height,Ne,Ye,Le.data):i.texImage2D(r.TEXTURE_2D,Te,Ge,Le.width,Le.height,0,Ne,Ye,Le.data)}else if(b.isDataArrayTexture)if(j){if(De&&i.texStorage3D(r.TEXTURE_2D_ARRAY,Ie,Ge,Se.width,Se.height,Se.depth),be)if(b.layerUpdates.size>0){const Te=d_(Se.width,Se.height,b.format,b.type);for(const ge of b.layerUpdates){const He=Se.data.subarray(ge*Te/Se.data.BYTES_PER_ELEMENT,(ge+1)*Te/Se.data.BYTES_PER_ELEMENT);i.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,ge,Se.width,Se.height,1,Ne,Ye,He)}b.clearLayerUpdates()}else i.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,Se.width,Se.height,Se.depth,Ne,Ye,Se.data)}else i.texImage3D(r.TEXTURE_2D_ARRAY,0,Ge,Se.width,Se.height,Se.depth,0,Ne,Ye,Se.data);else if(b.isData3DTexture)j?(De&&i.texStorage3D(r.TEXTURE_3D,Ie,Ge,Se.width,Se.height,Se.depth),be&&i.texSubImage3D(r.TEXTURE_3D,0,0,0,0,Se.width,Se.height,Se.depth,Ne,Ye,Se.data)):i.texImage3D(r.TEXTURE_3D,0,Ge,Se.width,Se.height,Se.depth,0,Ne,Ye,Se.data);else if(b.isFramebufferTexture){if(De)if(j)i.texStorage2D(r.TEXTURE_2D,Ie,Ge,Se.width,Se.height);else{let Te=Se.width,ge=Se.height;for(let He=0;He<Ie;He++)i.texImage2D(r.TEXTURE_2D,He,Ge,Te,ge,0,Ne,Ye,null),Te>>=1,ge>>=1}}else if(at.length>0){if(j&&De){const Te=an(at[0]);i.texStorage2D(r.TEXTURE_2D,Ie,Ge,Te.width,Te.height)}for(let Te=0,ge=at.length;Te<ge;Te++)Le=at[Te],j?be&&i.texSubImage2D(r.TEXTURE_2D,Te,0,0,Ne,Ye,Le):i.texImage2D(r.TEXTURE_2D,Te,Ge,Ne,Ye,Le);b.generateMipmaps=!1}else if(j){if(De){const Te=an(Se);i.texStorage2D(r.TEXTURE_2D,Ie,Ge,Te.width,Te.height)}be&&i.texSubImage2D(r.TEXTURE_2D,0,0,0,Ne,Ye,Se)}else i.texImage2D(r.TEXTURE_2D,0,Ge,Ne,Ye,Se);E(b)&&v(me),We.__version=fe.version,b.onUpdate&&b.onUpdate(b)}P.__version=b.version}function Ee(P,b,ne){if(b.image.length!==6)return;const me=Me(P,b),ye=b.source;i.bindTexture(r.TEXTURE_CUBE_MAP,P.__webglTexture,r.TEXTURE0+ne);const fe=s.get(ye);if(ye.version!==fe.__version||me===!0){i.activeTexture(r.TEXTURE0+ne);const We=Ut.getPrimaries(Ut.workingColorSpace),Ue=b.colorSpace===ss?null:Ut.getPrimaries(b.colorSpace),je=b.colorSpace===ss||We===Ue?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,je);const qe=b.isCompressedTexture||b.image[0].isCompressedTexture,Se=b.image[0]&&b.image[0].isDataTexture,Ne=[];for(let ge=0;ge<6;ge++)!qe&&!Se?Ne[ge]=R(b.image[ge],!0,l.maxCubemapSize):Ne[ge]=Se?b.image[ge].image:b.image[ge],Ne[ge]=rt(b,Ne[ge]);const Ye=Ne[0],Ge=c.convert(b.format,b.colorSpace),Le=c.convert(b.type),at=L(b.internalFormat,Ge,Le,b.colorSpace),j=b.isVideoTexture!==!0,De=fe.__version===void 0||me===!0,be=ye.dataReady;let Ie=W(b,Ye);se(r.TEXTURE_CUBE_MAP,b);let Te;if(qe){j&&De&&i.texStorage2D(r.TEXTURE_CUBE_MAP,Ie,at,Ye.width,Ye.height);for(let ge=0;ge<6;ge++){Te=Ne[ge].mipmaps;for(let He=0;He<Te.length;He++){const st=Te[He];b.format!==Oi?Ge!==null?j?be&&i.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He,0,0,st.width,st.height,Ge,st.data):i.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He,at,st.width,st.height,0,st.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):j?be&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He,0,0,st.width,st.height,Ge,Le,st.data):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He,at,st.width,st.height,0,Ge,Le,st.data)}}}else{if(Te=b.mipmaps,j&&De){Te.length>0&&Ie++;const ge=an(Ne[0]);i.texStorage2D(r.TEXTURE_CUBE_MAP,Ie,at,ge.width,ge.height)}for(let ge=0;ge<6;ge++)if(Se){j?be&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Ne[ge].width,Ne[ge].height,Ge,Le,Ne[ge].data):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,at,Ne[ge].width,Ne[ge].height,0,Ge,Le,Ne[ge].data);for(let He=0;He<Te.length;He++){const Ht=Te[He].image[ge].image;j?be&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He+1,0,0,Ht.width,Ht.height,Ge,Le,Ht.data):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He+1,at,Ht.width,Ht.height,0,Ge,Le,Ht.data)}}else{j?be&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Ge,Le,Ne[ge]):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,at,Ge,Le,Ne[ge]);for(let He=0;He<Te.length;He++){const st=Te[He];j?be&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He+1,0,0,Ge,Le,st.image[ge]):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He+1,at,Ge,Le,st.image[ge])}}}E(b)&&v(r.TEXTURE_CUBE_MAP),fe.__version=ye.version,b.onUpdate&&b.onUpdate(b)}P.__version=b.version}function ze(P,b,ne,me,ye,fe){const We=c.convert(ne.format,ne.colorSpace),Ue=c.convert(ne.type),je=L(ne.internalFormat,We,Ue,ne.colorSpace),qe=s.get(b),Se=s.get(ne);if(Se.__renderTarget=b,!qe.__hasExternalTextures){const Ne=Math.max(1,b.width>>fe),Ye=Math.max(1,b.height>>fe);ye===r.TEXTURE_3D||ye===r.TEXTURE_2D_ARRAY?i.texImage3D(ye,fe,je,Ne,Ye,b.depth,0,We,Ue,null):i.texImage2D(ye,fe,je,Ne,Ye,0,We,Ue,null)}i.bindFramebuffer(r.FRAMEBUFFER,P),gt(b)?h.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,me,ye,Se.__webglTexture,0,ke(b)):(ye===r.TEXTURE_2D||ye>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ye<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,me,ye,Se.__webglTexture,fe),i.bindFramebuffer(r.FRAMEBUFFER,null)}function Je(P,b,ne){if(r.bindRenderbuffer(r.RENDERBUFFER,P),b.depthBuffer){const me=b.depthTexture,ye=me&&me.isDepthTexture?me.type:null,fe=N(b.stencilBuffer,ye),We=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Ue=ke(b);gt(b)?h.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ue,fe,b.width,b.height):ne?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ue,fe,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,fe,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,We,r.RENDERBUFFER,P)}else{const me=b.textures;for(let ye=0;ye<me.length;ye++){const fe=me[ye],We=c.convert(fe.format,fe.colorSpace),Ue=c.convert(fe.type),je=L(fe.internalFormat,We,Ue,fe.colorSpace),qe=ke(b);ne&&gt(b)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,qe,je,b.width,b.height):gt(b)?h.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,qe,je,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,je,b.width,b.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function $e(P,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(i.bindFramebuffer(r.FRAMEBUFFER,P),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const me=s.get(b.depthTexture);me.__renderTarget=b,(!me.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),_e(b.depthTexture,0);const ye=me.__webglTexture,fe=ke(b);if(b.depthTexture.format===dl)gt(b)?h.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ye,0,fe):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ye,0);else if(b.depthTexture.format===hl)gt(b)?h.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ye,0,fe):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ye,0);else throw new Error("Unknown depthTexture format")}function zt(P){const b=s.get(P),ne=P.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==P.depthTexture){const me=P.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),me){const ye=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,me.removeEventListener("dispose",ye)};me.addEventListener("dispose",ye),b.__depthDisposeCallback=ye}b.__boundDepthTexture=me}if(P.depthTexture&&!b.__autoAllocateDepthBuffer){if(ne)throw new Error("target.depthTexture not supported in Cube render targets");const me=P.texture.mipmaps;me&&me.length>0?$e(b.__webglFramebuffer[0],P):$e(b.__webglFramebuffer,P)}else if(ne){b.__webglDepthbuffer=[];for(let me=0;me<6;me++)if(i.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[me]),b.__webglDepthbuffer[me]===void 0)b.__webglDepthbuffer[me]=r.createRenderbuffer(),Je(b.__webglDepthbuffer[me],P,!1);else{const ye=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,fe=b.__webglDepthbuffer[me];r.bindRenderbuffer(r.RENDERBUFFER,fe),r.framebufferRenderbuffer(r.FRAMEBUFFER,ye,r.RENDERBUFFER,fe)}}else{const me=P.texture.mipmaps;if(me&&me.length>0?i.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[0]):i.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=r.createRenderbuffer(),Je(b.__webglDepthbuffer,P,!1);else{const ye=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,fe=b.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,fe),r.framebufferRenderbuffer(r.FRAMEBUFFER,ye,r.RENDERBUFFER,fe)}}i.bindFramebuffer(r.FRAMEBUFFER,null)}function It(P,b,ne){const me=s.get(P);b!==void 0&&ze(me.__webglFramebuffer,P,P.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),ne!==void 0&&zt(P)}function _t(P){const b=P.texture,ne=s.get(P),me=s.get(b);P.addEventListener("dispose",z);const ye=P.textures,fe=P.isWebGLCubeRenderTarget===!0,We=ye.length>1;if(We||(me.__webglTexture===void 0&&(me.__webglTexture=r.createTexture()),me.__version=b.version,d.memory.textures++),fe){ne.__webglFramebuffer=[];for(let Ue=0;Ue<6;Ue++)if(b.mipmaps&&b.mipmaps.length>0){ne.__webglFramebuffer[Ue]=[];for(let je=0;je<b.mipmaps.length;je++)ne.__webglFramebuffer[Ue][je]=r.createFramebuffer()}else ne.__webglFramebuffer[Ue]=r.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){ne.__webglFramebuffer=[];for(let Ue=0;Ue<b.mipmaps.length;Ue++)ne.__webglFramebuffer[Ue]=r.createFramebuffer()}else ne.__webglFramebuffer=r.createFramebuffer();if(We)for(let Ue=0,je=ye.length;Ue<je;Ue++){const qe=s.get(ye[Ue]);qe.__webglTexture===void 0&&(qe.__webglTexture=r.createTexture(),d.memory.textures++)}if(P.samples>0&&gt(P)===!1){ne.__webglMultisampledFramebuffer=r.createFramebuffer(),ne.__webglColorRenderbuffer=[],i.bindFramebuffer(r.FRAMEBUFFER,ne.__webglMultisampledFramebuffer);for(let Ue=0;Ue<ye.length;Ue++){const je=ye[Ue];ne.__webglColorRenderbuffer[Ue]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,ne.__webglColorRenderbuffer[Ue]);const qe=c.convert(je.format,je.colorSpace),Se=c.convert(je.type),Ne=L(je.internalFormat,qe,Se,je.colorSpace,P.isXRRenderTarget===!0),Ye=ke(P);r.renderbufferStorageMultisample(r.RENDERBUFFER,Ye,Ne,P.width,P.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ue,r.RENDERBUFFER,ne.__webglColorRenderbuffer[Ue])}r.bindRenderbuffer(r.RENDERBUFFER,null),P.depthBuffer&&(ne.__webglDepthRenderbuffer=r.createRenderbuffer(),Je(ne.__webglDepthRenderbuffer,P,!0)),i.bindFramebuffer(r.FRAMEBUFFER,null)}}if(fe){i.bindTexture(r.TEXTURE_CUBE_MAP,me.__webglTexture),se(r.TEXTURE_CUBE_MAP,b);for(let Ue=0;Ue<6;Ue++)if(b.mipmaps&&b.mipmaps.length>0)for(let je=0;je<b.mipmaps.length;je++)ze(ne.__webglFramebuffer[Ue][je],P,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+Ue,je);else ze(ne.__webglFramebuffer[Ue],P,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+Ue,0);E(b)&&v(r.TEXTURE_CUBE_MAP),i.unbindTexture()}else if(We){for(let Ue=0,je=ye.length;Ue<je;Ue++){const qe=ye[Ue],Se=s.get(qe);i.bindTexture(r.TEXTURE_2D,Se.__webglTexture),se(r.TEXTURE_2D,qe),ze(ne.__webglFramebuffer,P,qe,r.COLOR_ATTACHMENT0+Ue,r.TEXTURE_2D,0),E(qe)&&v(r.TEXTURE_2D)}i.unbindTexture()}else{let Ue=r.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(Ue=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),i.bindTexture(Ue,me.__webglTexture),se(Ue,b),b.mipmaps&&b.mipmaps.length>0)for(let je=0;je<b.mipmaps.length;je++)ze(ne.__webglFramebuffer[je],P,b,r.COLOR_ATTACHMENT0,Ue,je);else ze(ne.__webglFramebuffer,P,b,r.COLOR_ATTACHMENT0,Ue,0);E(b)&&v(Ue),i.unbindTexture()}P.depthBuffer&&zt(P)}function H(P){const b=P.textures;for(let ne=0,me=b.length;ne<me;ne++){const ye=b[ne];if(E(ye)){const fe=B(P),We=s.get(ye).__webglTexture;i.bindTexture(fe,We),v(fe),i.unbindTexture()}}}const un=[],xt=[];function Ft(P){if(P.samples>0){if(gt(P)===!1){const b=P.textures,ne=P.width,me=P.height;let ye=r.COLOR_BUFFER_BIT;const fe=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,We=s.get(P),Ue=b.length>1;if(Ue)for(let qe=0;qe<b.length;qe++)i.bindFramebuffer(r.FRAMEBUFFER,We.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+qe,r.RENDERBUFFER,null),i.bindFramebuffer(r.FRAMEBUFFER,We.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+qe,r.TEXTURE_2D,null,0);i.bindFramebuffer(r.READ_FRAMEBUFFER,We.__webglMultisampledFramebuffer);const je=P.texture.mipmaps;je&&je.length>0?i.bindFramebuffer(r.DRAW_FRAMEBUFFER,We.__webglFramebuffer[0]):i.bindFramebuffer(r.DRAW_FRAMEBUFFER,We.__webglFramebuffer);for(let qe=0;qe<b.length;qe++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(ye|=r.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(ye|=r.STENCIL_BUFFER_BIT)),Ue){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,We.__webglColorRenderbuffer[qe]);const Se=s.get(b[qe]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Se,0)}r.blitFramebuffer(0,0,ne,me,0,0,ne,me,ye,r.NEAREST),p===!0&&(un.length=0,xt.length=0,un.push(r.COLOR_ATTACHMENT0+qe),P.depthBuffer&&P.resolveDepthBuffer===!1&&(un.push(fe),xt.push(fe),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,xt)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,un))}if(i.bindFramebuffer(r.READ_FRAMEBUFFER,null),i.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),Ue)for(let qe=0;qe<b.length;qe++){i.bindFramebuffer(r.FRAMEBUFFER,We.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+qe,r.RENDERBUFFER,We.__webglColorRenderbuffer[qe]);const Se=s.get(b[qe]).__webglTexture;i.bindFramebuffer(r.FRAMEBUFFER,We.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+qe,r.TEXTURE_2D,Se,0)}i.bindFramebuffer(r.DRAW_FRAMEBUFFER,We.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.resolveDepthBuffer===!1&&p){const b=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[b])}}}function ke(P){return Math.min(l.maxSamples,P.samples)}function gt(P){const b=s.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Qe(P){const b=d.render.frame;_.get(P)!==b&&(_.set(P,b),P.update())}function rt(P,b){const ne=P.colorSpace,me=P.format,ye=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||ne!==Jr&&ne!==ss&&(Ut.getTransfer(ne)===Zt?(me!==Oi||ye!==Yi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",ne)),b}function an(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(m.width=P.naturalWidth||P.width,m.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(m.width=P.displayWidth,m.height=P.displayHeight):(m.width=P.width,m.height=P.height),m}this.allocateTextureUnit=q,this.resetTextureUnits=ue,this.setTexture2D=_e,this.setTexture2DArray=U,this.setTexture3D=$,this.setTextureCube=Z,this.rebindTextures=It,this.setupRenderTarget=_t,this.updateRenderTargetMipmap=H,this.updateMultisampleRenderTarget=Ft,this.setupDepthRenderbuffer=zt,this.setupFrameBufferTexture=ze,this.useMultisampledRTT=gt}function CA(r,e){function i(s,l=ss){let c;const d=Ut.getTransfer(l);if(s===Yi)return r.UNSIGNED_BYTE;if(s===Ph)return r.UNSIGNED_SHORT_4_4_4_4;if(s===Bh)return r.UNSIGNED_SHORT_5_5_5_1;if(s===K_)return r.UNSIGNED_INT_5_9_9_9_REV;if(s===Y_)return r.BYTE;if(s===Z_)return r.SHORT;if(s===ul)return r.UNSIGNED_SHORT;if(s===Oh)return r.INT;if(s===Ws)return r.UNSIGNED_INT;if(s===ba)return r.FLOAT;if(s===ml)return r.HALF_FLOAT;if(s===Q_)return r.ALPHA;if(s===J_)return r.RGB;if(s===Oi)return r.RGBA;if(s===dl)return r.DEPTH_COMPONENT;if(s===hl)return r.DEPTH_STENCIL;if(s===$_)return r.RED;if(s===zh)return r.RED_INTEGER;if(s===e0)return r.RG;if(s===Ih)return r.RG_INTEGER;if(s===Fh)return r.RGBA_INTEGER;if(s===qc||s===Yc||s===Zc||s===Kc)if(d===Zt)if(c=e.get("WEBGL_compressed_texture_s3tc_srgb"),c!==null){if(s===qc)return c.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Yc)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Zc)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Kc)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(c=e.get("WEBGL_compressed_texture_s3tc"),c!==null){if(s===qc)return c.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Yc)return c.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Zc)return c.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Kc)return c.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===ah||s===sh||s===rh||s===oh)if(c=e.get("WEBGL_compressed_texture_pvrtc"),c!==null){if(s===ah)return c.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===sh)return c.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===rh)return c.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===oh)return c.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===lh||s===ch||s===uh)if(c=e.get("WEBGL_compressed_texture_etc"),c!==null){if(s===lh||s===ch)return d===Zt?c.COMPRESSED_SRGB8_ETC2:c.COMPRESSED_RGB8_ETC2;if(s===uh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:c.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===fh||s===dh||s===hh||s===ph||s===mh||s===gh||s===vh||s===_h||s===xh||s===yh||s===Sh||s===Mh||s===Eh||s===bh)if(c=e.get("WEBGL_compressed_texture_astc"),c!==null){if(s===fh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:c.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===dh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:c.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===hh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:c.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===ph)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:c.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===mh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:c.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===gh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:c.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===vh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:c.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===_h)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:c.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===xh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:c.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===yh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:c.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Sh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:c.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Mh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:c.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Eh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:c.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===bh)return d===Zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:c.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===Qc||s===Th||s===Ah)if(c=e.get("EXT_texture_compression_bptc"),c!==null){if(s===Qc)return d===Zt?c.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:c.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Th)return c.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Ah)return c.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===t0||s===Rh||s===Ch||s===wh)if(c=e.get("EXT_texture_compression_rgtc"),c!==null){if(s===Qc)return c.COMPRESSED_RED_RGTC1_EXT;if(s===Rh)return c.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Ch)return c.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===wh)return c.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===fl?r.UNSIGNED_INT_24_8:r[s]!==void 0?r[s]:null}return{convert:i}}const wA=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,NA=`
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

}`;class DA{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,i,s){if(this.texture===null){const l=new jn,c=e.properties.get(l);c.__webglTexture=i.texture,(i.depthNear!==s.depthNear||i.depthFar!==s.depthFar)&&(this.depthNear=i.depthNear,this.depthFar=i.depthFar),this.texture=l}}getMesh(e){if(this.texture!==null&&this.mesh===null){const i=e.cameras[0].viewport,s=new cs({vertexShader:wA,fragmentShader:NA,uniforms:{depthColor:{value:this.texture},depthWidth:{value:i.z},depthHeight:{value:i.w}}});this.mesh=new Pi(new ru(20,20),s)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class UA extends eo{constructor(e,i){super();const s=this;let l=null,c=1,d=null,h="local-floor",p=1,m=null,_=null,x=null,S=null,M=null,T=null;const R=new DA,E=i.getContextAttributes();let v=null,B=null;const L=[],N=[],W=new Bt;let G=null;const z=new Mi;z.viewport=new cn;const J=new Mi;J.viewport=new cn;const D=[z,J],w=new jM;let k=null,ue=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let he=L[K];return he===void 0&&(he=new Od,L[K]=he),he.getTargetRaySpace()},this.getControllerGrip=function(K){let he=L[K];return he===void 0&&(he=new Od,L[K]=he),he.getGripSpace()},this.getHand=function(K){let he=L[K];return he===void 0&&(he=new Od,L[K]=he),he.getHandSpace()};function q(K){const he=N.indexOf(K.inputSource);if(he===-1)return;const Re=L[he];Re!==void 0&&(Re.update(K.inputSource,K.frame,m||d),Re.dispatchEvent({type:K.type,data:K.inputSource}))}function le(){l.removeEventListener("select",q),l.removeEventListener("selectstart",q),l.removeEventListener("selectend",q),l.removeEventListener("squeeze",q),l.removeEventListener("squeezestart",q),l.removeEventListener("squeezeend",q),l.removeEventListener("end",le),l.removeEventListener("inputsourceschange",_e);for(let K=0;K<L.length;K++){const he=N[K];he!==null&&(N[K]=null,L[K].disconnect(he))}k=null,ue=null,R.reset(),e.setRenderTarget(v),M=null,S=null,x=null,l=null,B=null,Me.stop(),s.isPresenting=!1,e.setPixelRatio(G),e.setSize(W.width,W.height,!1),s.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){c=K,s.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){h=K,s.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return m||d},this.setReferenceSpace=function(K){m=K},this.getBaseLayer=function(){return S!==null?S:M},this.getBinding=function(){return x},this.getFrame=function(){return T},this.getSession=function(){return l},this.setSession=async function(K){if(l=K,l!==null){if(v=e.getRenderTarget(),l.addEventListener("select",q),l.addEventListener("selectstart",q),l.addEventListener("selectend",q),l.addEventListener("squeeze",q),l.addEventListener("squeezestart",q),l.addEventListener("squeezeend",q),l.addEventListener("end",le),l.addEventListener("inputsourceschange",_e),E.xrCompatible!==!0&&await i.makeXRCompatible(),G=e.getPixelRatio(),e.getSize(W),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let Re=null,Ee=null,ze=null;E.depth&&(ze=E.stencil?i.DEPTH24_STENCIL8:i.DEPTH_COMPONENT24,Re=E.stencil?hl:dl,Ee=E.stencil?fl:Ws);const Je={colorFormat:i.RGBA8,depthFormat:ze,scaleFactor:c};x=new XRWebGLBinding(l,i),S=x.createProjectionLayer(Je),l.updateRenderState({layers:[S]}),e.setPixelRatio(1),e.setSize(S.textureWidth,S.textureHeight,!1),B=new qs(S.textureWidth,S.textureHeight,{format:Oi,type:Yi,depthTexture:new g0(S.textureWidth,S.textureHeight,Ee,void 0,void 0,void 0,void 0,void 0,void 0,Re),stencilBuffer:E.stencil,colorSpace:e.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:S.ignoreDepthValues===!1,resolveStencilBuffer:S.ignoreDepthValues===!1})}else{const Re={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:c};M=new XRWebGLLayer(l,i,Re),l.updateRenderState({baseLayer:M}),e.setPixelRatio(1),e.setSize(M.framebufferWidth,M.framebufferHeight,!1),B=new qs(M.framebufferWidth,M.framebufferHeight,{format:Oi,type:Yi,colorSpace:e.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:M.ignoreDepthValues===!1,resolveStencilBuffer:M.ignoreDepthValues===!1})}B.isXRRenderTarget=!0,this.setFoveation(p),m=null,d=await l.requestReferenceSpace(h),Me.setContext(l),Me.start(),s.isPresenting=!0,s.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(l!==null)return l.environmentBlendMode},this.getDepthTexture=function(){return R.getDepthTexture()};function _e(K){for(let he=0;he<K.removed.length;he++){const Re=K.removed[he],Ee=N.indexOf(Re);Ee>=0&&(N[Ee]=null,L[Ee].disconnect(Re))}for(let he=0;he<K.added.length;he++){const Re=K.added[he];let Ee=N.indexOf(Re);if(Ee===-1){for(let Je=0;Je<L.length;Je++)if(Je>=N.length){N.push(Re),Ee=Je;break}else if(N[Je]===null){N[Je]=Re,Ee=Je;break}if(Ee===-1)break}const ze=L[Ee];ze&&ze.connect(Re)}}const U=new ae,$=new ae;function Z(K,he,Re){U.setFromMatrixPosition(he.matrixWorld),$.setFromMatrixPosition(Re.matrixWorld);const Ee=U.distanceTo($),ze=he.projectionMatrix.elements,Je=Re.projectionMatrix.elements,$e=ze[14]/(ze[10]-1),zt=ze[14]/(ze[10]+1),It=(ze[9]+1)/ze[5],_t=(ze[9]-1)/ze[5],H=(ze[8]-1)/ze[0],un=(Je[8]+1)/Je[0],xt=$e*H,Ft=$e*un,ke=Ee/(-H+un),gt=ke*-H;if(he.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(gt),K.translateZ(ke),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),ze[10]===-1)K.projectionMatrix.copy(he.projectionMatrix),K.projectionMatrixInverse.copy(he.projectionMatrixInverse);else{const Qe=$e+ke,rt=zt+ke,an=xt-gt,P=Ft+(Ee-gt),b=It*zt/rt*Qe,ne=_t*zt/rt*Qe;K.projectionMatrix.makePerspective(an,P,b,ne,Qe,rt),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function xe(K,he){he===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(he.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(l===null)return;let he=K.near,Re=K.far;R.texture!==null&&(R.depthNear>0&&(he=R.depthNear),R.depthFar>0&&(Re=R.depthFar)),w.near=J.near=z.near=he,w.far=J.far=z.far=Re,(k!==w.near||ue!==w.far)&&(l.updateRenderState({depthNear:w.near,depthFar:w.far}),k=w.near,ue=w.far),z.layers.mask=K.layers.mask|2,J.layers.mask=K.layers.mask|4,w.layers.mask=z.layers.mask|J.layers.mask;const Ee=K.parent,ze=w.cameras;xe(w,Ee);for(let Je=0;Je<ze.length;Je++)xe(ze[Je],Ee);ze.length===2?Z(w,z,J):w.projectionMatrix.copy(z.projectionMatrix),Ae(K,w,Ee)};function Ae(K,he,Re){Re===null?K.matrix.copy(he.matrixWorld):(K.matrix.copy(Re.matrixWorld),K.matrix.invert(),K.matrix.multiply(he.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(he.projectionMatrix),K.projectionMatrixInverse.copy(he.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=pl*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return w},this.getFoveation=function(){if(!(S===null&&M===null))return p},this.setFoveation=function(K){p=K,S!==null&&(S.fixedFoveation=K),M!==null&&M.fixedFoveation!==void 0&&(M.fixedFoveation=K)},this.hasDepthSensing=function(){return R.texture!==null},this.getDepthSensingMesh=function(){return R.getMesh(w)};let O=null;function se(K,he){if(_=he.getViewerPose(m||d),T=he,_!==null){const Re=_.views;M!==null&&(e.setRenderTargetFramebuffer(B,M.framebuffer),e.setRenderTarget(B));let Ee=!1;Re.length!==w.cameras.length&&(w.cameras.length=0,Ee=!0);for(let $e=0;$e<Re.length;$e++){const zt=Re[$e];let It=null;if(M!==null)It=M.getViewport(zt);else{const H=x.getViewSubImage(S,zt);It=H.viewport,$e===0&&(e.setRenderTargetTextures(B,H.colorTexture,H.depthStencilTexture),e.setRenderTarget(B))}let _t=D[$e];_t===void 0&&(_t=new Mi,_t.layers.enable($e),_t.viewport=new cn,D[$e]=_t),_t.matrix.fromArray(zt.transform.matrix),_t.matrix.decompose(_t.position,_t.quaternion,_t.scale),_t.projectionMatrix.fromArray(zt.projectionMatrix),_t.projectionMatrixInverse.copy(_t.projectionMatrix).invert(),_t.viewport.set(It.x,It.y,It.width,It.height),$e===0&&(w.matrix.copy(_t.matrix),w.matrix.decompose(w.position,w.quaternion,w.scale)),Ee===!0&&w.cameras.push(_t)}const ze=l.enabledFeatures;if(ze&&ze.includes("depth-sensing")&&l.depthUsage=="gpu-optimized"&&x){const $e=x.getDepthInformation(Re[0]);$e&&$e.isValid&&$e.texture&&R.init(e,$e,l.renderState)}}for(let Re=0;Re<L.length;Re++){const Ee=N[Re],ze=L[Re];Ee!==null&&ze!==void 0&&ze.update(Ee,he,m||d)}O&&O(K,he),he.detectedPlanes&&s.dispatchEvent({type:"planesdetected",data:he}),T=null}const Me=new x0;Me.setAnimationLoop(se),this.setAnimationLoop=function(K){O=K},this.dispose=function(){}}}const Fs=new Zi,LA=new sn;function OA(r,e){function i(E,v){E.matrixAutoUpdate===!0&&E.updateMatrix(),v.value.copy(E.matrix)}function s(E,v){v.color.getRGB(E.fogColor.value,d0(r)),v.isFog?(E.fogNear.value=v.near,E.fogFar.value=v.far):v.isFogExp2&&(E.fogDensity.value=v.density)}function l(E,v,B,L,N){v.isMeshBasicMaterial||v.isMeshLambertMaterial?c(E,v):v.isMeshToonMaterial?(c(E,v),x(E,v)):v.isMeshPhongMaterial?(c(E,v),_(E,v)):v.isMeshStandardMaterial?(c(E,v),S(E,v),v.isMeshPhysicalMaterial&&M(E,v,N)):v.isMeshMatcapMaterial?(c(E,v),T(E,v)):v.isMeshDepthMaterial?c(E,v):v.isMeshDistanceMaterial?(c(E,v),R(E,v)):v.isMeshNormalMaterial?c(E,v):v.isLineBasicMaterial?(d(E,v),v.isLineDashedMaterial&&h(E,v)):v.isPointsMaterial?p(E,v,B,L):v.isSpriteMaterial?m(E,v):v.isShadowMaterial?(E.color.value.copy(v.color),E.opacity.value=v.opacity):v.isShaderMaterial&&(v.uniformsNeedUpdate=!1)}function c(E,v){E.opacity.value=v.opacity,v.color&&E.diffuse.value.copy(v.color),v.emissive&&E.emissive.value.copy(v.emissive).multiplyScalar(v.emissiveIntensity),v.map&&(E.map.value=v.map,i(v.map,E.mapTransform)),v.alphaMap&&(E.alphaMap.value=v.alphaMap,i(v.alphaMap,E.alphaMapTransform)),v.bumpMap&&(E.bumpMap.value=v.bumpMap,i(v.bumpMap,E.bumpMapTransform),E.bumpScale.value=v.bumpScale,v.side===Kn&&(E.bumpScale.value*=-1)),v.normalMap&&(E.normalMap.value=v.normalMap,i(v.normalMap,E.normalMapTransform),E.normalScale.value.copy(v.normalScale),v.side===Kn&&E.normalScale.value.negate()),v.displacementMap&&(E.displacementMap.value=v.displacementMap,i(v.displacementMap,E.displacementMapTransform),E.displacementScale.value=v.displacementScale,E.displacementBias.value=v.displacementBias),v.emissiveMap&&(E.emissiveMap.value=v.emissiveMap,i(v.emissiveMap,E.emissiveMapTransform)),v.specularMap&&(E.specularMap.value=v.specularMap,i(v.specularMap,E.specularMapTransform)),v.alphaTest>0&&(E.alphaTest.value=v.alphaTest);const B=e.get(v),L=B.envMap,N=B.envMapRotation;L&&(E.envMap.value=L,Fs.copy(N),Fs.x*=-1,Fs.y*=-1,Fs.z*=-1,L.isCubeTexture&&L.isRenderTargetTexture===!1&&(Fs.y*=-1,Fs.z*=-1),E.envMapRotation.value.setFromMatrix4(LA.makeRotationFromEuler(Fs)),E.flipEnvMap.value=L.isCubeTexture&&L.isRenderTargetTexture===!1?-1:1,E.reflectivity.value=v.reflectivity,E.ior.value=v.ior,E.refractionRatio.value=v.refractionRatio),v.lightMap&&(E.lightMap.value=v.lightMap,E.lightMapIntensity.value=v.lightMapIntensity,i(v.lightMap,E.lightMapTransform)),v.aoMap&&(E.aoMap.value=v.aoMap,E.aoMapIntensity.value=v.aoMapIntensity,i(v.aoMap,E.aoMapTransform))}function d(E,v){E.diffuse.value.copy(v.color),E.opacity.value=v.opacity,v.map&&(E.map.value=v.map,i(v.map,E.mapTransform))}function h(E,v){E.dashSize.value=v.dashSize,E.totalSize.value=v.dashSize+v.gapSize,E.scale.value=v.scale}function p(E,v,B,L){E.diffuse.value.copy(v.color),E.opacity.value=v.opacity,E.size.value=v.size*B,E.scale.value=L*.5,v.map&&(E.map.value=v.map,i(v.map,E.uvTransform)),v.alphaMap&&(E.alphaMap.value=v.alphaMap,i(v.alphaMap,E.alphaMapTransform)),v.alphaTest>0&&(E.alphaTest.value=v.alphaTest)}function m(E,v){E.diffuse.value.copy(v.color),E.opacity.value=v.opacity,E.rotation.value=v.rotation,v.map&&(E.map.value=v.map,i(v.map,E.mapTransform)),v.alphaMap&&(E.alphaMap.value=v.alphaMap,i(v.alphaMap,E.alphaMapTransform)),v.alphaTest>0&&(E.alphaTest.value=v.alphaTest)}function _(E,v){E.specular.value.copy(v.specular),E.shininess.value=Math.max(v.shininess,1e-4)}function x(E,v){v.gradientMap&&(E.gradientMap.value=v.gradientMap)}function S(E,v){E.metalness.value=v.metalness,v.metalnessMap&&(E.metalnessMap.value=v.metalnessMap,i(v.metalnessMap,E.metalnessMapTransform)),E.roughness.value=v.roughness,v.roughnessMap&&(E.roughnessMap.value=v.roughnessMap,i(v.roughnessMap,E.roughnessMapTransform)),v.envMap&&(E.envMapIntensity.value=v.envMapIntensity)}function M(E,v,B){E.ior.value=v.ior,v.sheen>0&&(E.sheenColor.value.copy(v.sheenColor).multiplyScalar(v.sheen),E.sheenRoughness.value=v.sheenRoughness,v.sheenColorMap&&(E.sheenColorMap.value=v.sheenColorMap,i(v.sheenColorMap,E.sheenColorMapTransform)),v.sheenRoughnessMap&&(E.sheenRoughnessMap.value=v.sheenRoughnessMap,i(v.sheenRoughnessMap,E.sheenRoughnessMapTransform))),v.clearcoat>0&&(E.clearcoat.value=v.clearcoat,E.clearcoatRoughness.value=v.clearcoatRoughness,v.clearcoatMap&&(E.clearcoatMap.value=v.clearcoatMap,i(v.clearcoatMap,E.clearcoatMapTransform)),v.clearcoatRoughnessMap&&(E.clearcoatRoughnessMap.value=v.clearcoatRoughnessMap,i(v.clearcoatRoughnessMap,E.clearcoatRoughnessMapTransform)),v.clearcoatNormalMap&&(E.clearcoatNormalMap.value=v.clearcoatNormalMap,i(v.clearcoatNormalMap,E.clearcoatNormalMapTransform),E.clearcoatNormalScale.value.copy(v.clearcoatNormalScale),v.side===Kn&&E.clearcoatNormalScale.value.negate())),v.dispersion>0&&(E.dispersion.value=v.dispersion),v.iridescence>0&&(E.iridescence.value=v.iridescence,E.iridescenceIOR.value=v.iridescenceIOR,E.iridescenceThicknessMinimum.value=v.iridescenceThicknessRange[0],E.iridescenceThicknessMaximum.value=v.iridescenceThicknessRange[1],v.iridescenceMap&&(E.iridescenceMap.value=v.iridescenceMap,i(v.iridescenceMap,E.iridescenceMapTransform)),v.iridescenceThicknessMap&&(E.iridescenceThicknessMap.value=v.iridescenceThicknessMap,i(v.iridescenceThicknessMap,E.iridescenceThicknessMapTransform))),v.transmission>0&&(E.transmission.value=v.transmission,E.transmissionSamplerMap.value=B.texture,E.transmissionSamplerSize.value.set(B.width,B.height),v.transmissionMap&&(E.transmissionMap.value=v.transmissionMap,i(v.transmissionMap,E.transmissionMapTransform)),E.thickness.value=v.thickness,v.thicknessMap&&(E.thicknessMap.value=v.thicknessMap,i(v.thicknessMap,E.thicknessMapTransform)),E.attenuationDistance.value=v.attenuationDistance,E.attenuationColor.value.copy(v.attenuationColor)),v.anisotropy>0&&(E.anisotropyVector.value.set(v.anisotropy*Math.cos(v.anisotropyRotation),v.anisotropy*Math.sin(v.anisotropyRotation)),v.anisotropyMap&&(E.anisotropyMap.value=v.anisotropyMap,i(v.anisotropyMap,E.anisotropyMapTransform))),E.specularIntensity.value=v.specularIntensity,E.specularColor.value.copy(v.specularColor),v.specularColorMap&&(E.specularColorMap.value=v.specularColorMap,i(v.specularColorMap,E.specularColorMapTransform)),v.specularIntensityMap&&(E.specularIntensityMap.value=v.specularIntensityMap,i(v.specularIntensityMap,E.specularIntensityMapTransform))}function T(E,v){v.matcap&&(E.matcap.value=v.matcap)}function R(E,v){const B=e.get(v).light;E.referencePosition.value.setFromMatrixPosition(B.matrixWorld),E.nearDistance.value=B.shadow.camera.near,E.farDistance.value=B.shadow.camera.far}return{refreshFogUniforms:s,refreshMaterialUniforms:l}}function PA(r,e,i,s){let l={},c={},d=[];const h=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function p(B,L){const N=L.program;s.uniformBlockBinding(B,N)}function m(B,L){let N=l[B.id];N===void 0&&(T(B),N=_(B),l[B.id]=N,B.addEventListener("dispose",E));const W=L.program;s.updateUBOMapping(B,W);const G=e.render.frame;c[B.id]!==G&&(S(B),c[B.id]=G)}function _(B){const L=x();B.__bindingPointIndex=L;const N=r.createBuffer(),W=B.__size,G=B.usage;return r.bindBuffer(r.UNIFORM_BUFFER,N),r.bufferData(r.UNIFORM_BUFFER,W,G),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,L,N),N}function x(){for(let B=0;B<h;B++)if(d.indexOf(B)===-1)return d.push(B),B;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function S(B){const L=l[B.id],N=B.uniforms,W=B.__cache;r.bindBuffer(r.UNIFORM_BUFFER,L);for(let G=0,z=N.length;G<z;G++){const J=Array.isArray(N[G])?N[G]:[N[G]];for(let D=0,w=J.length;D<w;D++){const k=J[D];if(M(k,G,D,W)===!0){const ue=k.__offset,q=Array.isArray(k.value)?k.value:[k.value];let le=0;for(let _e=0;_e<q.length;_e++){const U=q[_e],$=R(U);typeof U=="number"||typeof U=="boolean"?(k.__data[0]=U,r.bufferSubData(r.UNIFORM_BUFFER,ue+le,k.__data)):U.isMatrix3?(k.__data[0]=U.elements[0],k.__data[1]=U.elements[1],k.__data[2]=U.elements[2],k.__data[3]=0,k.__data[4]=U.elements[3],k.__data[5]=U.elements[4],k.__data[6]=U.elements[5],k.__data[7]=0,k.__data[8]=U.elements[6],k.__data[9]=U.elements[7],k.__data[10]=U.elements[8],k.__data[11]=0):(U.toArray(k.__data,le),le+=$.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,ue,k.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function M(B,L,N,W){const G=B.value,z=L+"_"+N;if(W[z]===void 0)return typeof G=="number"||typeof G=="boolean"?W[z]=G:W[z]=G.clone(),!0;{const J=W[z];if(typeof G=="number"||typeof G=="boolean"){if(J!==G)return W[z]=G,!0}else if(J.equals(G)===!1)return J.copy(G),!0}return!1}function T(B){const L=B.uniforms;let N=0;const W=16;for(let z=0,J=L.length;z<J;z++){const D=Array.isArray(L[z])?L[z]:[L[z]];for(let w=0,k=D.length;w<k;w++){const ue=D[w],q=Array.isArray(ue.value)?ue.value:[ue.value];for(let le=0,_e=q.length;le<_e;le++){const U=q[le],$=R(U),Z=N%W,xe=Z%$.boundary,Ae=Z+xe;N+=xe,Ae!==0&&W-Ae<$.storage&&(N+=W-Ae),ue.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),ue.__offset=N,N+=$.storage}}}const G=N%W;return G>0&&(N+=W-G),B.__size=N,B.__cache={},this}function R(B){const L={boundary:0,storage:0};return typeof B=="number"||typeof B=="boolean"?(L.boundary=4,L.storage=4):B.isVector2?(L.boundary=8,L.storage=8):B.isVector3||B.isColor?(L.boundary=16,L.storage=12):B.isVector4?(L.boundary=16,L.storage=16):B.isMatrix3?(L.boundary=48,L.storage=48):B.isMatrix4?(L.boundary=64,L.storage=64):B.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",B),L}function E(B){const L=B.target;L.removeEventListener("dispose",E);const N=d.indexOf(L.__bindingPointIndex);d.splice(N,1),r.deleteBuffer(l[L.id]),delete l[L.id],delete c[L.id]}function v(){for(const B in l)r.deleteBuffer(l[B]);d=[],l={},c={}}return{bind:p,update:m,dispose:v}}class BA{constructor(e={}){const{canvas:i=iM(),context:s=null,depth:l=!0,stencil:c=!1,alpha:d=!1,antialias:h=!1,premultipliedAlpha:p=!0,preserveDrawingBuffer:m=!1,powerPreference:_="default",failIfMajorPerformanceCaveat:x=!1,reverseDepthBuffer:S=!1}=e;this.isWebGLRenderer=!0;let M;if(s!==null){if(typeof WebGLRenderingContext<"u"&&s instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");M=s.getContextAttributes().alpha}else M=d;const T=new Uint32Array(4),R=new Int32Array(4);let E=null,v=null;const B=[],L=[];this.domElement=i,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=os,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const N=this;let W=!1;this._outputColorSpace=ci;let G=0,z=0,J=null,D=-1,w=null;const k=new cn,ue=new cn;let q=null;const le=new mt(0);let _e=0,U=i.width,$=i.height,Z=1,xe=null,Ae=null;const O=new cn(0,0,U,$),se=new cn(0,0,U,$);let Me=!1;const K=new Vh;let he=!1,Re=!1;const Ee=new sn,ze=new sn,Je=new ae,$e=new cn,zt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let It=!1;function _t(){return J===null?Z:1}let H=s;function un(C,Y){return i.getContext(C,Y)}try{const C={alpha:!0,depth:l,stencil:c,antialias:h,premultipliedAlpha:p,preserveDrawingBuffer:m,powerPreference:_,failIfMajorPerformanceCaveat:x};if("setAttribute"in i&&i.setAttribute("data-engine",`three.js r${Lh}`),i.addEventListener("webglcontextlost",Ie,!1),i.addEventListener("webglcontextrestored",Te,!1),i.addEventListener("webglcontextcreationerror",ge,!1),H===null){const Y="webgl2";if(H=un(Y,C),H===null)throw un(Y)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let xt,Ft,ke,gt,Qe,rt,an,P,b,ne,me,ye,fe,We,Ue,je,qe,Se,Ne,Ye,Ge,Le,at,j;function De(){xt=new WT(H),xt.init(),Le=new CA(H,xt),Ft=new FT(H,xt,e,Le),ke=new AA(H,xt),Ft.reverseDepthBuffer&&S&&ke.buffers.depth.setReversed(!0),gt=new ZT(H),Qe=new hA,rt=new RA(H,xt,ke,Qe,Ft,Le,gt),an=new GT(N),P=new XT(N),b=new tE(H),at=new zT(H,b),ne=new qT(H,b,gt,at),me=new QT(H,ne,b,gt),Ne=new KT(H,Ft,rt),je=new HT(Qe),ye=new dA(N,an,P,xt,Ft,at,je),fe=new OA(N,Qe),We=new mA,Ue=new SA(xt),Se=new BT(N,an,P,ke,me,M,p),qe=new bA(N,me,Ft),j=new PA(H,gt,Ft,ke),Ye=new IT(H,xt,gt),Ge=new YT(H,xt,gt),gt.programs=ye.programs,N.capabilities=Ft,N.extensions=xt,N.properties=Qe,N.renderLists=We,N.shadowMap=qe,N.state=ke,N.info=gt}De();const be=new UA(N,H);this.xr=be,this.getContext=function(){return H},this.getContextAttributes=function(){return H.getContextAttributes()},this.forceContextLoss=function(){const C=xt.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){const C=xt.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(C){C!==void 0&&(Z=C,this.setSize(U,$,!1))},this.getSize=function(C){return C.set(U,$)},this.setSize=function(C,Y,re=!0){if(be.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}U=C,$=Y,i.width=Math.floor(C*Z),i.height=Math.floor(Y*Z),re===!0&&(i.style.width=C+"px",i.style.height=Y+"px"),this.setViewport(0,0,C,Y)},this.getDrawingBufferSize=function(C){return C.set(U*Z,$*Z).floor()},this.setDrawingBufferSize=function(C,Y,re){U=C,$=Y,Z=re,i.width=Math.floor(C*re),i.height=Math.floor(Y*re),this.setViewport(0,0,C,Y)},this.getCurrentViewport=function(C){return C.copy(k)},this.getViewport=function(C){return C.copy(O)},this.setViewport=function(C,Y,re,oe){C.isVector4?O.set(C.x,C.y,C.z,C.w):O.set(C,Y,re,oe),ke.viewport(k.copy(O).multiplyScalar(Z).round())},this.getScissor=function(C){return C.copy(se)},this.setScissor=function(C,Y,re,oe){C.isVector4?se.set(C.x,C.y,C.z,C.w):se.set(C,Y,re,oe),ke.scissor(ue.copy(se).multiplyScalar(Z).round())},this.getScissorTest=function(){return Me},this.setScissorTest=function(C){ke.setScissorTest(Me=C)},this.setOpaqueSort=function(C){xe=C},this.setTransparentSort=function(C){Ae=C},this.getClearColor=function(C){return C.copy(Se.getClearColor())},this.setClearColor=function(){Se.setClearColor(...arguments)},this.getClearAlpha=function(){return Se.getClearAlpha()},this.setClearAlpha=function(){Se.setClearAlpha(...arguments)},this.clear=function(C=!0,Y=!0,re=!0){let oe=0;if(C){let X=!1;if(J!==null){const Ce=J.texture.format;X=Ce===Fh||Ce===Ih||Ce===zh}if(X){const Ce=J.texture.type,Oe=Ce===Yi||Ce===Ws||Ce===ul||Ce===fl||Ce===Ph||Ce===Bh,Fe=Se.getClearColor(),Be=Se.getClearAlpha(),it=Fe.r,tt=Fe.g,Ze=Fe.b;Oe?(T[0]=it,T[1]=tt,T[2]=Ze,T[3]=Be,H.clearBufferuiv(H.COLOR,0,T)):(R[0]=it,R[1]=tt,R[2]=Ze,R[3]=Be,H.clearBufferiv(H.COLOR,0,R))}else oe|=H.COLOR_BUFFER_BIT}Y&&(oe|=H.DEPTH_BUFFER_BIT),re&&(oe|=H.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),H.clear(oe)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){i.removeEventListener("webglcontextlost",Ie,!1),i.removeEventListener("webglcontextrestored",Te,!1),i.removeEventListener("webglcontextcreationerror",ge,!1),Se.dispose(),We.dispose(),Ue.dispose(),Qe.dispose(),an.dispose(),P.dispose(),me.dispose(),at.dispose(),j.dispose(),ye.dispose(),be.dispose(),be.removeEventListener("sessionstart",us),be.removeEventListener("sessionend",Ra),ui.stop()};function Ie(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),W=!0}function Te(){console.log("THREE.WebGLRenderer: Context Restored."),W=!1;const C=gt.autoReset,Y=qe.enabled,re=qe.autoUpdate,oe=qe.needsUpdate,X=qe.type;De(),gt.autoReset=C,qe.enabled=Y,qe.autoUpdate=re,qe.needsUpdate=oe,qe.type=X}function ge(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function He(C){const Y=C.target;Y.removeEventListener("dispose",He),st(Y)}function st(C){Ht(C),Qe.remove(C)}function Ht(C){const Y=Qe.get(C).programs;Y!==void 0&&(Y.forEach(function(re){ye.releaseProgram(re)}),C.isShaderMaterial&&ye.releaseShaderCache(C))}this.renderBufferDirect=function(C,Y,re,oe,X,Ce){Y===null&&(Y=zt);const Oe=X.isMesh&&X.matrixWorld.determinant()<0,Fe=wa(C,Y,re,oe,X);ke.setMaterial(oe,Oe);let Be=re.index,it=1;if(oe.wireframe===!0){if(Be=ne.getWireframeAttribute(re),Be===void 0)return;it=2}const tt=re.drawRange,Ze=re.attributes.position;let ut=tt.start*it,Rt=(tt.start+tt.count)*it;Ce!==null&&(ut=Math.max(ut,Ce.start*it),Rt=Math.min(Rt,(Ce.start+Ce.count)*it)),Be!==null?(ut=Math.max(ut,0),Rt=Math.min(Rt,Be.count)):Ze!=null&&(ut=Math.max(ut,0),Rt=Math.min(Rt,Ze.count));const Gt=Rt-ut;if(Gt<0||Gt===1/0)return;at.setup(X,oe,Fe,re,Be);let yt,ot=Ye;if(Be!==null&&(yt=b.get(Be),ot=Ge,ot.setIndex(yt)),X.isMesh)oe.wireframe===!0?(ke.setLineWidth(oe.wireframeLinewidth*_t()),ot.setMode(H.LINES)):ot.setMode(H.TRIANGLES);else if(X.isLine){let Ke=oe.linewidth;Ke===void 0&&(Ke=1),ke.setLineWidth(Ke*_t()),X.isLineSegments?ot.setMode(H.LINES):X.isLineLoop?ot.setMode(H.LINE_LOOP):ot.setMode(H.LINE_STRIP)}else X.isPoints?ot.setMode(H.POINTS):X.isSprite&&ot.setMode(H.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)qr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ot.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(xt.get("WEBGL_multi_draw"))ot.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{const Ke=X._multiDrawStarts,Xt=X._multiDrawCounts,vt=X._multiDrawCount,Tn=Be?b.get(Be).bytesPerElement:1,Jn=Qe.get(oe).currentProgram.getUniforms();for(let Cn=0;Cn<vt;Cn++)Jn.setValue(H,"_gl_DrawID",Cn),ot.render(Ke[Cn]/Tn,Xt[Cn])}else if(X.isInstancedMesh)ot.renderInstances(ut,Gt,X.count);else if(re.isInstancedBufferGeometry){const Ke=re._maxInstanceCount!==void 0?re._maxInstanceCount:1/0,Xt=Math.min(re.instanceCount,Ke);ot.renderInstances(ut,Gt,Xt)}else ot.render(ut,Gt)};function Et(C,Y,re){C.transparent===!0&&C.side===Ea&&C.forceSinglePass===!1?(C.side=Kn,C.needsUpdate=!0,tn(C,Y,re),C.side=ls,C.needsUpdate=!0,tn(C,Y,re),C.side=Ea):tn(C,Y,re)}this.compile=function(C,Y,re=null){re===null&&(re=C),v=Ue.get(re),v.init(Y),L.push(v),re.traverseVisible(function(X){X.isLight&&X.layers.test(Y.layers)&&(v.pushLight(X),X.castShadow&&v.pushShadow(X))}),C!==re&&C.traverseVisible(function(X){X.isLight&&X.layers.test(Y.layers)&&(v.pushLight(X),X.castShadow&&v.pushShadow(X))}),v.setupLights();const oe=new Set;return C.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;const Ce=X.material;if(Ce)if(Array.isArray(Ce))for(let Oe=0;Oe<Ce.length;Oe++){const Fe=Ce[Oe];Et(Fe,re,X),oe.add(Fe)}else Et(Ce,re,X),oe.add(Ce)}),v=L.pop(),oe},this.compileAsync=function(C,Y,re=null){const oe=this.compile(C,Y,re);return new Promise(X=>{function Ce(){if(oe.forEach(function(Oe){Qe.get(Oe).currentProgram.isReady()&&oe.delete(Oe)}),oe.size===0){X(C);return}setTimeout(Ce,10)}xt.get("KHR_parallel_shader_compile")!==null?Ce():setTimeout(Ce,10)})};let yn=null;function Qn(C){yn&&yn(C)}function us(){ui.stop()}function Ra(){ui.start()}const ui=new x0;ui.setAnimationLoop(Qn),typeof self<"u"&&ui.setContext(self),this.setAnimationLoop=function(C){yn=C,be.setAnimationLoop(C),C===null?ui.stop():ui.start()},be.addEventListener("sessionstart",us),be.addEventListener("sessionend",Ra),this.render=function(C,Y){if(Y!==void 0&&Y.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(W===!0)return;if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),Y.parent===null&&Y.matrixWorldAutoUpdate===!0&&Y.updateMatrixWorld(),be.enabled===!0&&be.isPresenting===!0&&(be.cameraAutoUpdate===!0&&be.updateCamera(Y),Y=be.getCamera()),C.isScene===!0&&C.onBeforeRender(N,C,Y,J),v=Ue.get(C,L.length),v.init(Y),L.push(v),ze.multiplyMatrices(Y.projectionMatrix,Y.matrixWorldInverse),K.setFromProjectionMatrix(ze),Re=this.localClippingEnabled,he=je.init(this.clippingPlanes,Re),E=We.get(C,B.length),E.init(),B.push(E),be.enabled===!0&&be.isPresenting===!0){const Ce=N.xr.getDepthSensingMesh();Ce!==null&&Ii(Ce,Y,-1/0,N.sortObjects)}Ii(C,Y,0,N.sortObjects),E.finish(),N.sortObjects===!0&&E.sort(xe,Ae),It=be.enabled===!1||be.isPresenting===!1||be.hasDepthSensing()===!1,It&&Se.addToRenderList(E,C),this.info.render.frame++,he===!0&&je.beginShadows();const re=v.state.shadowsArray;qe.render(re,C,Y),he===!0&&je.endShadows(),this.info.autoReset===!0&&this.info.reset();const oe=E.opaque,X=E.transmissive;if(v.setupLights(),Y.isArrayCamera){const Ce=Y.cameras;if(X.length>0)for(let Oe=0,Fe=Ce.length;Oe<Fe;Oe++){const Be=Ce[Oe];fs(oe,X,C,Be)}It&&Se.render(C);for(let Oe=0,Fe=Ce.length;Oe<Fe;Oe++){const Be=Ce[Oe];Ca(E,C,Be,Be.viewport)}}else X.length>0&&fs(oe,X,C,Y),It&&Se.render(C),Ca(E,C,Y);J!==null&&z===0&&(rt.updateMultisampleRenderTarget(J),rt.updateRenderTargetMipmap(J)),C.isScene===!0&&C.onAfterRender(N,C,Y),at.resetDefaultState(),D=-1,w=null,L.pop(),L.length>0?(v=L[L.length-1],he===!0&&je.setGlobalState(N.clippingPlanes,v.state.camera)):v=null,B.pop(),B.length>0?E=B[B.length-1]:E=null};function Ii(C,Y,re,oe){if(C.visible===!1)return;if(C.layers.test(Y.layers)){if(C.isGroup)re=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(Y);else if(C.isLight)v.pushLight(C),C.castShadow&&v.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||K.intersectsSprite(C)){oe&&$e.setFromMatrixPosition(C.matrixWorld).applyMatrix4(ze);const Oe=me.update(C),Fe=C.material;Fe.visible&&E.push(C,Oe,Fe,re,$e.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||K.intersectsObject(C))){const Oe=me.update(C),Fe=C.material;if(oe&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),$e.copy(C.boundingSphere.center)):(Oe.boundingSphere===null&&Oe.computeBoundingSphere(),$e.copy(Oe.boundingSphere.center)),$e.applyMatrix4(C.matrixWorld).applyMatrix4(ze)),Array.isArray(Fe)){const Be=Oe.groups;for(let it=0,tt=Be.length;it<tt;it++){const Ze=Be[it],ut=Fe[Ze.materialIndex];ut&&ut.visible&&E.push(C,Oe,ut,re,$e.z,Ze)}}else Fe.visible&&E.push(C,Oe,Fe,re,$e.z,null)}}const Ce=C.children;for(let Oe=0,Fe=Ce.length;Oe<Fe;Oe++)Ii(Ce[Oe],Y,re,oe)}function Ca(C,Y,re,oe){const X=C.opaque,Ce=C.transmissive,Oe=C.transparent;v.setupLightsView(re),he===!0&&je.setGlobalState(N.clippingPlanes,re),oe&&ke.viewport(k.copy(oe)),X.length>0&&Ki(X,Y,re),Ce.length>0&&Ki(Ce,Y,re),Oe.length>0&&Ki(Oe,Y,re),ke.buffers.depth.setTest(!0),ke.buffers.depth.setMask(!0),ke.buffers.color.setMask(!0),ke.setPolygonOffset(!1)}function fs(C,Y,re,oe){if((re.isScene===!0?re.overrideMaterial:null)!==null)return;v.state.transmissionRenderTarget[oe.id]===void 0&&(v.state.transmissionRenderTarget[oe.id]=new qs(1,1,{generateMipmaps:!0,type:xt.has("EXT_color_buffer_half_float")||xt.has("EXT_color_buffer_float")?ml:Yi,minFilter:Xs,samples:4,stencilBuffer:c,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ut.workingColorSpace}));const Ce=v.state.transmissionRenderTarget[oe.id],Oe=oe.viewport||k;Ce.setSize(Oe.z*N.transmissionResolutionScale,Oe.w*N.transmissionResolutionScale);const Fe=N.getRenderTarget(),Be=N.getActiveCubeFace(),it=N.getActiveMipmapLevel();N.setRenderTarget(Ce),N.getClearColor(le),_e=N.getClearAlpha(),_e<1&&N.setClearColor(16777215,.5),N.clear(),It&&Se.render(re);const tt=N.toneMapping;N.toneMapping=os;const Ze=oe.viewport;if(oe.viewport!==void 0&&(oe.viewport=void 0),v.setupLightsView(oe),he===!0&&je.setGlobalState(N.clippingPlanes,oe),Ki(C,re,oe),rt.updateMultisampleRenderTarget(Ce),rt.updateRenderTargetMipmap(Ce),xt.has("WEBGL_multisampled_render_to_texture")===!1){let ut=!1;for(let Rt=0,Gt=Y.length;Rt<Gt;Rt++){const yt=Y[Rt],ot=yt.object,Ke=yt.geometry,Xt=yt.material,vt=yt.group;if(Xt.side===Ea&&ot.layers.test(oe.layers)){const Tn=Xt.side;Xt.side=Kn,Xt.needsUpdate=!0,kn(ot,re,oe,Ke,Xt,vt),Xt.side=Tn,Xt.needsUpdate=!0,ut=!0}}ut===!0&&(rt.updateMultisampleRenderTarget(Ce),rt.updateRenderTargetMipmap(Ce))}N.setRenderTarget(Fe,Be,it),N.setClearColor(le,_e),Ze!==void 0&&(oe.viewport=Ze),N.toneMapping=tt}function Ki(C,Y,re){const oe=Y.isScene===!0?Y.overrideMaterial:null;for(let X=0,Ce=C.length;X<Ce;X++){const Oe=C[X],Fe=Oe.object,Be=Oe.geometry,it=Oe.group;let tt=Oe.material;tt.allowOverride===!0&&oe!==null&&(tt=oe),Fe.layers.test(re.layers)&&kn(Fe,Y,re,Be,tt,it)}}function kn(C,Y,re,oe,X,Ce){C.onBeforeRender(N,Y,re,oe,X,Ce),C.modelViewMatrix.multiplyMatrices(re.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),X.onBeforeRender(N,Y,re,oe,C,Ce),X.transparent===!0&&X.side===Ea&&X.forceSinglePass===!1?(X.side=Kn,X.needsUpdate=!0,N.renderBufferDirect(re,Y,oe,X,C,Ce),X.side=ls,X.needsUpdate=!0,N.renderBufferDirect(re,Y,oe,X,C,Ce),X.side=Ea):N.renderBufferDirect(re,Y,oe,X,C,Ce),C.onAfterRender(N,Y,re,oe,X,Ce)}function tn(C,Y,re){Y.isScene!==!0&&(Y=zt);const oe=Qe.get(C),X=v.state.lights,Ce=v.state.shadowsArray,Oe=X.state.version,Fe=ye.getParameters(C,X.state,Ce,Y,re),Be=ye.getProgramCacheKey(Fe);let it=oe.programs;oe.environment=C.isMeshStandardMaterial?Y.environment:null,oe.fog=Y.fog,oe.envMap=(C.isMeshStandardMaterial?P:an).get(C.envMap||oe.environment),oe.envMapRotation=oe.environment!==null&&C.envMap===null?Y.environmentRotation:C.envMapRotation,it===void 0&&(C.addEventListener("dispose",He),it=new Map,oe.programs=it);let tt=it.get(Be);if(tt!==void 0){if(oe.currentProgram===tt&&oe.lightsStateVersion===Oe)return Ei(C,Fe),tt}else Fe.uniforms=ye.getUniforms(C),C.onBeforeCompile(Fe,N),tt=ye.acquireProgram(Fe,Be),it.set(Be,tt),oe.uniforms=Fe.uniforms;const Ze=oe.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(Ze.clippingPlanes=je.uniform),Ei(C,Fe),oe.needsLights=ro(C),oe.lightsStateVersion=Oe,oe.needsLights&&(Ze.ambientLightColor.value=X.state.ambient,Ze.lightProbe.value=X.state.probe,Ze.directionalLights.value=X.state.directional,Ze.directionalLightShadows.value=X.state.directionalShadow,Ze.spotLights.value=X.state.spot,Ze.spotLightShadows.value=X.state.spotShadow,Ze.rectAreaLights.value=X.state.rectArea,Ze.ltc_1.value=X.state.rectAreaLTC1,Ze.ltc_2.value=X.state.rectAreaLTC2,Ze.pointLights.value=X.state.point,Ze.pointLightShadows.value=X.state.pointShadow,Ze.hemisphereLights.value=X.state.hemi,Ze.directionalShadowMap.value=X.state.directionalShadowMap,Ze.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Ze.spotShadowMap.value=X.state.spotShadowMap,Ze.spotLightMatrix.value=X.state.spotLightMatrix,Ze.spotLightMap.value=X.state.spotLightMap,Ze.pointShadowMap.value=X.state.pointShadowMap,Ze.pointShadowMatrix.value=X.state.pointShadowMatrix),oe.currentProgram=tt,oe.uniformsList=null,tt}function Sn(C){if(C.uniformsList===null){const Y=C.currentProgram.getUniforms();C.uniformsList=Jc.seqWithValue(Y.seq,C.uniforms)}return C.uniformsList}function Ei(C,Y){const re=Qe.get(C);re.outputColorSpace=Y.outputColorSpace,re.batching=Y.batching,re.batchingColor=Y.batchingColor,re.instancing=Y.instancing,re.instancingColor=Y.instancingColor,re.instancingMorph=Y.instancingMorph,re.skinning=Y.skinning,re.morphTargets=Y.morphTargets,re.morphNormals=Y.morphNormals,re.morphColors=Y.morphColors,re.morphTargetsCount=Y.morphTargetsCount,re.numClippingPlanes=Y.numClippingPlanes,re.numIntersection=Y.numClipIntersection,re.vertexAlphas=Y.vertexAlphas,re.vertexTangents=Y.vertexTangents,re.toneMapping=Y.toneMapping}function wa(C,Y,re,oe,X){Y.isScene!==!0&&(Y=zt),rt.resetTextureUnits();const Ce=Y.fog,Oe=oe.isMeshStandardMaterial?Y.environment:null,Fe=J===null?N.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:Jr,Be=(oe.isMeshStandardMaterial?P:an).get(oe.envMap||Oe),it=oe.vertexColors===!0&&!!re.attributes.color&&re.attributes.color.itemSize===4,tt=!!re.attributes.tangent&&(!!oe.normalMap||oe.anisotropy>0),Ze=!!re.morphAttributes.position,ut=!!re.morphAttributes.normal,Rt=!!re.morphAttributes.color;let Gt=os;oe.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(Gt=N.toneMapping);const yt=re.morphAttributes.position||re.morphAttributes.normal||re.morphAttributes.color,ot=yt!==void 0?yt.length:0,Ke=Qe.get(oe),Xt=v.state.lights;if(he===!0&&(Re===!0||C!==w)){const Ot=C===w&&oe.id===D;je.setState(oe,C,Ot)}let vt=!1;oe.version===Ke.__version?(Ke.needsLights&&Ke.lightsStateVersion!==Xt.state.version||Ke.outputColorSpace!==Fe||X.isBatchedMesh&&Ke.batching===!1||!X.isBatchedMesh&&Ke.batching===!0||X.isBatchedMesh&&Ke.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&Ke.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&Ke.instancing===!1||!X.isInstancedMesh&&Ke.instancing===!0||X.isSkinnedMesh&&Ke.skinning===!1||!X.isSkinnedMesh&&Ke.skinning===!0||X.isInstancedMesh&&Ke.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Ke.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Ke.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Ke.instancingMorph===!1&&X.morphTexture!==null||Ke.envMap!==Be||oe.fog===!0&&Ke.fog!==Ce||Ke.numClippingPlanes!==void 0&&(Ke.numClippingPlanes!==je.numPlanes||Ke.numIntersection!==je.numIntersection)||Ke.vertexAlphas!==it||Ke.vertexTangents!==tt||Ke.morphTargets!==Ze||Ke.morphNormals!==ut||Ke.morphColors!==Rt||Ke.toneMapping!==Gt||Ke.morphTargetsCount!==ot)&&(vt=!0):(vt=!0,Ke.__version=oe.version);let Tn=Ke.currentProgram;vt===!0&&(Tn=tn(oe,Y,X));let Jn=!1,Cn=!1,Jt=!1;const Lt=Tn.getUniforms(),rn=Ke.uniforms;if(ke.useProgram(Tn.program)&&(Jn=!0,Cn=!0,Jt=!0),oe.id!==D&&(D=oe.id,Cn=!0),Jn||w!==C){ke.buffers.depth.getReversed()?(Ee.copy(C.projectionMatrix),sM(Ee),rM(Ee),Lt.setValue(H,"projectionMatrix",Ee)):Lt.setValue(H,"projectionMatrix",C.projectionMatrix),Lt.setValue(H,"viewMatrix",C.matrixWorldInverse);const pn=Lt.map.cameraPosition;pn!==void 0&&pn.setValue(H,Je.setFromMatrixPosition(C.matrixWorld)),Ft.logarithmicDepthBuffer&&Lt.setValue(H,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(oe.isMeshPhongMaterial||oe.isMeshToonMaterial||oe.isMeshLambertMaterial||oe.isMeshBasicMaterial||oe.isMeshStandardMaterial||oe.isShaderMaterial)&&Lt.setValue(H,"isOrthographic",C.isOrthographicCamera===!0),w!==C&&(w=C,Cn=!0,Jt=!0)}if(X.isSkinnedMesh){Lt.setOptional(H,X,"bindMatrix"),Lt.setOptional(H,X,"bindMatrixInverse");const Ot=X.skeleton;Ot&&(Ot.boneTexture===null&&Ot.computeBoneTexture(),Lt.setValue(H,"boneTexture",Ot.boneTexture,rt))}X.isBatchedMesh&&(Lt.setOptional(H,X,"batchingTexture"),Lt.setValue(H,"batchingTexture",X._matricesTexture,rt),Lt.setOptional(H,X,"batchingIdTexture"),Lt.setValue(H,"batchingIdTexture",X._indirectTexture,rt),Lt.setOptional(H,X,"batchingColorTexture"),X._colorsTexture!==null&&Lt.setValue(H,"batchingColorTexture",X._colorsTexture,rt));const fn=re.morphAttributes;if((fn.position!==void 0||fn.normal!==void 0||fn.color!==void 0)&&Ne.update(X,re,Tn),(Cn||Ke.receiveShadow!==X.receiveShadow)&&(Ke.receiveShadow=X.receiveShadow,Lt.setValue(H,"receiveShadow",X.receiveShadow)),oe.isMeshGouraudMaterial&&oe.envMap!==null&&(rn.envMap.value=Be,rn.flipEnvMap.value=Be.isCubeTexture&&Be.isRenderTargetTexture===!1?-1:1),oe.isMeshStandardMaterial&&oe.envMap===null&&Y.environment!==null&&(rn.envMapIntensity.value=Y.environmentIntensity),Cn&&(Lt.setValue(H,"toneMappingExposure",N.toneMappingExposure),Ke.needsLights&&so(rn,Jt),Ce&&oe.fog===!0&&fe.refreshFogUniforms(rn,Ce),fe.refreshMaterialUniforms(rn,oe,Z,$,v.state.transmissionRenderTarget[C.id]),Jc.upload(H,Sn(Ke),rn,rt)),oe.isShaderMaterial&&oe.uniformsNeedUpdate===!0&&(Jc.upload(H,Sn(Ke),rn,rt),oe.uniformsNeedUpdate=!1),oe.isSpriteMaterial&&Lt.setValue(H,"center",X.center),Lt.setValue(H,"modelViewMatrix",X.modelViewMatrix),Lt.setValue(H,"normalMatrix",X.normalMatrix),Lt.setValue(H,"modelMatrix",X.matrixWorld),oe.isShaderMaterial||oe.isRawShaderMaterial){const Ot=oe.uniformsGroups;for(let pn=0,fi=Ot.length;pn<fi;pn++){const wn=Ot[pn];j.update(wn,Tn),j.bind(wn,Tn)}}return Tn}function so(C,Y){C.ambientLightColor.needsUpdate=Y,C.lightProbe.needsUpdate=Y,C.directionalLights.needsUpdate=Y,C.directionalLightShadows.needsUpdate=Y,C.pointLights.needsUpdate=Y,C.pointLightShadows.needsUpdate=Y,C.spotLights.needsUpdate=Y,C.spotLightShadows.needsUpdate=Y,C.rectAreaLights.needsUpdate=Y,C.hemisphereLights.needsUpdate=Y}function ro(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return G},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return J},this.setRenderTargetTextures=function(C,Y,re){const oe=Qe.get(C);oe.__autoAllocateDepthBuffer=C.resolveDepthBuffer===!1,oe.__autoAllocateDepthBuffer===!1&&(oe.__useRenderToTexture=!1),Qe.get(C.texture).__webglTexture=Y,Qe.get(C.depthTexture).__webglTexture=oe.__autoAllocateDepthBuffer?void 0:re,oe.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(C,Y){const re=Qe.get(C);re.__webglFramebuffer=Y,re.__useDefaultFramebuffer=Y===void 0};const Ys=H.createFramebuffer();this.setRenderTarget=function(C,Y=0,re=0){J=C,G=Y,z=re;let oe=!0,X=null,Ce=!1,Oe=!1;if(C){const Be=Qe.get(C);if(Be.__useDefaultFramebuffer!==void 0)ke.bindFramebuffer(H.FRAMEBUFFER,null),oe=!1;else if(Be.__webglFramebuffer===void 0)rt.setupRenderTarget(C);else if(Be.__hasExternalTextures)rt.rebindTextures(C,Qe.get(C.texture).__webglTexture,Qe.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){const Ze=C.depthTexture;if(Be.__boundDepthTexture!==Ze){if(Ze!==null&&Qe.has(Ze)&&(C.width!==Ze.image.width||C.height!==Ze.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");rt.setupDepthRenderbuffer(C)}}const it=C.texture;(it.isData3DTexture||it.isDataArrayTexture||it.isCompressedArrayTexture)&&(Oe=!0);const tt=Qe.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(tt[Y])?X=tt[Y][re]:X=tt[Y],Ce=!0):C.samples>0&&rt.useMultisampledRTT(C)===!1?X=Qe.get(C).__webglMultisampledFramebuffer:Array.isArray(tt)?X=tt[re]:X=tt,k.copy(C.viewport),ue.copy(C.scissor),q=C.scissorTest}else k.copy(O).multiplyScalar(Z).floor(),ue.copy(se).multiplyScalar(Z).floor(),q=Me;if(re!==0&&(X=Ys),ke.bindFramebuffer(H.FRAMEBUFFER,X)&&oe&&ke.drawBuffers(C,X),ke.viewport(k),ke.scissor(ue),ke.setScissorTest(q),Ce){const Be=Qe.get(C.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Be.__webglTexture,re)}else if(Oe){const Be=Qe.get(C.texture),it=Y;H.framebufferTextureLayer(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,Be.__webglTexture,re,it)}else if(C!==null&&re!==0){const Be=Qe.get(C.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,Be.__webglTexture,re)}D=-1},this.readRenderTargetPixels=function(C,Y,re,oe,X,Ce,Oe,Fe=0){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Be=Qe.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Oe!==void 0&&(Be=Be[Oe]),Be){ke.bindFramebuffer(H.FRAMEBUFFER,Be);try{const it=C.textures[Fe],tt=it.format,Ze=it.type;if(!Ft.textureFormatReadable(tt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ft.textureTypeReadable(Ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Y>=0&&Y<=C.width-oe&&re>=0&&re<=C.height-X&&(C.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+Fe),H.readPixels(Y,re,oe,X,Le.convert(tt),Le.convert(Ze),Ce))}finally{const it=J!==null?Qe.get(J).__webglFramebuffer:null;ke.bindFramebuffer(H.FRAMEBUFFER,it)}}},this.readRenderTargetPixelsAsync=async function(C,Y,re,oe,X,Ce,Oe,Fe=0){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Be=Qe.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Oe!==void 0&&(Be=Be[Oe]),Be)if(Y>=0&&Y<=C.width-oe&&re>=0&&re<=C.height-X){ke.bindFramebuffer(H.FRAMEBUFFER,Be);const it=C.textures[Fe],tt=it.format,Ze=it.type;if(!Ft.textureFormatReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ft.textureTypeReadable(Ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ut=H.createBuffer();H.bindBuffer(H.PIXEL_PACK_BUFFER,ut),H.bufferData(H.PIXEL_PACK_BUFFER,Ce.byteLength,H.STREAM_READ),C.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+Fe),H.readPixels(Y,re,oe,X,Le.convert(tt),Le.convert(Ze),0);const Rt=J!==null?Qe.get(J).__webglFramebuffer:null;ke.bindFramebuffer(H.FRAMEBUFFER,Rt);const Gt=H.fenceSync(H.SYNC_GPU_COMMANDS_COMPLETE,0);return H.flush(),await aM(H,Gt,4),H.bindBuffer(H.PIXEL_PACK_BUFFER,ut),H.getBufferSubData(H.PIXEL_PACK_BUFFER,0,Ce),H.deleteBuffer(ut),H.deleteSync(Gt),Ce}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(C,Y=null,re=0){const oe=Math.pow(2,-re),X=Math.floor(C.image.width*oe),Ce=Math.floor(C.image.height*oe),Oe=Y!==null?Y.x:0,Fe=Y!==null?Y.y:0;rt.setTexture2D(C,0),H.copyTexSubImage2D(H.TEXTURE_2D,re,0,0,Oe,Fe,X,Ce),ke.unbindTexture()};const Fi=H.createFramebuffer(),ds=H.createFramebuffer();this.copyTextureToTexture=function(C,Y,re=null,oe=null,X=0,Ce=null){Ce===null&&(X!==0?(qr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Ce=X,X=0):Ce=0);let Oe,Fe,Be,it,tt,Ze,ut,Rt,Gt;const yt=C.isCompressedTexture?C.mipmaps[Ce]:C.image;if(re!==null)Oe=re.max.x-re.min.x,Fe=re.max.y-re.min.y,Be=re.isBox3?re.max.z-re.min.z:1,it=re.min.x,tt=re.min.y,Ze=re.isBox3?re.min.z:0;else{const fn=Math.pow(2,-X);Oe=Math.floor(yt.width*fn),Fe=Math.floor(yt.height*fn),C.isDataArrayTexture?Be=yt.depth:C.isData3DTexture?Be=Math.floor(yt.depth*fn):Be=1,it=0,tt=0,Ze=0}oe!==null?(ut=oe.x,Rt=oe.y,Gt=oe.z):(ut=0,Rt=0,Gt=0);const ot=Le.convert(Y.format),Ke=Le.convert(Y.type);let Xt;Y.isData3DTexture?(rt.setTexture3D(Y,0),Xt=H.TEXTURE_3D):Y.isDataArrayTexture||Y.isCompressedArrayTexture?(rt.setTexture2DArray(Y,0),Xt=H.TEXTURE_2D_ARRAY):(rt.setTexture2D(Y,0),Xt=H.TEXTURE_2D),H.pixelStorei(H.UNPACK_FLIP_Y_WEBGL,Y.flipY),H.pixelStorei(H.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Y.premultiplyAlpha),H.pixelStorei(H.UNPACK_ALIGNMENT,Y.unpackAlignment);const vt=H.getParameter(H.UNPACK_ROW_LENGTH),Tn=H.getParameter(H.UNPACK_IMAGE_HEIGHT),Jn=H.getParameter(H.UNPACK_SKIP_PIXELS),Cn=H.getParameter(H.UNPACK_SKIP_ROWS),Jt=H.getParameter(H.UNPACK_SKIP_IMAGES);H.pixelStorei(H.UNPACK_ROW_LENGTH,yt.width),H.pixelStorei(H.UNPACK_IMAGE_HEIGHT,yt.height),H.pixelStorei(H.UNPACK_SKIP_PIXELS,it),H.pixelStorei(H.UNPACK_SKIP_ROWS,tt),H.pixelStorei(H.UNPACK_SKIP_IMAGES,Ze);const Lt=C.isDataArrayTexture||C.isData3DTexture,rn=Y.isDataArrayTexture||Y.isData3DTexture;if(C.isDepthTexture){const fn=Qe.get(C),Ot=Qe.get(Y),pn=Qe.get(fn.__renderTarget),fi=Qe.get(Ot.__renderTarget);ke.bindFramebuffer(H.READ_FRAMEBUFFER,pn.__webglFramebuffer),ke.bindFramebuffer(H.DRAW_FRAMEBUFFER,fi.__webglFramebuffer);for(let wn=0;wn<Be;wn++)Lt&&(H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,Qe.get(C).__webglTexture,X,Ze+wn),H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,Qe.get(Y).__webglTexture,Ce,Gt+wn)),H.blitFramebuffer(it,tt,Oe,Fe,ut,Rt,Oe,Fe,H.DEPTH_BUFFER_BIT,H.NEAREST);ke.bindFramebuffer(H.READ_FRAMEBUFFER,null),ke.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else if(X!==0||C.isRenderTargetTexture||Qe.has(C)){const fn=Qe.get(C),Ot=Qe.get(Y);ke.bindFramebuffer(H.READ_FRAMEBUFFER,Fi),ke.bindFramebuffer(H.DRAW_FRAMEBUFFER,ds);for(let pn=0;pn<Be;pn++)Lt?H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,fn.__webglTexture,X,Ze+pn):H.framebufferTexture2D(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,fn.__webglTexture,X),rn?H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,Ot.__webglTexture,Ce,Gt+pn):H.framebufferTexture2D(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,Ot.__webglTexture,Ce),X!==0?H.blitFramebuffer(it,tt,Oe,Fe,ut,Rt,Oe,Fe,H.COLOR_BUFFER_BIT,H.NEAREST):rn?H.copyTexSubImage3D(Xt,Ce,ut,Rt,Gt+pn,it,tt,Oe,Fe):H.copyTexSubImage2D(Xt,Ce,ut,Rt,it,tt,Oe,Fe);ke.bindFramebuffer(H.READ_FRAMEBUFFER,null),ke.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else rn?C.isDataTexture||C.isData3DTexture?H.texSubImage3D(Xt,Ce,ut,Rt,Gt,Oe,Fe,Be,ot,Ke,yt.data):Y.isCompressedArrayTexture?H.compressedTexSubImage3D(Xt,Ce,ut,Rt,Gt,Oe,Fe,Be,ot,yt.data):H.texSubImage3D(Xt,Ce,ut,Rt,Gt,Oe,Fe,Be,ot,Ke,yt):C.isDataTexture?H.texSubImage2D(H.TEXTURE_2D,Ce,ut,Rt,Oe,Fe,ot,Ke,yt.data):C.isCompressedTexture?H.compressedTexSubImage2D(H.TEXTURE_2D,Ce,ut,Rt,yt.width,yt.height,ot,yt.data):H.texSubImage2D(H.TEXTURE_2D,Ce,ut,Rt,Oe,Fe,ot,Ke,yt);H.pixelStorei(H.UNPACK_ROW_LENGTH,vt),H.pixelStorei(H.UNPACK_IMAGE_HEIGHT,Tn),H.pixelStorei(H.UNPACK_SKIP_PIXELS,Jn),H.pixelStorei(H.UNPACK_SKIP_ROWS,Cn),H.pixelStorei(H.UNPACK_SKIP_IMAGES,Jt),Ce===0&&Y.generateMipmaps&&H.generateMipmap(Xt),ke.unbindTexture()},this.copyTextureToTexture3D=function(C,Y,re=null,oe=null,X=0){return qr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(C,Y,re,oe,X)},this.initRenderTarget=function(C){Qe.get(C).__webglFramebuffer===void 0&&rt.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?rt.setTextureCube(C,0):C.isData3DTexture?rt.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?rt.setTexture2DArray(C,0):rt.setTexture2D(C,0),ke.unbindTexture()},this.resetState=function(){G=0,z=0,J=null,ke.reset(),at.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ta}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const i=this.getContext();i.drawingBufferColorSpace=Ut._getDrawingBufferColorSpace(e),i.unpackColorSpace=Ut._getUnpackColorSpace()}}new mt("#0b1020");const b0=r=>{switch(r.type){case"sphere":return new jh(.5,32,16);case"torus":return new kh(.55,.2,16,48);default:return new io(1,1,1)}},zA=r=>new jr({color:r.color,emissive:new mt(0),roughness:.45,metalness:.08,wireframe:dt.getState().wireframe}),IA=r=>{const e=new Pi(b0(r),zA(r));return e.position.set(...r.position),e.rotation.set(...r.rotation),e.scale.set(...r.scale),e},z_=r=>{r.geometry.dispose();const e=r.material;Array.isArray(e)?e.forEach(i=>i.dispose()):e.dispose()},FA=(r,e)=>{r.position.set(...e.position),r.rotation.set(...e.rotation),r.scale.set(...e.scale),r.visible=e.visible,r.userData.locked=e.locked,r.material instanceof jr&&r.material.color.set(e.color)};function HA(){const r=we.useRef(null),e=we.useRef(null),i=we.useRef(null),s=we.useRef(null),l=we.useRef(null);return we.useEffect(()=>{const c=r.current;if(!c)return;const d=dt.getState(),h=new mt(d.bgColor||"#0b1020"),p=new DM;p.background=h,d.fogEnabled&&(p.fog=new cl(d.bgColor||"#0b1020",.05));const m=new Mi(45,1,.1,100);m.position.set(0,5,10),m.lookAt(0,0,0);const _=new BA({antialias:!0,alpha:!0});_.setPixelRatio(window.devicePixelRatio||1),_.setClearColor(h,1),_.outputColorSpace=ci;const x=new VM(16777215,d.lightIntensity*1.5),S=new GM(new mt(d.lightColor),2.2);S.position.set(5,8,4),S.target.position.set(0,0,0),p.add(S.target);const M=new $M(20,20,3359061,2042167);M.visible=d.gridPlane!=="None",M.rotation.set(0,0,0),d.gridPlane==="Wall (XY)"?M.rotation.x=Math.PI/2:d.gridPlane==="Side (YZ)"&&(M.rotation.z=Math.PI/2);const T=new Map;let R=null,E=0;p.add(x),p.add(S),p.add(M),e.current=p,i.current=m,s.current=_,window.__libre3dScene=p,_.domElement.style.width="100%",_.domElement.style.height="100%",_.domElement.style.display="block",c.appendChild(_.domElement);const v=()=>{const q=c.clientWidth||1,le=c.clientHeight||1;m.aspect=q/le,m.updateProjectionMatrix(),_.setSize(q,le,!1)},B=q=>{R?.material instanceof jr&&(R.material.emissive.set(0),R.material.wireframe=!1),R=q?T.get(q)??null:null,R&&!R.userData.locked&&R.material instanceof jr&&(R.material.emissive.set(1326125),R.material.wireframe=!1)},L=(q,le)=>{const _e=new Set(q.map(U=>U.id));for(const U of q){const $=T.get(U.id);if(!$){const xe=IA(U);xe.userData.entityId=U.id,xe.userData.entityType=U.type,xe.userData.locked=U.locked,xe.visible=U.visible,p.add(xe),T.set(U.id,xe);continue}FA($,U),$.userData.entityType!==U.type&&($.geometry.dispose(),$.geometry=b0(U),$.userData.entityType=U.type);const Z=$.material;Z instanceof jr&&Z.color.set(U.color)}for(const[U,$]of T)_e.has(U)||(p.remove($),z_($),T.delete(U));B(le)};l.current=new ResizeObserver(()=>{v()}),l.current.observe(c),v();const N=dt.subscribe(q=>q.entities,q=>{L(q,dt.getState().selectedEntityId)},{fireImmediately:!0}),W=dt.subscribe(q=>q.selectedEntityId,q=>{B(q)},{fireImmediately:!0}),G=dt.subscribe(q=>q.bgColor,q=>{const le=new mt(q);p.background=le,_.setClearColor(le,1),p.fog instanceof cl&&(p.fog.color=le)}),z=dt.subscribe(q=>q.gridPlane,q=>{M.visible=q!=="None",M.rotation.set(0,0,0),q==="Wall (XY)"?M.rotation.x=Math.PI/2:q==="Side (YZ)"&&(M.rotation.z=Math.PI/2)}),J=dt.subscribe(q=>q.wireframe,q=>{T.forEach(le=>{le.material instanceof jr&&(le.material.wireframe=q)})}),D=dt.subscribe(q=>q.lightIntensity,q=>{x.intensity=q*1.5}),w=dt.subscribe(q=>q.lightColor,q=>{S.color.set(q)}),k=dt.subscribe(q=>q.fogEnabled,q=>{q?p.fog=new cl(dt.getState().bgColor||"#0b1020",.05):p.fog=null}),ue=()=>{E=window.requestAnimationFrame(ue),_.render(p,m)};return ue(),()=>{window.cancelAnimationFrame(E),N(),W(),G(),z(),J(),D(),w(),k(),l.current?.disconnect(),l.current=null;for(const le of T.values())p.remove(le),z_(le);T.clear(),p.remove(M),p.remove(x),p.remove(S),p.remove(S.target),_.dispose(),_.forceContextLoss(),_.domElement.remove();const q=window;q.__libre3dScene===p&&delete q.__libre3dScene,e.current=null,i.current=null,s.current=null}},[]),g.jsx("div",{ref:r,style:{position:"relative",width:"100%",height:"100%",minHeight:"360px",overflow:"hidden",borderRadius:"0px",background:"#0b1020"}})}const GA="modulepreload",VA=function(r){return"/"+r},I_={},jA=function(e,i,s){let l=Promise.resolve();if(i&&i.length>0){let p=function(m){return Promise.all(m.map(_=>Promise.resolve(_).then(x=>({status:"fulfilled",value:x}),x=>({status:"rejected",reason:x}))))};document.getElementsByTagName("link");const d=document.querySelector("meta[property=csp-nonce]"),h=d?.nonce||d?.getAttribute("nonce");l=p(i.map(m=>{if(m=VA(m),m in I_)return;I_[m]=!0;const _=m.endsWith(".css"),x=_?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${x}`))return;const S=document.createElement("link");if(S.rel=_?"stylesheet":GA,_||(S.as="script"),S.crossOrigin="",S.href=m,h&&S.setAttribute("nonce",h),document.head.appendChild(S),_)return new Promise((M,T)=>{S.addEventListener("load",M),S.addEventListener("error",()=>T(new Error(`Unable to preload CSS for ${m}`)))})}))}function c(d){const h=new Event("vite:preloadError",{cancelable:!0});if(h.payload=d,window.dispatchEvent(h),!h.defaultPrevented)throw d}return l.then(d=>{for(const h of d||[])h.status==="rejected"&&c(h.reason);return e().catch(c)})},F_="libre3d-scene",kA=()=>typeof window>"u"?null:window,H_=(r,e,i)=>{const s=new Blob([r],{type:i}),l=window.URL.createObjectURL(s),c=document.createElement("a");c.href=l,c.download=e,c.rel="noopener noreferrer",c.style.display="none",document.body.appendChild(c),c.click(),c.remove(),window.URL.revokeObjectURL(l)},T0=r=>{let e=0;return r.traverse(i=>{i instanceof Pi&&(e+=1)}),e>0},G_=()=>kA()?.__libre3dScene??null,XA=async(r,e,i)=>new Promise((s,l)=>{r.parse(e,s,l,i)}),Dh=async(r,e)=>{if(!T0(r))return null;const{GLTFExporter:i}=await jA(async()=>{const{GLTFExporter:d}=await import("./GLTFExporter-Du-Rtdj9.js");return{GLTFExporter:d}},[]),s=new i,l=await XA(s,r,e==="glb"?{binary:!0,trs:!0,onlyVisible:!0,truncateDrawRange:!0,embedImages:!0}:{binary:!1,trs:!0,onlyVisible:!0,truncateDrawRange:!0,embedImages:!0});if(l instanceof Blob)return l;if(l instanceof ArrayBuffer)return new Blob([l],{type:"model/gltf-binary"});if(e==="glb")throw new Error("GLB export did not produce a binary payload.");const c=typeof l=="string"?l:JSON.stringify(l,null,2);return new Blob([c],{type:"application/gltf+json"})},WA=async r=>{if(!T0(r))return null;try{const s=await Dh(r,"glb");if(s){const l=`${F_}.glb`;return H_(s,l,"model/gltf-binary"),{format:"glb",fileName:l}}}catch(s){console.warn("GLB export failed, falling back to GLTF.",s)}const e=await Dh(r,"gltf"),i=`${F_}.gltf`;return e&&H_(e,i,"application/gltf+json"),{format:"gltf",fileName:i}},qA="/api/publish",YA=async r=>{const e=await fetch(qA,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPublishId:r})});if(!e.ok)throw new Error("Failed to create a publish session.");return await e.json()},ZA=async(r,e)=>{if(!(await fetch(r,{method:"PUT",headers:{"Content-Type":"model/gltf-binary"},body:e})).ok)throw new Error("Failed to upload the exported scene to S3.")},KA=async(r,e)=>{const i=await Dh(r,"glb");if(!i)return null;const s=await YA(e);return await ZA(s.uploadUrl,i),{sceneId:s.sceneId,shareUrl:s.shareUrl}},QA=["X","Y","Z"],JA=["position","rotation","scale"],$A=(r,e,i)=>{const s=Number.parseFloat(i);return Number.isNaN(s)?r:r.map((l,c)=>c===e?s:l)};function eR({sceneId:r}){const[e,i]=we.useState(null),[s,l]=we.useState(!0),[c,d]=we.useState(null);return we.useEffect(()=>{let h=!0;return fetch(`/api/scene/${r}`).then(p=>{if(!p.ok)throw new Error(`Failed to load scene (status ${p.status})`);return p.json()}).then(p=>{if(h){if(p&&p.cloudAssetUrl)i(p.cloudAssetUrl);else throw new Error("No asset URL found in scene data");l(!1)}}).catch(p=>{h&&(console.error(p),d(p instanceof Error?p.message:"An error occurred"),l(!1))}),()=>{h=!1}},[r]),s?g.jsxs("div",{className:"viewer-container viewer-status",children:[g.jsx("div",{className:"viewer-spinner"}),g.jsx("p",{children:"Loading scene..."})]}):c||!e?g.jsx("div",{className:"viewer-container viewer-status viewer-error",children:g.jsxs("p",{children:["Error: ",c||"Failed to load scene"]})}):g.jsx("div",{className:"viewer-container",children:g.jsx("model-viewer",{src:e,"camera-controls":!0,"auto-rotate":!0,style:{width:"100%",height:"100%"}})})}function tR(){const r=window.location.pathname.match(/^\/v\/([^/]+)$/),e=r?r[1]:null;return e?g.jsx(eR,{sceneId:e}):g.jsx(nR,{})}function nR(){const r=dt(F=>F.entities)??[],e=dt(F=>F.selectedEntityId),i=dt(F=>F.currentPublishId),s=dt(F=>F.setCurrentPublishId),l=dt(F=>F.addEntity);dt(F=>F.removeEntity),dt(F=>F.selectEntity);const c=dt(F=>F.updateEntityTransform),[d,h]=we.useState(!1),[p,m]=we.useState(!1),[_,x]=we.useState(!1),[S,M]=we.useState("export"),[T,R]=we.useState(!1),[E,v]=we.useState(i?`http://${window.location.host}/v/${i}`:null),[B,L]=we.useState("objects"),[N,W]=we.useState(""),[G,z]=we.useState("translate"),[J,D]=we.useState("perspective"),[w,k]=we.useState({frame:!0,scene:!0,globalSettings:!0,materialAssets:!0}),ue=dt(F=>F.bgColor),q=dt(F=>F.setBgColor),le=ue.replace("#",""),_e=F=>q("#"+F.replace("#","")),U=dt(F=>F.gridPlane),$=dt(F=>F.setGridPlane),Z=dt(F=>F.wireframe),xe=dt(F=>F.setWireframe),Ae=dt(F=>F.lightIntensity),O=dt(F=>F.setLightIntensity),se=dt(F=>F.lightColor),Me=dt(F=>F.setLightColor),K=se.replace("#",""),he=F=>Me("#"+F.replace("#","")),Re=dt(F=>F.fogEnabled),Ee=dt(F=>F.setFogEnabled),[ze,Je]=we.useState("Personal Camera"),[$e,zt]=we.useState("Responsive"),[It,_t]=we.useState(!1),[H,un]=we.useState("None"),[xt,Ft]=we.useState("100%"),[ke,gt]=we.useState("Studio"),[Qe,rt]=we.useState(!0),[an,P]=we.useState(!0),[b,ne]=we.useState("Soft"),[me,ye]=we.useState(!1),[fe,We]=we.useState(-9.8),[Ue,je]=we.useState("Mesh"),[qe,Se]=we.useState(!0),[Ne,Ye]=we.useState("ACES Filmic"),[Ge,Le]=we.useState(0),[at,j]=we.useState(!0),[De,be]=we.useState(40),[Ie,Te]=we.useState(.85),[ge,He]=we.useState(.4),[st,Ht]=we.useState(!1),[Et,yn]=we.useState(25),[Qn,us]=we.useState(!1),[Ra,ui]=we.useState(10),[Ii,Ca]=we.useState(.3),[fs,Ki]=we.useState(!1),[kn,tn]=we.useState(0),[Sn,Ei]=we.useState(!1),[wa,so]=we.useState(0),[ro,Ys]=we.useState(!1),[Fi,ds]=we.useState(0),[C,Y]=we.useState(!0),[re,oe]=we.useState(15),[X,Ce]=we.useState(!1),[Oe,Fe]=we.useState("5865F2"),[Be,it]=we.useState(!1),[tt,Ze]=we.useState(0),[ut,Rt]=we.useState(0),[Gt,yt]=we.useState(0),[ot,Ke]=we.useState("Object"),[Xt,vt]=we.useState(1),[Tn,Jn]=we.useState("WebGL 2"),[Cn,Jt]=we.useState("New Material"),[Lt,rn]=we.useState("Standard (PBR)"),[fn,Ot]=we.useState("888888"),[pn,fi]=we.useState(0),[wn,hs]=we.useState(.5),[oo,lo]=we.useState(1),[ps,Zs]=we.useState("Front"),[co,Qi]=we.useState("000000"),[di,ms]=we.useState(0),[Ks,Ji]=we.useState(0),[$i,uo]=we.useState(0),[Qs,fo]=we.useState(1.5),[Na,bi]=we.useState(0),[Hi,ea]=we.useState("materials"),[$n,ta]=we.useState("rough"),[gs,vs]=we.useState(!1),_s=dt(F=>F.renameEntity),Js=async()=>{if(d)return;const F=G_();if(!F){window.alert("The live scene is not ready yet.");return}h(!0);try{await WA(F)||window.alert("There is no exportable mesh content in the current scene.")}catch(Vt){console.error("Failed to export the current scene.",Vt),window.alert("The scene could not be exported. Check the console for details.")}finally{h(!1)}},_l=()=>{try{const F=JSON.stringify(r,null,2),Vt=new Blob([F],{type:"application/json"}),Ti=URL.createObjectURL(Vt),Ai=document.createElement("a");Ai.setAttribute("href",Ti),Ai.setAttribute("download","libre3d-scene.json"),document.body.appendChild(Ai),Ai.click(),Ai.remove(),URL.revokeObjectURL(Ti)}catch(F){console.error("Failed to export JSON:",F),window.alert("Failed to export JSON.")}},Bn=async()=>{if(p)return;const F=G_();if(!F){window.alert("The live scene is not ready yet.");return}m(!0);try{const Vt=await KA(F,i);if(!Vt){window.alert("There is no exportable mesh content in the current scene.");return}s(Vt.sceneId),v(`http://${window.location.host}/v/${Vt.sceneId}`)}catch(Vt){console.error("Failed to publish the current scene.",Vt),window.alert("The scene could not be published. Check the console for details.")}finally{m(!1)}},wt=r.find(F=>F.id===e)??null;return g.jsxs(g.Fragment,{children:[g.jsxs("div",{className:"editor-shell",children:[g.jsxs("aside",{className:"left-sidebar",children:[g.jsxs("div",{className:"left-sidebar-tabs",children:[g.jsx("button",{className:`left-sidebar-tab-btn ${B==="objects"?"active":""}`,type:"button",onClick:()=>L("objects"),children:"Objects"}),g.jsx("button",{className:`left-sidebar-tab-btn ${B==="assets"?"active":""}`,type:"button",onClick:()=>L("assets"),children:"Assets"})]}),g.jsx("div",{className:"left-sidebar-search-box",children:g.jsx("input",{className:"sidebar-search-input",type:"text",placeholder:"Search directory...",value:N,onChange:F=>W(F.target.value)})}),g.jsx("div",{className:"outliner-container",children:B==="objects"?g.jsx($y,{searchQuery:N}):g.jsx("div",{className:"editor-meta",style:{padding:"0.5rem"},children:"Asset browser is empty."})})]}),g.jsxs("div",{className:"viewport-container",children:[g.jsxs("div",{className:"floating-toolbar",children:[g.jsx("button",{className:`toolbar-btn ${G==="translate"?"active-translate":""}`,type:"button",title:"Translate Tool",onClick:()=>z("translate"),children:g.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:[g.jsx("polyline",{points:"5 9 2 12 5 15"}),g.jsx("polyline",{points:"9 5 12 2 15 5"}),g.jsx("polyline",{points:"15 19 12 22 9 19"}),g.jsx("polyline",{points:"19 9 22 12 19 15"}),g.jsx("line",{x1:"2",y1:"12",x2:"22",y2:"12"}),g.jsx("line",{x1:"12",y1:"2",x2:"12",y2:"22"})]})}),g.jsx("button",{className:`toolbar-btn ${G==="rotate"?"active-translate":""}`,type:"button",title:"Rotate Tool",onClick:()=>z("rotate"),children:g.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:g.jsx("path",{d:"M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"})})}),g.jsx("button",{className:`toolbar-btn ${G==="scale"?"active-translate":""}`,type:"button",title:"Scale Tool",onClick:()=>z("scale"),children:g.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:[g.jsx("rect",{x:"2",y:"2",width:"6",height:"6",rx:"1"}),g.jsx("rect",{x:"16",y:"16",width:"6",height:"6",rx:"1"}),g.jsx("path",{d:"M8 8l8 8"})]})}),g.jsxs("div",{style:{position:"relative",display:"inline-block"},children:[g.jsx("button",{className:"toolbar-btn",type:"button",title:"Add Shape",onClick:()=>vs(!gs),children:g.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:[g.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),g.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]})}),gs&&g.jsxs("div",{style:{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",marginTop:"8px",background:"var(--bg-panel)",border:"1px solid var(--border-strong)",borderRadius:"var(--radius-sm)",padding:"4px",display:"flex",flexDirection:"column",gap:"2px",zIndex:100,minWidth:"100px",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"},children:[g.jsx("button",{style:{background:"transparent",border:"none",color:"var(--text-primary)",padding:"6px 10px",borderRadius:"3px",textAlign:"left",fontSize:"11px",cursor:"pointer",fontFamily:"var(--font)"},type:"button",onMouseEnter:F=>F.currentTarget.style.background="var(--bg-hover)",onMouseLeave:F=>F.currentTarget.style.background="transparent",onClick:()=>{l("cube"),vs(!1)},children:"+ Cube"}),g.jsx("button",{style:{background:"transparent",border:"none",color:"var(--text-primary)",padding:"6px 10px",borderRadius:"3px",textAlign:"left",fontSize:"11px",cursor:"pointer",fontFamily:"var(--font)"},type:"button",onMouseEnter:F=>F.currentTarget.style.background="var(--bg-hover)",onMouseLeave:F=>F.currentTarget.style.background="transparent",onClick:()=>{l("sphere"),vs(!1)},children:"+ Sphere"}),g.jsx("button",{style:{background:"transparent",border:"none",color:"var(--text-primary)",padding:"6px 10px",borderRadius:"3px",textAlign:"left",fontSize:"11px",cursor:"pointer",fontFamily:"var(--font)"},type:"button",onMouseEnter:F=>F.currentTarget.style.background="var(--bg-hover)",onMouseLeave:F=>F.currentTarget.style.background="transparent",onClick:()=>{l("torus"),vs(!1)},children:"+ Torus"})]})]})]}),g.jsx(HA,{}),g.jsxs("div",{className:"viewport-bottom-overlays",children:[g.jsx("div",{className:"axis-orb-gizmo",title:"3D Axis Gizmo",children:g.jsxs("svg",{width:"32",height:"32",viewBox:"0 0 32 32",children:[g.jsx("circle",{cx:"16",cy:"16",r:"12",fill:"none",stroke:"rgba(255,255,255,0.15)",strokeWidth:"1.5"}),g.jsx("line",{x1:"16",y1:"16",x2:"24",y2:"16",stroke:"#ef4444",strokeWidth:"2.2",strokeLinecap:"round"}),g.jsx("line",{x1:"16",y1:"16",x2:"16",y2:"8",stroke:"#22c55e",strokeWidth:"2.2",strokeLinecap:"round"}),g.jsx("line",{x1:"16",y1:"16",x2:"11",y2:"21",stroke:"#3b82f6",strokeWidth:"2.2",strokeLinecap:"round"}),g.jsx("circle",{cx:"24",cy:"16",r:"2",fill:"#ef4444"}),g.jsx("circle",{cx:"16",cy:"8",r:"2",fill:"#22c55e"}),g.jsx("circle",{cx:"11",cy:"21",r:"2",fill:"#3b82f6"})]})}),g.jsxs("div",{className:"projection-toggle-capsule",children:[g.jsx("button",{className:`projection-btn ${J==="perspective"?"active":""}`,type:"button",onClick:()=>D("perspective"),children:"Persp"}),g.jsx("button",{className:`projection-btn ${J==="orthographic"?"active":""}`,type:"button",onClick:()=>D("orthographic"),children:"Ortho"})]})]})]}),g.jsxs("aside",{className:"right-sidebar panel","aria-label":"Properties inspector",children:[g.jsxs("div",{className:"topbar",children:[g.jsxs("div",{className:"topbar-left",children:[g.jsx("div",{className:"avatar",children:"E"}),g.jsxs("div",{className:"viewport-pill",children:[g.jsx("span",{children:"86%"}),g.jsx("i",{className:"ti ti-chevron-down"})]})]}),g.jsxs("div",{className:"topbar-right",children:[g.jsx("button",{className:"btn-chip",onClick:()=>{M("share"),x(!0)},children:"Share"}),g.jsx("button",{className:"btn-chip primary",onClick:()=>{M("export"),x(!0)},children:"Export"})]})]}),g.jsxs("div",{className:"panel-body",children:[wt&&g.jsxs(g.Fragment,{children:[g.jsxs("details",{open:!0,className:"section",children:[g.jsxs("summary",{className:"section-header",children:[g.jsxs("div",{className:"section-title-row",children:[g.jsx("i",{className:"ti ti-arrows-maximize",style:{fontSize:"12px",color:"var(--text-tertiary)"}}),g.jsx("span",{className:"section-label",children:"Transform"})]}),g.jsx("div",{className:"section-actions",children:g.jsx("i",{className:"chevron ti ti-chevron-right"})})]}),g.jsxs("div",{className:"section-body",children:[g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Name"}),g.jsx("input",{type:"text",style:{width:"60%"},value:wt.name,disabled:wt.locked,onChange:F=>_s(wt.id,F.target.value)})]}),JA.map(F=>g.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"4px"},children:[g.jsx("div",{className:"prop-group-label",style:{padding:"4px 0 2px"},children:F}),g.jsx("div",{className:"two-col",style:{display:"flex",gap:"4px"},children:wt[F].map((Vt,Ti)=>g.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"3px",background:"var(--bg-input)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",padding:"2px 4px"},children:[g.jsx("span",{style:{color:"var(--text-tertiary)",fontWeight:"bold",fontSize:"9px"},children:QA[Ti]}),g.jsx("input",{type:"number",step:"0.1",disabled:wt.locked,style:{background:"transparent",border:"none",color:"var(--text-primary)",width:"100%",padding:0,fontSize:"10px",textAlign:"right"},value:Vt,onChange:Ai=>c(wt.id,{[F]:$A(wt[F],Ti,Ai.target.value)})})]},Ti))})]},F))]})]}),g.jsx("div",{className:"section-divider"})]}),g.jsxs("details",{open:!0,className:"section",children:[g.jsxs("summary",{className:"section-header",children:[g.jsxs("div",{className:"section-title-row",children:[g.jsx("i",{className:"ti ti-layout",style:{fontSize:"12px",color:"var(--text-tertiary)"}}),g.jsx("span",{className:"section-label",children:"Frame"})]}),g.jsxs("div",{className:"section-actions",children:[g.jsx("i",{className:"ti ti-maximize","aria-label":"Fullscreen"}),g.jsx("i",{className:"chevron ti ti-chevron-right"})]})]}),g.jsxs("div",{className:"section-body",children:[g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Viewport"}),g.jsx("div",{className:"select-wrap w-60",children:g.jsxs("select",{value:ze,onChange:F=>Je(F.target.value),children:[g.jsx("option",{children:"Personal Camera"}),g.jsx("option",{children:"Top"}),g.jsx("option",{children:"Front"}),g.jsx("option",{children:"Right"})]})})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Resolution"}),g.jsx("div",{className:"select-wrap w-60",children:g.jsxs("select",{value:$e,onChange:F=>zt(F.target.value),children:[g.jsx("option",{children:"Responsive"}),g.jsx("option",{children:"1920 × 1080"}),g.jsx("option",{children:"1280 × 720"}),g.jsx("option",{children:"Square 1:1"})]})})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Auto Zoom"}),g.jsxs("div",{className:"seg w-40",children:[g.jsx("button",{className:`seg-btn ${It?"on":""}`,onClick:()=>_t(!0),children:"On"}),g.jsx("button",{className:`seg-btn ${It?"":"on"}`,onClick:()=>_t(!1),children:"Off"})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"HUD Overlay"}),g.jsx("div",{className:"select-wrap w-60",children:g.jsxs("select",{value:H,onChange:F=>un(F.target.value),children:[g.jsx("option",{children:"None"}),g.jsx("option",{children:"Stats"}),g.jsx("option",{children:"Axes"}),g.jsx("option",{children:"Grid"})]})})]})]})]}),g.jsx("div",{className:"section-divider"}),g.jsxs("details",{open:!0,className:"section",children:[g.jsxs("summary",{className:"section-header",children:[g.jsxs("div",{className:"section-title-row",children:[g.jsx("i",{className:"ti ti-cube",style:{fontSize:"12px",color:"var(--text-tertiary)"}}),g.jsx("span",{className:"section-label",children:"Scene"})]}),g.jsx("div",{className:"section-actions",children:g.jsx("i",{className:"chevron ti ti-chevron-right"})})]}),g.jsxs("div",{className:"section-body",children:[g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Background"}),g.jsxs("div",{className:"color-row w-60",children:[g.jsx("div",{className:"swatch",style:{background:"#"+le},onClick:()=>{const F=prompt("Enter Hex Color (e.g. 000000):",le);F!==null&&_e(F.replace("#",""))}}),g.jsx("input",{type:"text",className:"hex-input",value:le,onChange:F=>_e(F.target.value)}),g.jsx("input",{type:"text",className:"hex-input alpha-input",value:xt,onChange:F=>Ft(F.target.value)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Environment"}),g.jsx("div",{className:"select-wrap w-60",children:g.jsxs("select",{value:ke,onChange:F=>gt(F.target.value),children:[g.jsx("option",{children:"Studio"}),g.jsx("option",{children:"Outdoor"}),g.jsx("option",{children:"Night"}),g.jsx("option",{children:"Custom HDRI"})]})})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Fog"}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:Re,onChange:F=>Ee(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]}),g.jsxs("details",{className:"nested",children:[g.jsxs("summary",{className:"nested-header",children:[g.jsxs("div",{className:"nested-label",children:[g.jsx("i",{className:"ti ti-sun"}),g.jsx("span",{children:"Lights"})]}),g.jsx("i",{className:"chevron ti ti-chevron-right"})]}),g.jsxs("div",{className:"nested-body",children:[g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Ambient"}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:Qe,onChange:F=>rt(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Intensity"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"0",max:"2",step:"0.05",value:Ae,onChange:F=>O(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Ae.toFixed(2)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Directional"}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:an,onChange:F=>P(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Color"}),g.jsxs("div",{className:"color-row",children:[g.jsx("div",{className:"swatch",style:{background:"#"+K},onClick:()=>{const F=prompt("Enter Hex Color:",K);F!==null&&he(F.replace("#",""))}}),g.jsx("input",{type:"text",className:"hex-input",value:K,onChange:F=>he(F.target.value)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Shadow"}),g.jsxs("div",{className:"seg w-60",children:[g.jsx("button",{className:`seg-btn ${b==="Soft"?"on":""}`,onClick:()=>ne("Soft"),children:"Soft"}),g.jsx("button",{className:`seg-btn ${b==="Hard"?"on":""}`,onClick:()=>ne("Hard"),children:"Hard"}),g.jsx("button",{className:`seg-btn ${b==="Off"?"on":""}`,onClick:()=>ne("Off"),children:"Off"})]})]})]})]}),g.jsxs("details",{className:"nested",children:[g.jsxs("summary",{className:"nested-header",children:[g.jsxs("div",{className:"nested-label",children:[g.jsx("i",{className:"ti ti-atom-2"}),g.jsx("span",{children:"Simulation"})]}),g.jsx("i",{className:"chevron ti ti-chevron-right"})]}),g.jsxs("div",{className:"nested-body",children:[g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Physics"}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:me,onChange:F=>ye(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Gravity Y"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"-20",max:"0",step:"0.1",value:fe,onChange:F=>We(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:fe.toFixed(1)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Collision"}),g.jsx("div",{className:"select-wrap w-60",children:g.jsxs("select",{value:Ue,onChange:F=>je(F.target.value),children:[g.jsx("option",{children:"Mesh"}),g.jsx("option",{children:"Box"}),g.jsx("option",{children:"Sphere"}),g.jsx("option",{children:"Capsule"})]})})]})]})]})]})]}),g.jsx("div",{className:"section-divider"}),g.jsxs("details",{open:!0,className:"section",children:[g.jsxs("summary",{className:"section-header",children:[g.jsxs("div",{className:"section-title-row",children:[g.jsx("i",{className:"ti ti-sparkles",style:{fontSize:"12px",color:"var(--text-tertiary)"}}),g.jsx("span",{className:"section-label",children:"Post Processing"})]}),g.jsxs("div",{className:"section-actions",onClick:F=>F.stopPropagation(),children:[g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:qe,onChange:F=>Se(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]}),g.jsx("i",{className:"chevron ti ti-chevron-right",onClick:F=>{F.stopPropagation();const Vt=F.currentTarget.closest("details");Vt&&(Vt.open=!Vt.open)}})]})]}),g.jsxs("div",{className:"section-body",children:[g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Tone Map"}),g.jsx("div",{className:"select-wrap w-60",children:g.jsxs("select",{value:Ne,onChange:F=>Ye(F.target.value),children:[g.jsx("option",{children:"ACES Filmic"}),g.jsx("option",{children:"Reinhard"}),g.jsx("option",{children:"Cineon"}),g.jsx("option",{children:"AgX"}),g.jsx("option",{children:"Linear"}),g.jsx("option",{children:"None"})]})})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Exposure"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"-2",max:"2",step:"0.05",value:Ge,onChange:F=>Le(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Ge.toFixed(2)})]})]}),g.jsx("div",{className:"section-divider",style:{margin:"4px 0"}}),g.jsxs("div",{className:"effect-group",children:[g.jsxs("details",{className:"nested",style:{all:"unset",display:"block"},children:[g.jsx("summary",{style:{all:"unset",display:"block"},children:g.jsxs("div",{className:"effect-row",style:{cursor:"pointer"},children:[g.jsx("i",{className:"ti ti-stars effect-icon"}),g.jsx("span",{className:"effect-name",children:"Bloom"}),g.jsxs("div",{className:"effect-controls",onClick:F=>F.stopPropagation(),children:[g.jsxs("span",{className:"effect-val",children:[De,"%"]}),g.jsx("input",{type:"range",style:{width:"60px"},min:"0",max:"100",value:De,onChange:F=>be(parseInt(F.target.value))}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:at,onChange:F=>j(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]})]})}),g.jsxs("div",{className:"effect-row sub",children:[g.jsx("span",{className:"prop-label",children:"Threshold"}),g.jsxs("div",{className:"slider-row",style:{flex:1,marginLeft:"8px"},children:[g.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:Ie,onChange:F=>Te(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Ie.toFixed(2)})]})]}),g.jsxs("div",{className:"effect-row sub",children:[g.jsx("span",{className:"prop-label",children:"Radius"}),g.jsxs("div",{className:"slider-row",style:{flex:1,marginLeft:"8px"},children:[g.jsx("input",{type:"range",min:"0",max:"2",step:"0.1",value:ge,onChange:F=>He(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:ge.toFixed(1)})]})]})]}),g.jsxs("div",{className:"effect-row",children:[g.jsx("i",{className:"ti ti-shadow effect-icon"}),g.jsx("span",{className:"effect-name",children:"SSAO"}),g.jsxs("div",{className:"effect-controls",children:[g.jsxs("span",{className:"effect-val",children:[Et,"%"]}),g.jsx("input",{type:"range",style:{width:"60px"},min:"0",max:"100",value:Et,onChange:F=>yn(parseInt(F.target.value))}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:st,onChange:F=>Ht(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]})]}),g.jsxs("details",{className:"nested",style:{all:"unset",display:"block"},children:[g.jsx("summary",{style:{all:"unset",display:"block"},children:g.jsxs("div",{className:"effect-row",style:{cursor:"pointer"},children:[g.jsx("i",{className:"ti ti-camera effect-icon"}),g.jsx("span",{className:"effect-name",children:"Depth of Field"}),g.jsx("div",{className:"effect-controls",onClick:F=>F.stopPropagation(),children:g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:Qn,onChange:F=>us(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})})]})}),g.jsxs("div",{className:"effect-row sub",children:[g.jsx("span",{className:"prop-label",children:"Focus dist."}),g.jsxs("div",{className:"slider-row",style:{flex:1,marginLeft:"8px"},children:[g.jsx("input",{type:"range",min:"0.1",max:"50",step:"0.1",value:Ra,onChange:F=>ui(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Ra.toFixed(1)})]})]}),g.jsxs("div",{className:"effect-row sub",children:[g.jsx("span",{className:"prop-label",children:"Bokeh"}),g.jsxs("div",{className:"slider-row",style:{flex:1,marginLeft:"8px"},children:[g.jsx("input",{type:"range",min:"0",max:"1",step:"0.05",value:Ii,onChange:F=>Ca(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Ii.toFixed(2)})]})]})]}),g.jsxs("div",{className:"effect-row",children:[g.jsx("i",{className:"ti ti-color-filter effect-icon"}),g.jsx("span",{className:"effect-name",children:"Chromatic Aberration"}),g.jsxs("div",{className:"effect-controls",children:[g.jsxs("span",{className:"effect-val",children:[kn,"%"]}),g.jsx("input",{type:"range",style:{width:"60px"},min:"0",max:"100",value:kn,onChange:F=>tn(parseInt(F.target.value))}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:fs,onChange:F=>Ki(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]})]}),g.jsxs("div",{className:"effect-row",children:[g.jsx("i",{className:"ti ti-wind effect-icon"}),g.jsx("span",{className:"effect-name",children:"Motion Blur"}),g.jsxs("div",{className:"effect-controls",children:[g.jsxs("span",{className:"effect-val",children:[wa,"%"]}),g.jsx("input",{type:"range",style:{width:"60px"},min:"0",max:"100",value:wa,onChange:F=>so(parseInt(F.target.value))}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:Sn,onChange:F=>Ei(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]})]}),g.jsxs("div",{className:"effect-row",children:[g.jsx("i",{className:"ti ti-grain effect-icon"}),g.jsx("span",{className:"effect-name",children:"Film Grain"}),g.jsxs("div",{className:"effect-controls",children:[g.jsxs("span",{className:"effect-val",children:[Fi,"%"]}),g.jsx("input",{type:"range",style:{width:"60px"},min:"0",max:"100",value:Fi,onChange:F=>ds(parseInt(F.target.value))}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:ro,onChange:F=>Ys(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]})]}),g.jsxs("div",{className:"effect-row",children:[g.jsx("i",{className:"ti ti-circle-half-vertical effect-icon"}),g.jsx("span",{className:"effect-name",children:"Vignette"}),g.jsxs("div",{className:"effect-controls",children:[g.jsxs("span",{className:"effect-val",children:[re,"%"]}),g.jsx("input",{type:"range",style:{width:"60px"},min:"0",max:"100",value:re,onChange:F=>oe(parseInt(F.target.value))}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:C,onChange:F=>Y(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]})]}),g.jsxs("div",{className:"effect-row",children:[g.jsx("i",{className:"ti ti-vector-triangle effect-icon"}),g.jsx("span",{className:"effect-name",children:"Outline"}),g.jsxs("div",{className:"effect-controls",children:[g.jsx("div",{className:"swatch",style:{background:"#"+Oe,width:"14px",height:"14px",borderRadius:"3px"},onClick:()=>{const F=prompt("Enter Outline Hex Color:",Oe);F!==null&&Fe(F.replace("#",""))}}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:X,onChange:F=>Ce(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]})]}),g.jsxs("details",{className:"nested",style:{all:"unset",display:"block"},children:[g.jsx("summary",{style:{all:"unset",display:"block"},children:g.jsxs("div",{className:"effect-row",style:{cursor:"pointer",borderBottom:"none"},children:[g.jsx("i",{className:"ti ti-adjustments-horizontal effect-icon"}),g.jsx("span",{className:"effect-name",children:"Color Grading"}),g.jsx("div",{className:"effect-controls",onClick:F=>F.stopPropagation(),children:g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:Be,onChange:F=>it(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})})]})}),g.jsxs("div",{className:"effect-row sub",children:[g.jsx("span",{className:"prop-label",children:"Brightness"}),g.jsxs("div",{className:"slider-row",style:{flex:1,marginLeft:"8px"},children:[g.jsx("input",{type:"range",min:"-1",max:"1",step:"0.05",value:tt,onChange:F=>Ze(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:tt.toFixed(2)})]})]}),g.jsxs("div",{className:"effect-row sub",children:[g.jsx("span",{className:"prop-label",children:"Contrast"}),g.jsxs("div",{className:"slider-row",style:{flex:1,marginLeft:"8px"},children:[g.jsx("input",{type:"range",min:"-1",max:"1",step:"0.05",value:ut,onChange:F=>Rt(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:ut.toFixed(2)})]})]}),g.jsxs("div",{className:"effect-row sub",style:{borderBottom:"none"},children:[g.jsx("span",{className:"prop-label",children:"Saturation"}),g.jsxs("div",{className:"slider-row",style:{flex:1,marginLeft:"8px"},children:[g.jsx("input",{type:"range",min:"-1",max:"1",step:"0.05",value:Gt,onChange:F=>yt(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Gt.toFixed(2)})]})]})]})]})]})]}),g.jsx("div",{className:"section-divider"}),g.jsxs("details",{className:"section",children:[g.jsxs("summary",{className:"section-header",children:[g.jsxs("div",{className:"section-title-row",children:[g.jsx("i",{className:"ti ti-settings",style:{fontSize:"12px",color:"var(--text-tertiary)"}}),g.jsx("span",{className:"section-label",children:"Global Settings"})]}),g.jsx("div",{className:"section-actions",children:g.jsx("i",{className:"chevron ti ti-chevron-right"})})]}),g.jsxs("div",{className:"section-body",children:[g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Grid Plane"}),g.jsx("div",{className:"select-wrap w-60 font-inherit",children:g.jsxs("select",{value:U,onChange:F=>$(F.target.value),children:[g.jsx("option",{children:"Floor (XZ)"}),g.jsx("option",{children:"Wall (XY)"}),g.jsx("option",{children:"Side (YZ)"}),g.jsx("option",{children:"None"})]})})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Snapping"}),g.jsxs("div",{className:"seg",style:{width:"60%"},children:[g.jsx("button",{className:`seg-btn ${ot==="Object"?"on":""}`,onClick:()=>Ke("Object"),children:"Object"}),g.jsx("button",{className:`seg-btn ${ot==="Grid"?"on":""}`,onClick:()=>Ke("Grid"),children:"Grid"}),g.jsx("button",{className:`seg-btn ${ot==="Off"?"on":""}`,onClick:()=>Ke("Off"),children:"Off"})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Snap Size"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"0.1",max:"5",step:"0.1",value:Xt,onChange:F=>vt(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Xt.toFixed(1)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Wireframe"}),g.jsxs("label",{className:"toggle",children:[g.jsx("input",{type:"checkbox",checked:Z,onChange:F=>xe(F.target.checked)}),g.jsx("span",{className:"toggle-track"})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Renderer"}),g.jsx("div",{className:"select-wrap w-60",children:g.jsxs("select",{value:Tn,onChange:F=>Jn(F.target.value),children:[g.jsx("option",{children:"WebGL 2"}),g.jsx("option",{children:"WebGPU"})]})})]})]})]}),g.jsx("div",{className:"section-divider"}),g.jsxs("details",{open:!0,className:"section",children:[g.jsxs("summary",{className:"section-header",children:[g.jsxs("div",{className:"section-title-row",children:[g.jsx("i",{className:"ti ti-sphere",style:{fontSize:"12px",color:"var(--text-tertiary)"}}),g.jsx("span",{className:"section-label",children:"Material"})]}),g.jsxs("div",{className:"section-actions",children:[g.jsx("i",{className:"ti ti-plus","aria-label":"New material",onClick:()=>{Jt("New Material"),Ot("888888")}}),g.jsx("i",{className:"chevron ti ti-chevron-right"})]})]}),g.jsxs("div",{className:"section-body",children:[g.jsxs("div",{className:"mat-preview-row",children:[g.jsx("div",{className:"mat-sphere",id:"mat-sphere",style:{background:`radial-gradient(circle at 38% 35%, #${wt?wt.color.replace("#",""):fn}, #111)`}}),g.jsxs("div",{className:"mat-name-col",children:[g.jsx("input",{type:"text",className:"mat-name-input",value:wt?wt.name:Cn,onChange:F=>{wt?_s(wt.id,F.target.value):Jt(F.target.value)}}),g.jsx("div",{className:"mat-type-tag",children:"MeshStandardMaterial"})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Type"}),g.jsx("div",{className:"select-wrap w-60",children:g.jsxs("select",{value:Lt,onChange:F=>rn(F.target.value),children:[g.jsx("option",{children:"Standard (PBR)"}),g.jsx("option",{children:"Physical"}),g.jsx("option",{children:"Toon"}),g.jsx("option",{children:"Lambert"}),g.jsx("option",{children:"Phong"}),g.jsx("option",{children:"Normal"}),g.jsx("option",{children:"Depth"}),g.jsx("option",{children:"Custom Shader"})]})})]}),g.jsx("div",{className:"prop-group-label",children:"Surface"}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Base Color"}),g.jsxs("div",{className:"color-row",children:[g.jsx("div",{className:"swatch",id:"base-swatch",style:{background:wt?wt.color:"#"+fn},onClick:()=>{const F=wt?wt.color:"#"+fn,Vt=prompt("Enter Base Color Hex:",F);if(Vt!==null){const Ti=Vt.startsWith("#")?Vt:"#"+Vt;wt?c(wt.id,{color:Ti}):Ot(Ti.replace("#",""))}}}),g.jsx("input",{type:"text",className:"hex-input",value:wt?wt.color.replace("#",""):fn,onChange:F=>{const Vt=F.target.value;wt?c(wt.id,{color:"#"+Vt}):Ot(Vt)}})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Metalness"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"0",max:"1",step:"0.01",value:pn,onChange:F=>fi(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:pn.toFixed(2)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Roughness"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"0",max:"1",step:"0.01",value:wn,onChange:F=>hs(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:wn.toFixed(2)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Opacity"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"0",max:"1",step:"0.01",value:oo,onChange:F=>lo(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:oo.toFixed(2)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Side"}),g.jsxs("div",{className:"seg",style:{width:"60%"},children:[g.jsx("button",{className:`seg-btn ${ps==="Front"?"on":""}`,onClick:()=>Zs("Front"),children:"Front"}),g.jsx("button",{className:`seg-btn ${ps==="Back"?"on":""}`,onClick:()=>Zs("Back"),children:"Back"}),g.jsx("button",{className:`seg-btn ${ps==="Both"?"on":""}`,onClick:()=>Zs("Both"),children:"Both"})]})]}),g.jsx("div",{className:"prop-group-label",children:"Emission"}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Emissive"}),g.jsxs("div",{className:"color-row",children:[g.jsx("div",{className:"swatch",style:{background:"#"+co},onClick:()=>{const F=prompt("Enter Emissive Hex Color:",co);F!==null&&Qi(F.replace("#",""))}}),g.jsx("input",{type:"text",className:"hex-input",value:co,onChange:F=>Qi(F.target.value)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Intensity"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"0",max:"10",step:"0.1",value:di,onChange:F=>ms(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:di.toFixed(1)})]})]}),Lt==="Physical"&&g.jsxs(g.Fragment,{children:[g.jsx("div",{className:"prop-group-label",children:"Advanced"}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Clearcoat"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"0",max:"1",step:"0.01",value:Ks,onChange:F=>Ji(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Ks.toFixed(2)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Transmission"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"0",max:"1",step:"0.01",value:$i,onChange:F=>uo(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:$i.toFixed(2)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"IOR"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"1",max:"2.5",step:"0.01",value:Qs,onChange:F=>fo(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Qs.toFixed(2)})]})]}),g.jsxs("div",{className:"prop",children:[g.jsx("span",{className:"prop-label",children:"Iridescence"}),g.jsxs("div",{className:"slider-row w-60",children:[g.jsx("input",{type:"range",min:"0",max:"1",step:"0.01",value:Na,onChange:F=>bi(parseFloat(F.target.value))}),g.jsx("span",{className:"slider-val",children:Na.toFixed(2)})]})]})]}),g.jsx("div",{className:"prop-group-label",children:"Maps"}),g.jsxs("div",{className:"map-row",children:[g.jsx("div",{className:"map-thumb",children:g.jsx("i",{className:"ti ti-photo"})}),g.jsx("span",{className:"map-name",children:"Map"}),g.jsx("i",{className:"map-action ti ti-arrow-bar-to-down"})]}),g.jsxs("div",{className:"map-row",children:[g.jsx("div",{className:"map-thumb",children:g.jsx("i",{className:"ti ti-photo"})}),g.jsx("span",{className:"map-name",children:"Normal Map"}),g.jsx("i",{className:"map-action ti ti-arrow-bar-to-down"})]}),g.jsxs("div",{className:"map-row",children:[g.jsx("div",{className:"map-thumb",children:g.jsx("i",{className:"ti ti-photo"})}),g.jsx("span",{className:"map-name",children:"Roughness Map"}),g.jsx("i",{className:"map-action ti ti-arrow-bar-to-down"})]}),g.jsxs("div",{className:"map-row",children:[g.jsx("div",{className:"map-thumb",children:g.jsx("i",{className:"ti ti-photo"})}),g.jsx("span",{className:"map-name",children:"Metalness Map"}),g.jsx("i",{className:"map-action ti ti-arrow-bar-to-down"})]}),g.jsx("div",{className:"prop-group-label",style:{padding:"12px 0 6px"},children:"Asset Library"}),g.jsxs("div",{className:"lib-tabs",children:[g.jsxs("button",{className:`lib-tab ${Hi==="materials"?"on":""}`,onClick:()=>ea("materials"),children:[g.jsx("i",{className:"ti ti-sphere"}),g.jsx("span",{children:"Mats"})]}),g.jsxs("button",{className:`lib-tab ${Hi==="textures"?"on":""}`,onClick:()=>ea("textures"),children:[g.jsx("i",{className:"ti ti-photo"}),g.jsx("span",{children:"Texs"})]}),g.jsxs("button",{className:`lib-tab ${Hi==="shaders"?"on":""}`,onClick:()=>ea("shaders"),children:[g.jsx("i",{className:"ti ti-terminal-2"}),g.jsx("span",{children:"Shad"})]})]}),Hi==="materials"&&g.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"6px",marginTop:"6px"},children:[g.jsxs("div",{className:`asset-card ${$n==="metal"?"active":""}`,onClick:()=>{ta("metal"),Jt("Chrome Steel"),rn("Physical"),Ot("D0D0D0"),fi(1),hs(.05),Ji(.8)},children:[g.jsx("div",{className:"mat-ball metal"}),g.jsxs("div",{className:"card-info",children:[g.jsx("div",{className:"card-name",children:"Chrome Steel"}),g.jsx("div",{className:"card-meta",children:"Physical PBR • 1.2 MB"})]}),g.jsxs("div",{className:"card-actions",children:[g.jsx("i",{className:"ti ti-heart"}),g.jsx("i",{className:"ti ti-dots-vertical"})]})]}),g.jsxs("div",{className:`asset-card ${$n==="glass"?"active":""}`,onClick:()=>{ta("glass"),Jt("Frosted Glass"),rn("Physical"),Ot("B4DCFF"),fi(0),hs(.15),uo(.9),fo(1.52)},children:[g.jsx("div",{className:"mat-ball glass"}),g.jsxs("div",{className:"card-info",children:[g.jsx("div",{className:"card-name",children:"Frosted Glass"}),g.jsx("div",{className:"card-meta",children:"Physical PBR • 400 KB"})]}),g.jsxs("div",{className:"card-actions",children:[g.jsx("i",{className:"ti ti-heart"}),g.jsx("i",{className:"ti ti-dots-vertical"})]})]}),g.jsxs("div",{className:`asset-card ${$n==="emissive"?"active":""}`,onClick:()=>{ta("emissive"),Jt("Neon Glow"),rn("Standard (PBR)"),Ot("4C1D95"),Qi("A78BFA"),ms(5)},children:[g.jsx("div",{className:"mat-ball emissive"}),g.jsxs("div",{className:"card-info",children:[g.jsx("div",{className:"card-name",children:"Neon Glow"}),g.jsx("div",{className:"card-meta",children:"Standard PBR • 120 KB"})]}),g.jsxs("div",{className:"card-actions",children:[g.jsx("i",{className:"ti ti-heart"}),g.jsx("i",{className:"ti ti-dots-vertical"})]})]}),g.jsxs("div",{className:`asset-card ${$n==="rough"?"active":""}`,onClick:()=>{ta("rough"),Jt("Terracotta Clay"),rn("Standard (PBR)"),Ot("C2956A"),fi(0),hs(.9)},children:[g.jsx("div",{className:"mat-ball rough"}),g.jsxs("div",{className:"card-info",children:[g.jsx("div",{className:"card-name",children:"Terracotta Clay"}),g.jsx("div",{className:"card-meta",children:"Standard PBR • 3.4 MB"})]}),g.jsxs("div",{className:"card-actions",children:[g.jsx("i",{className:"ti ti-heart"}),g.jsx("i",{className:"ti ti-dots-vertical"})]})]})]}),Hi==="textures"&&g.jsx("div",{className:"editor-meta",style:{padding:"0.5rem",fontSize:"10.5px"},children:"Texture assets list is empty."}),Hi==="shaders"&&g.jsx("div",{className:"editor-meta",style:{padding:"0.5rem",fontSize:"10.5px"},children:"Custom shader templates list is empty."}),g.jsxs("div",{className:"section-footer",children:[g.jsxs("button",{className:"footer-btn",onClick:()=>alert("Material configuration saved locally!"),children:[g.jsx("i",{className:"ti ti-device-floppy"}),g.jsx("span",{children:"Save Mat"})]}),g.jsxs("button",{className:"footer-btn",onClick:()=>{Jt("New Material"),rn("Standard (PBR)"),Ot("888888"),fi(0),hs(.5),lo(1),Zs("Front"),Qi("000000"),ms(0),ta("")},children:[g.jsx("i",{className:"ti ti-rotate"}),g.jsx("span",{children:"Reset"})]})]})]})]})]})]})]}),_?g.jsx("div",{className:"editor-modal-backdrop",role:"presentation",onClick:()=>x(!1),children:g.jsxs("section",{className:"editor-modal",role:"dialog","aria-modal":"true","aria-labelledby":"modal-dialog-title",onClick:F=>F.stopPropagation(),children:[g.jsxs("div",{className:"modal-tabs",children:[g.jsx("button",{className:`modal-tab-btn ${S==="export"?"active":""}`,type:"button",onClick:()=>M("export"),children:"Export Asset"}),g.jsx("button",{className:`modal-tab-btn ${S==="share"?"active":""}`,type:"button",onClick:()=>M("share"),children:"Share Scene"})]}),S==="export"?g.jsxs("div",{className:"modal-tab-content",children:[g.jsx("h2",{className:"editor-modal-title",id:"modal-dialog-title",children:"Export Scene Options"}),g.jsx("p",{className:"editor-modal-copy",children:"Download the current scene locally as a standard 3D asset or save its configuration data."}),g.jsxs("div",{className:"modal-export-actions",children:[g.jsx("button",{className:"editor-action editor-action--primary",type:"button",onClick:Js,disabled:d,children:d?"Exporting GLB...":"Download 3D Asset (.glb)"}),g.jsx("button",{className:"editor-action",type:"button",onClick:_l,children:"Download Scene Config (.json)"})]})]}):g.jsxs("div",{className:"modal-tab-content",children:[g.jsx("h2",{className:"editor-modal-title",id:"modal-dialog-title",children:"Publish to the Cloud"}),g.jsx("p",{className:"editor-modal-copy",children:"Upload your scene to generate a shareable, interactive public view page."}),g.jsxs("div",{className:"modal-share-actions",children:[g.jsx("button",{className:"editor-action editor-action--publish",type:"button",onClick:Bn,disabled:p,children:p?"Publishing...":i?"Update Published Scene":"Publish Scene to Cloud"}),E?g.jsxs("div",{className:"share-url-container",children:[g.jsx("input",{className:"share-url-input",type:"text",readOnly:!0,value:E}),g.jsx("button",{className:"editor-action copy-btn",type:"button",onClick:()=>{navigator.clipboard.writeText(E).then(()=>{R(!0),setTimeout(()=>R(!1),2e3)}).catch(F=>{console.error("Failed to copy",F)})},children:T?"Copied!":"Copy Link"})]}):null]})]}),g.jsx("div",{className:"editor-modal-actions",children:g.jsx("button",{className:"editor-action",type:"button",onClick:()=>x(!1),children:"Close"})})]})}):null]})}const A0=document.getElementById("root");if(!A0)throw new Error("Root element #root was not found.");Iy.createRoot(A0).render(g.jsx(sl.StrictMode,{children:g.jsx(tR,{})}));export{qi as B,mt as C,Ea as D,lM as I,Wi as L,sn as M,ss as N,Kt as P,gl as Q,Lh as R,Gh as S,ae as V,rR as a,sR as b,Oi as c,iR as d,DM as e,ci as f,Bi as g,NS as h,Ec as i,hd as j,Xs as k,ks as l,nh as m,ih as n,aR as o};
