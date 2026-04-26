import{A as e,C as t,Dt as n,G as r,R as i,S as a,St as o,Tt as s,W as c,X as l,b as u,jt as d,k as f,m as p,ot as m,q as h,rt as g,ut as _,w as v,x as y}from"./vue.runtime.esm-bundler-DT6ez1Hp.js";import{B as b,F as x,G as S,H as C,I as w,J as T,K as E,M as ee,N as te,P as D,Pt as O,R as k,U as A,V as ne,W as j,X as M,Y as N,et as re,j as ie,o as ae,q as oe,z as se}from"./settings-BMjQ5mDZ.js";import{i as ce,n as le}from"./pinia-D-gyamZc.js";import{s as P,t as ue}from"./src-CYHg-arE.js";import{c as de,s as fe,t as pe,z as me}from"./dist-pwWWFRMt.js";import{t as F}from"./use-local-storage-manual-reset-BFNTCzcl.js";import{t as he}from"./mutex-BBeg6Rb3.js";import{n as ge}from"./animation-899KLRy9.js";import{t as _e}from"./eye-motions-D4onqb5l.js";var I=e({__name:`Canvas`,props:i({width:{},height:{},resolution:{default:2},maxFps:{default:0}},{state:{default:`pending`},stateModifiers:{}}),emits:[`update:state`],setup(e,{expose:n}){let i=e,a=g(e,`state`),s=o(),u=o(!1),d=o(),f=o();function p(e){return!e||e<=0?0:Math.max(1,Math.round(e))}function _(e){e.ticker.remove(e.render,e),e.ticker.add(()=>{try{e.render()}catch(t){console.error(`[Live2D] Pixi render error.`,t),e.ticker.stop()}}),e.ticker.maxFPS=p(i.maxFps)}async function y(e){a.value=`loading`,u.value=!1,ee.registerTicker(ne),A.add(C),d.value=new D({width:i.width*i.resolution,height:i.height*i.resolution,backgroundAlpha:0,preserveDrawingBuffer:!0,autoDensity:!1,resolution:1}),_(d.value),d.value.stage.scale.set(i.resolution),f.value=d.value.view,f.value.style.width=`100%`,f.value.style.height=`100%`,f.value.style.objectFit=`cover`,f.value.style.display=`block`,e.appendChild(d.value.view),u.value=!0,a.value=`mounted`}function b(){d.value&&(d.value.renderer.resize(i.width*i.resolution,i.height*i.resolution),d.value.stage.scale.set(i.resolution))}m([()=>i.width,()=>i.height,()=>i.resolution],b),m(()=>i.maxFps,e=>{d.value&&(d.value.ticker.maxFPS=p(e))}),c(async()=>s.value&&await y(s.value)),r(()=>d.value?.destroy());async function x(){return new Promise(e=>{if(!f.value||!d.value)return e(null);try{d.value.render()}catch(t){return console.error(`[Live2D] Pixi render error during capture.`,t),e(null)}f.value.toBlob(e)})}function S(){return f.value}return n({captureFrame:x,canvasElement:S}),(void 0)?.dispose(()=>{console.warn(`[Dev] Reload on HMR dispose is active for this component. Performing a full reload.`),window.location.reload()}),(e,n)=>(h(),v(`div`,{ref_key:`containerRef`,ref:s,"h-full":``,"w-full":``},[u.value?l(e.$slots,`default`,{key:0,app:d.value}):t(``,!0)],512))}}),L=function(e,t){return L=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},L(e,t)};function ve(e,t){L(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var R=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,ye=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float gamma;
uniform float contrast;
uniform float saturation;
uniform float brightness;
uniform float red;
uniform float green;
uniform float blue;
uniform float alpha;

void main(void)
{
    vec4 c = texture2D(uSampler, vTextureCoord);

    if (c.a > 0.0) {
        c.rgb /= c.a;

        vec3 rgb = pow(c.rgb, vec3(1. / gamma));
        rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);
        rgb.r *= red;
        rgb.g *= green;
        rgb.b *= blue;
        c.rgb = rgb * brightness;

        c.rgb *= c.a;
    }

    gl_FragColor = c * alpha;
}
`;(function(e){ve(t,e);function t(t){var n=e.call(this,R,ye)||this;return n.gamma=1,n.saturation=1,n.contrast=1,n.brightness=1,n.red=1,n.green=1,n.blue=1,n.alpha=1,Object.assign(n,t),n}return t.prototype.apply=function(e,t,n,r){this.uniforms.gamma=Math.max(this.gamma,1e-4),this.uniforms.saturation=this.saturation,this.uniforms.contrast=this.contrast,this.uniforms.brightness=this.brightness,this.uniforms.red=this.red,this.uniforms.green=this.green,this.uniforms.blue=this.blue,this.uniforms.alpha=this.alpha,e.applyFilter(this,t,n,r)},t})(x);var z=function(e,t){return z=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},z(e,t)};function B(e,t){z(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var be=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,xe=`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 uOffset;

void main(void)
{
    vec4 color = vec4(0.0);

    // Sample top left pixel
    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y));

    // Sample top right pixel
    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y));

    // Sample bottom right pixel
    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y));

    // Sample bottom left pixel
    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y));

    // Average
    color *= 0.25;

    gl_FragColor = color;
}`,V=`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 uOffset;
uniform vec4 filterClamp;

void main(void)
{
    vec4 color = vec4(0.0);

    // Sample top left pixel
    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));

    // Sample top right pixel
    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));

    // Sample bottom right pixel
    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));

    // Sample bottom left pixel
    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));

    // Average
    color *= 0.25;

    gl_FragColor = color;
}
`,H=function(e){B(t,e);function t(t,n,r){t===void 0&&(t=4),n===void 0&&(n=3),r===void 0&&(r=!1);var i=e.call(this,be,r?V:xe)||this;return i._kernels=[],i._blur=4,i._quality=3,i.uniforms.uOffset=new Float32Array(2),i._pixelSize=new b,i.pixelSize=1,i._clamp=r,Array.isArray(t)?i.kernels=t:(i._blur=t,i.quality=n),i}return t.prototype.apply=function(e,t,n,r){var i=this._pixelSize.x/t._frame.width,a=this._pixelSize.y/t._frame.height,o;if(this._quality===1||this._blur===0)o=this._kernels[0]+.5,this.uniforms.uOffset[0]=o*i,this.uniforms.uOffset[1]=o*a,e.applyFilter(this,t,n,r);else{for(var s=e.getFilterTexture(),c=t,l=s,u=void 0,d=this._quality-1,f=0;f<d;f++)o=this._kernels[f]+.5,this.uniforms.uOffset[0]=o*i,this.uniforms.uOffset[1]=o*a,e.applyFilter(this,c,l,1),u=c,c=l,l=u;o=this._kernels[d]+.5,this.uniforms.uOffset[0]=o*i,this.uniforms.uOffset[1]=o*a,e.applyFilter(this,c,n,r),e.returnFilterTexture(s)}},t.prototype._updatePadding=function(){this.padding=Math.ceil(this._kernels.reduce(function(e,t){return e+t+.5},0))},t.prototype._generateKernels=function(){var e=this._blur,t=this._quality,n=[e];if(e>0)for(var r=e,i=e/t,a=1;a<t;a++)r-=i,n.push(r);this._kernels=n,this._updatePadding()},Object.defineProperty(t.prototype,`kernels`,{get:function(){return this._kernels},set:function(e){Array.isArray(e)&&e.length>0?(this._kernels=e,this._quality=e.length,this._blur=Math.max.apply(Math,e)):(this._kernels=[0],this._quality=1)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`clamp`,{get:function(){return this._clamp},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`pixelSize`,{get:function(){return this._pixelSize},set:function(e){typeof e==`number`?(this._pixelSize.x=e,this._pixelSize.y=e):Array.isArray(e)?(this._pixelSize.x=e[0],this._pixelSize.y=e[1]):e instanceof b?(this._pixelSize.x=e.x,this._pixelSize.y=e.y):(this._pixelSize.x=1,this._pixelSize.y=1)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`quality`,{get:function(){return this._quality},set:function(e){this._quality=Math.max(1,Math.round(e)),this._generateKernels()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blur`,{get:function(){return this._blur},set:function(e){this._blur=e,this._generateKernels()},enumerable:!1,configurable:!0}),t}(x),U=function(e,t){return U=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},U(e,t)};function W(e,t){U(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var G=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Se=`
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform float threshold;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);

    // A simple & fast algorithm for getting brightness.
    // It's inaccuracy , but good enought for this feature.
    float _max = max(max(color.r, color.g), color.b);
    float _min = min(min(color.r, color.g), color.b);
    float brightness = (_max + _min) * 0.5;

    if(brightness > threshold) {
        gl_FragColor = color;
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
`,Ce=function(e){W(t,e);function t(t){t===void 0&&(t=.5);var n=e.call(this,G,Se)||this;return n.threshold=t,n}return Object.defineProperty(t.prototype,`threshold`,{get:function(){return this.uniforms.threshold},set:function(e){this.uniforms.threshold=e},enumerable:!1,configurable:!0}),t}(x),we=`uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform sampler2D bloomTexture;
uniform float bloomScale;
uniform float brightness;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    color.rgb *= brightness;
    vec4 bloomColor = vec4(texture2D(bloomTexture, vTextureCoord).rgb, 0.0);
    bloomColor.rgb *= bloomScale;
    gl_FragColor = color + bloomColor;
}
`;(function(e){W(t,e);function t(n){var r=e.call(this,G,we)||this;r.bloomScale=1,r.brightness=1,r._resolution=E.FILTER_RESOLUTION,typeof n==`number`&&(n={threshold:n});var i=Object.assign(t.defaults,n);r.bloomScale=i.bloomScale,r.brightness=i.brightness;var a=i.kernels,o=i.blur,s=i.quality,c=i.pixelSize,l=i.resolution;return r._extractFilter=new Ce(i.threshold),r._extractFilter.resolution=l,r._blurFilter=a?new H(a):new H(o,s),r.pixelSize=c,r.resolution=l,r}return t.prototype.apply=function(e,t,n,r,i){var a=e.getFilterTexture();this._extractFilter.apply(e,t,a,1,i);var o=e.getFilterTexture();this._blurFilter.apply(e,a,o,1),this.uniforms.bloomScale=this.bloomScale,this.uniforms.brightness=this.brightness,this.uniforms.bloomTexture=o,e.applyFilter(this,t,n,r),e.returnFilterTexture(o),e.returnFilterTexture(a)},Object.defineProperty(t.prototype,`resolution`,{get:function(){return this._resolution},set:function(e){this._resolution=e,this._extractFilter&&(this._extractFilter.resolution=e),this._blurFilter&&(this._blurFilter.resolution=e)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`threshold`,{get:function(){return this._extractFilter.threshold},set:function(e){this._extractFilter.threshold=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`kernels`,{get:function(){return this._blurFilter.kernels},set:function(e){this._blurFilter.kernels=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blur`,{get:function(){return this._blurFilter.blur},set:function(e){this._blurFilter.blur=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`quality`,{get:function(){return this._blurFilter.quality},set:function(e){this._blurFilter.quality=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`pixelSize`,{get:function(){return this._blurFilter.pixelSize},set:function(e){this._blurFilter.pixelSize=e},enumerable:!1,configurable:!0}),t.defaults={threshold:.5,bloomScale:1,brightness:1,kernels:null,blur:8,quality:4,pixelSize:1,resolution:E.FILTER_RESOLUTION},t})(x);var K=function(e,t){return K=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},K(e,t)};function Te(e,t){K(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Ee=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,De=`varying vec2 vTextureCoord;

uniform vec4 filterArea;
uniform float pixelSize;
uniform sampler2D uSampler;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

vec2 pixelate(vec2 coord, vec2 size)
{
    return floor( coord / size ) * size;
}

vec2 getMod(vec2 coord, vec2 size)
{
    return mod( coord , size) / size;
}

float character(float n, vec2 p)
{
    p = floor(p*vec2(4.0, -4.0) + 2.5);

    if (clamp(p.x, 0.0, 4.0) == p.x)
    {
        if (clamp(p.y, 0.0, 4.0) == p.y)
        {
            if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;
        }
    }
    return 0.0;
}

void main()
{
    vec2 coord = mapCoord(vTextureCoord);

    // get the rounded color..
    vec2 pixCoord = pixelate(coord, vec2(pixelSize));
    pixCoord = unmapCoord(pixCoord);

    vec4 color = texture2D(uSampler, pixCoord);

    // determine the character to use
    float gray = (color.r + color.g + color.b) / 3.0;

    float n =  65536.0;             // .
    if (gray > 0.2) n = 65600.0;    // :
    if (gray > 0.3) n = 332772.0;   // *
    if (gray > 0.4) n = 15255086.0; // o
    if (gray > 0.5) n = 23385164.0; // &
    if (gray > 0.6) n = 15252014.0; // 8
    if (gray > 0.7) n = 13199452.0; // @
    if (gray > 0.8) n = 11512810.0; // #

    // get the mod..
    vec2 modd = getMod(coord, vec2(pixelSize));

    gl_FragColor = color * character( n, vec2(-1.0) + modd * 2.0);

}
`;(function(e){Te(t,e);function t(t){t===void 0&&(t=8);var n=e.call(this,Ee,De)||this;return n.size=t,n}return Object.defineProperty(t.prototype,`size`,{get:function(){return this.uniforms.pixelSize},set:function(e){this.uniforms.pixelSize=e},enumerable:!1,configurable:!0}),t})(x);var q=function(e,t){return q=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},q(e,t)};function J(e,t){q(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Y=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,X=`precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform float transformX;
uniform float transformY;
uniform vec3 lightColor;
uniform float lightAlpha;
uniform vec3 shadowColor;
uniform float shadowAlpha;

void main(void) {
    vec2 transform = vec2(1.0 / filterArea) * vec2(transformX, transformY);
    vec4 color = texture2D(uSampler, vTextureCoord);
    float light = texture2D(uSampler, vTextureCoord - transform).a;
    float shadow = texture2D(uSampler, vTextureCoord + transform).a;

    color.rgb = mix(color.rgb, lightColor, clamp((color.a - light) * lightAlpha, 0.0, 1.0));
    color.rgb = mix(color.rgb, shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));
    gl_FragColor = vec4(color.rgb * color.a, color.a);
}
`;(function(e){J(t,e);function t(t){var n=e.call(this,Y,X)||this;return n._thickness=2,n._angle=0,n.uniforms.lightColor=new Float32Array(3),n.uniforms.shadowColor=new Float32Array(3),Object.assign(n,{rotation:45,thickness:2,lightColor:16777215,lightAlpha:.7,shadowColor:0,shadowAlpha:.7},t),n.padding=1,n}return t.prototype._updateTransform=function(){this.uniforms.transformX=this._thickness*Math.cos(this._angle),this.uniforms.transformY=this._thickness*Math.sin(this._angle)},Object.defineProperty(t.prototype,`rotation`,{get:function(){return this._angle/k},set:function(e){this._angle=e*k,this._updateTransform()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`thickness`,{get:function(){return this._thickness},set:function(e){this._thickness=e,this._updateTransform()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`lightColor`,{get:function(){return S(this.uniforms.lightColor)},set:function(e){j(e,this.uniforms.lightColor)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`lightAlpha`,{get:function(){return this.uniforms.lightAlpha},set:function(e){this.uniforms.lightAlpha=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`shadowColor`,{get:function(){return S(this.uniforms.shadowColor)},set:function(e){j(e,this.uniforms.shadowColor)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`shadowAlpha`,{get:function(){return this.uniforms.shadowAlpha},set:function(e){this.uniforms.shadowAlpha=e},enumerable:!1,configurable:!0}),t})(x);var Z=function(e,t){return Z=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])},Z(e,t)};function Oe(e,t){Z(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var ke=`varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uAlpha;

void main(void)
{
   gl_FragColor = texture2D(uSampler, vTextureCoord) * uAlpha;
}
`,Ae=function(e){Oe(t,e);function t(t){t===void 0&&(t=1);var n=e.call(this,`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,ke,{uAlpha:1})||this;return n.alpha=t,n}return Object.defineProperty(t.prototype,`alpha`,{get:function(){return this.uniforms.uAlpha},set:function(e){this.uniforms.uAlpha=e},enumerable:!1,configurable:!0}),t}(x),je=function(e,t){return je=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])},je(e,t)};function Me(e,t){je(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Ne=`
    attribute vec2 aVertexPosition;

    uniform mat3 projectionMatrix;

    uniform float strength;

    varying vec2 vBlurTexCoords[%size%];

    uniform vec4 inputSize;
    uniform vec4 outputFrame;

    vec4 filterVertexPosition( void )
    {
        vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

        return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
    }

    vec2 filterTextureCoord( void )
    {
        return aVertexPosition * (outputFrame.zw * inputSize.zw);
    }

    void main(void)
    {
        gl_Position = filterVertexPosition();

        vec2 textureCoord = filterTextureCoord();
        %blur%
    }`;function Pe(e,t){for(var n=Math.ceil(e/2),r=Ne,i=``,a=t?`vBlurTexCoords[%index%] =  textureCoord + vec2(%sampleIndex% * strength, 0.0);`:`vBlurTexCoords[%index%] =  textureCoord + vec2(0.0, %sampleIndex% * strength);`,o=0;o<e;o++){var s=a.replace(`%index%`,o.toString());s=s.replace(`%sampleIndex%`,o-(n-1)+`.0`),i+=s,i+=`
`}return r=r.replace(`%blur%`,i),r=r.replace(`%size%`,e.toString()),r}var Fe={5:[.153388,.221461,.250301],7:[.071303,.131514,.189879,.214607],9:[.028532,.067234,.124009,.179044,.20236],11:[.0093,.028002,.065984,.121703,.175713,.198596],13:[.002406,.009255,.027867,.065666,.121117,.174868,.197641],15:[489e-6,.002403,.009246,.02784,.065602,.120999,.174697,.197448]},Ie=[`varying vec2 vBlurTexCoords[%size%];`,`uniform sampler2D uSampler;`,`void main(void)`,`{`,`    gl_FragColor = vec4(0.0);`,`    %blur%`,`}`].join(`
`);function Le(e){for(var t=Fe[e],n=t.length,r=Ie,i=``,a=`gl_FragColor += texture2D(uSampler, vBlurTexCoords[%index%]) * %value%;`,o,s=0;s<e;s++){var c=a.replace(`%index%`,s.toString());o=s,s>=n&&(o=e-s-1),c=c.replace(`%value%`,t[o].toString()),i+=c,i+=`
`}return r=r.replace(`%blur%`,i),r=r.replace(`%size%`,e.toString()),r}var Q=function(e){Me(t,e);function t(t,n,r,i,a){n===void 0&&(n=8),r===void 0&&(r=4),i===void 0&&(i=E.FILTER_RESOLUTION),a===void 0&&(a=5);var o=this,s=Pe(a,t),c=Le(a);return o=e.call(this,s,c)||this,o.horizontal=t,o.resolution=i,o._quality=0,o.quality=r,o.blur=n,o}return t.prototype.apply=function(e,t,n,r){if(n?this.horizontal?this.uniforms.strength=1/n.width*(n.width/t.width):this.uniforms.strength=1/n.height*(n.height/t.height):this.horizontal?this.uniforms.strength=1/e.renderer.width*(e.renderer.width/t.width):this.uniforms.strength=1/e.renderer.height*(e.renderer.height/t.height),this.uniforms.strength*=this.strength,this.uniforms.strength/=this.passes,this.passes===1)e.applyFilter(this,t,n,r);else{var i=e.getFilterTexture(),a=e.renderer,o=t,s=i;this.state.blend=!1,e.applyFilter(this,o,s,T.CLEAR);for(var c=1;c<this.passes-1;c++){e.bindAndClear(o,T.BLIT),this.uniforms.uSampler=s;var l=s;s=o,o=l,a.shader.bind(this),a.geometry.draw(5)}this.state.blend=!0,e.applyFilter(this,s,n,r),e.returnFilterTexture(i)}},Object.defineProperty(t.prototype,`blur`,{get:function(){return this.strength},set:function(e){this.padding=1+Math.abs(e)*2,this.strength=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`quality`,{get:function(){return this._quality},set:function(e){this._quality=e,this.passes=e},enumerable:!1,configurable:!0}),t}(x);(function(e){Me(t,e);function t(t,n,r,i){t===void 0&&(t=8),n===void 0&&(n=4),r===void 0&&(r=E.FILTER_RESOLUTION),i===void 0&&(i=5);var a=e.call(this)||this;return a.blurXFilter=new Q(!0,t,n,r,i),a.blurYFilter=new Q(!1,t,n,r,i),a.resolution=r,a.quality=n,a.blur=t,a.repeatEdgePixels=!1,a}return t.prototype.apply=function(e,t,n,r){var i=Math.abs(this.blurXFilter.strength),a=Math.abs(this.blurYFilter.strength);if(i&&a){var o=e.getFilterTexture();this.blurXFilter.apply(e,t,o,T.CLEAR),this.blurYFilter.apply(e,o,n,r),e.returnFilterTexture(o)}else a?this.blurYFilter.apply(e,t,n,r):this.blurXFilter.apply(e,t,n,r)},t.prototype.updatePadding=function(){this._repeatEdgePixels?this.padding=0:this.padding=Math.max(Math.abs(this.blurXFilter.strength),Math.abs(this.blurYFilter.strength))*2},Object.defineProperty(t.prototype,`blur`,{get:function(){return this.blurXFilter.blur},set:function(e){this.blurXFilter.blur=this.blurYFilter.blur=e,this.updatePadding()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`quality`,{get:function(){return this.blurXFilter.quality},set:function(e){this.blurXFilter.quality=this.blurYFilter.quality=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blurX`,{get:function(){return this.blurXFilter.blur},set:function(e){this.blurXFilter.blur=e,this.updatePadding()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blurY`,{get:function(){return this.blurYFilter.blur},set:function(e){this.blurYFilter.blur=e,this.updatePadding()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blendMode`,{get:function(){return this.blurYFilter.blendMode},set:function(e){this.blurYFilter.blendMode=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`repeatEdgePixels`,{get:function(){return this._repeatEdgePixels},set:function(e){this._repeatEdgePixels=e,this.updatePadding()},enumerable:!1,configurable:!0}),t})(x);var Re=function(e,t){return Re=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Re(e,t)};function ze(e,t){Re(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}(function(e){ze(t,e);function t(t,n,r,i){t===void 0&&(t=2),n===void 0&&(n=4),r===void 0&&(r=E.FILTER_RESOLUTION),i===void 0&&(i=5);var a=e.call(this)||this,o,s;return typeof t==`number`?(o=t,s=t):t instanceof b?(o=t.x,s=t.y):Array.isArray(t)&&(o=t[0],s=t[1]),a.blurXFilter=new Q(!0,o,n,r,i),a.blurYFilter=new Q(!1,s,n,r,i),a.blurYFilter.blendMode=oe.SCREEN,a.defaultFilter=new Ae,a}return t.prototype.apply=function(e,t,n,r){var i=e.getFilterTexture();this.defaultFilter.apply(e,t,n,r),this.blurXFilter.apply(e,t,i,1),this.blurYFilter.apply(e,i,n,0),e.returnFilterTexture(i)},Object.defineProperty(t.prototype,`blur`,{get:function(){return this.blurXFilter.blur},set:function(e){this.blurXFilter.blur=this.blurYFilter.blur=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blurX`,{get:function(){return this.blurXFilter.blur},set:function(e){this.blurXFilter.blur=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blurY`,{get:function(){return this.blurYFilter.blur},set:function(e){this.blurYFilter.blur=e},enumerable:!1,configurable:!0}),t})(x);var Be=function(e,t){return Be=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Be(e,t)};function Ve(e,t){Be(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var He=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Ue=`uniform float radius;
uniform float strength;
uniform vec2 center;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;

void main()
{
    vec2 coord = vTextureCoord * filterArea.xy;
    coord -= center * dimensions.xy;
    float distance = length(coord);
    if (distance < radius) {
        float percent = distance / radius;
        if (strength > 0.0) {
            coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);
        } else {
            coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);
        }
    }
    coord += center * dimensions.xy;
    coord /= filterArea.xy;
    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);
    vec4 color = texture2D(uSampler, clampedCoord);
    if (coord != clampedCoord) {
        color *= max(0.0, 1.0 - length(coord - clampedCoord));
    }

    gl_FragColor = color;
}
`;(function(e){Ve(t,e);function t(n){var r=e.call(this,He,Ue)||this;return r.uniforms.dimensions=new Float32Array(2),Object.assign(r,t.defaults,n),r}return t.prototype.apply=function(e,t,n,r){var i=t.filterFrame,a=i.width,o=i.height;this.uniforms.dimensions[0]=a,this.uniforms.dimensions[1]=o,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`radius`,{get:function(){return this.uniforms.radius},set:function(e){this.uniforms.radius=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`strength`,{get:function(){return this.uniforms.strength},set:function(e){this.uniforms.strength=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`center`,{get:function(){return this.uniforms.center},set:function(e){this.uniforms.center=e},enumerable:!1,configurable:!0}),t.defaults={center:[.5,.5],radius:100,strength:1},t})(x);var We=function(e,t){return We=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},We(e,t)};function Ge(e,t){We(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Ke=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,qe=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D colorMap;
uniform float _mix;
uniform float _size;
uniform float _sliceSize;
uniform float _slicePixelSize;
uniform float _sliceInnerSize;
void main() {
    vec4 color = texture2D(uSampler, vTextureCoord.xy);

    vec4 adjusted;
    if (color.a > 0.0) {
        color.rgb /= color.a;
        float innerWidth = _size - 1.0;
        float zSlice0 = min(floor(color.b * innerWidth), innerWidth);
        float zSlice1 = min(zSlice0 + 1.0, innerWidth);
        float xOffset = _slicePixelSize * 0.5 + color.r * _sliceInnerSize;
        float s0 = xOffset + (zSlice0 * _sliceSize);
        float s1 = xOffset + (zSlice1 * _sliceSize);
        float yOffset = _sliceSize * 0.5 + color.g * (1.0 - _sliceSize);
        vec4 slice0Color = texture2D(colorMap, vec2(s0,yOffset));
        vec4 slice1Color = texture2D(colorMap, vec2(s1,yOffset));
        float zOffset = fract(color.b * innerWidth);
        adjusted = mix(slice0Color, slice1Color, zOffset);

        color.rgb *= color.a;
    }
    gl_FragColor = vec4(mix(color, adjusted, _mix).rgb, color.a);

}`;(function(e){Ge(t,e);function t(t,n,r){n===void 0&&(n=!1),r===void 0&&(r=1);var i=e.call(this,Ke,qe)||this;return i.mix=1,i._size=0,i._sliceSize=0,i._slicePixelSize=0,i._sliceInnerSize=0,i._nearest=!1,i._scaleMode=null,i._colorMap=null,i._scaleMode=null,i.nearest=n,i.mix=r,i.colorMap=t,i}return t.prototype.apply=function(e,t,n,r){this.uniforms._mix=this.mix,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`colorSize`,{get:function(){return this._size},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`colorMap`,{get:function(){return this._colorMap},set:function(e){e&&(e instanceof w||(e=w.from(e)),e?.baseTexture&&(e.baseTexture.scaleMode=this._scaleMode,e.baseTexture.mipmap=N.OFF,this._size=e.height,this._sliceSize=1/this._size,this._slicePixelSize=this._sliceSize/this._size,this._sliceInnerSize=this._slicePixelSize*(this._size-1),this.uniforms._size=this._size,this.uniforms._sliceSize=this._sliceSize,this.uniforms._slicePixelSize=this._slicePixelSize,this.uniforms._sliceInnerSize=this._sliceInnerSize,this.uniforms.colorMap=e),this._colorMap=e)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`nearest`,{get:function(){return this._nearest},set:function(e){this._nearest=e,this._scaleMode=e?M.NEAREST:M.LINEAR;var t=this._colorMap;t&&t.baseTexture&&(t.baseTexture._glTextures={},t.baseTexture.scaleMode=this._scaleMode,t.baseTexture.mipmap=N.OFF,t._updateID++,t.baseTexture.emit(`update`,t.baseTexture))},enumerable:!1,configurable:!0}),t.prototype.updateColorMap=function(){var e=this._colorMap;e&&e.baseTexture&&(e._updateID++,e.baseTexture.emit(`update`,e.baseTexture),this.colorMap=e)},t.prototype.destroy=function(t){t===void 0&&(t=!1),this._colorMap&&this._colorMap.destroy(t),e.prototype.destroy.call(this)},t})(x);var Je=function(e,t){return Je=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Je(e,t)};function Ye(e,t){Je(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Xe=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Ze=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec3 color;
uniform float alpha;

void main(void) {
    vec4 currentColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(mix(currentColor.rgb, color.rgb, currentColor.a * alpha), currentColor.a);
}
`;(function(e){Ye(t,e);function t(t,n){t===void 0&&(t=0),n===void 0&&(n=1);var r=e.call(this,Xe,Ze)||this;return r._color=0,r._alpha=1,r.uniforms.color=new Float32Array(3),r.color=t,r.alpha=n,r}return Object.defineProperty(t.prototype,`color`,{get:function(){return this._color},set:function(e){var t=this.uniforms.color;typeof e==`number`?(j(e,t),this._color=e):(t[0]=e[0],t[1]=e[1],t[2]=e[2],this._color=S(t))},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`alpha`,{get:function(){return this._alpha},set:function(e){this.uniforms.alpha=e,this._alpha=e},enumerable:!1,configurable:!0}),t})(x);var Qe=function(e,t){return Qe=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Qe(e,t)};function $e(e,t){Qe(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var et=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,tt=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec3 originalColor;
uniform vec3 newColor;
uniform float epsilon;
void main(void) {
    vec4 currentColor = texture2D(uSampler, vTextureCoord);
    vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));
    float colorDistance = length(colorDiff);
    float doReplace = step(colorDistance, epsilon);
    gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);
}
`;(function(e){$e(t,e);function t(t,n,r){t===void 0&&(t=16711680),n===void 0&&(n=0),r===void 0&&(r=.4);var i=e.call(this,et,tt)||this;return i._originalColor=16711680,i._newColor=0,i.uniforms.originalColor=new Float32Array(3),i.uniforms.newColor=new Float32Array(3),i.originalColor=t,i.newColor=n,i.epsilon=r,i}return Object.defineProperty(t.prototype,`originalColor`,{get:function(){return this._originalColor},set:function(e){var t=this.uniforms.originalColor;typeof e==`number`?(j(e,t),this._originalColor=e):(t[0]=e[0],t[1]=e[1],t[2]=e[2],this._originalColor=S(t))},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`newColor`,{get:function(){return this._newColor},set:function(e){var t=this.uniforms.newColor;typeof e==`number`?(j(e,t),this._newColor=e):(t[0]=e[0],t[1]=e[1],t[2]=e[2],this._newColor=S(t))},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`epsilon`,{get:function(){return this.uniforms.epsilon},set:function(e){this.uniforms.epsilon=e},enumerable:!1,configurable:!0}),t})(x);var nt=function(e,t){return nt=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},nt(e,t)};function rt(e,t){nt(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var it=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,at=`precision mediump float;

varying mediump vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec2 texelSize;
uniform float matrix[9];

void main(void)
{
   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left
   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center
   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right

   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left
   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center
   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right

   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left
   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center
   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right

   gl_FragColor =
       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +
       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +
       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];

   gl_FragColor.a = c22.a;
}
`;(function(e){rt(t,e);function t(t,n,r){n===void 0&&(n=200),r===void 0&&(r=200);var i=e.call(this,it,at)||this;return i.uniforms.texelSize=new Float32Array(2),i.uniforms.matrix=new Float32Array(9),t!==void 0&&(i.matrix=t),i.width=n,i.height=r,i}return Object.defineProperty(t.prototype,`matrix`,{get:function(){return this.uniforms.matrix},set:function(e){var t=this;e.forEach(function(e,n){t.uniforms.matrix[n]=e})},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`width`,{get:function(){return 1/this.uniforms.texelSize[0]},set:function(e){this.uniforms.texelSize[0]=1/e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`height`,{get:function(){return 1/this.uniforms.texelSize[1]},set:function(e){this.uniforms.texelSize[1]=1/e},enumerable:!1,configurable:!0}),t})(x);var ot=function(e,t){return ot=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},ot(e,t)};function st(e,t){ot(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var ct=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,lt=`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void)
{
    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);

    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

    if (lum < 1.00)
    {
        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }

    if (lum < 0.75)
    {
        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }

    if (lum < 0.50)
    {
        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }

    if (lum < 0.3)
    {
        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }
}
`;(function(e){st(t,e);function t(){return e.call(this,ct,lt)||this}return t})(x);var ut=function(e,t){return ut=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},ut(e,t)};function dt(e,t){ut(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var ft=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,pt=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec2 dimensions;

const float SQRT_2 = 1.414213;

const float light = 1.0;

uniform float curvature;
uniform float lineWidth;
uniform float lineContrast;
uniform bool verticalLine;
uniform float noise;
uniform float noiseSize;

uniform float vignetting;
uniform float vignettingAlpha;
uniform float vignettingBlur;

uniform float seed;
uniform float time;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void)
{
    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;
    vec2 dir = vec2(vTextureCoord.xy * filterArea.xy / dimensions - vec2(0.5, 0.5));
    
    gl_FragColor = texture2D(uSampler, vTextureCoord);
    vec3 rgb = gl_FragColor.rgb;

    if (noise > 0.0 && noiseSize > 0.0)
    {
        pixelCoord.x = floor(pixelCoord.x / noiseSize);
        pixelCoord.y = floor(pixelCoord.y / noiseSize);
        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;
        rgb += _noise * noise;
    }

    if (lineWidth > 0.0)
    {
        float _c = curvature > 0. ? curvature : 1.;
        float k = curvature > 0. ?(length(dir * dir) * 0.25 * _c * _c + 0.935 * _c) : 1.;
        vec2 uv = dir * k;

        float v = (verticalLine ? uv.x * dimensions.x : uv.y * dimensions.y) * min(1.0, 2.0 / lineWidth ) / _c;
        float j = 1. + cos(v * 1.2 - time) * 0.5 * lineContrast;
        rgb *= j;
        float segment = verticalLine ? mod((dir.x + .5) * dimensions.x, 4.) : mod((dir.y + .5) * dimensions.y, 4.);
        rgb *= 0.99 + ceil(segment) * 0.015;
    }

    if (vignetting > 0.0)
    {
        float outter = SQRT_2 - vignetting * SQRT_2;
        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);
        rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);
    }

    gl_FragColor.rgb = rgb;
}
`;(function(e){dt(t,e);function t(n){var r=e.call(this,ft,pt)||this;return r.time=0,r.seed=0,r.uniforms.dimensions=new Float32Array(2),Object.assign(r,t.defaults,n),r}return t.prototype.apply=function(e,t,n,r){var i=t.filterFrame,a=i.width,o=i.height;this.uniforms.dimensions[0]=a,this.uniforms.dimensions[1]=o,this.uniforms.seed=this.seed,this.uniforms.time=this.time,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`curvature`,{get:function(){return this.uniforms.curvature},set:function(e){this.uniforms.curvature=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`lineWidth`,{get:function(){return this.uniforms.lineWidth},set:function(e){this.uniforms.lineWidth=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`lineContrast`,{get:function(){return this.uniforms.lineContrast},set:function(e){this.uniforms.lineContrast=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`verticalLine`,{get:function(){return this.uniforms.verticalLine},set:function(e){this.uniforms.verticalLine=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`noise`,{get:function(){return this.uniforms.noise},set:function(e){this.uniforms.noise=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`noiseSize`,{get:function(){return this.uniforms.noiseSize},set:function(e){this.uniforms.noiseSize=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`vignetting`,{get:function(){return this.uniforms.vignetting},set:function(e){this.uniforms.vignetting=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`vignettingAlpha`,{get:function(){return this.uniforms.vignettingAlpha},set:function(e){this.uniforms.vignettingAlpha=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`vignettingBlur`,{get:function(){return this.uniforms.vignettingBlur},set:function(e){this.uniforms.vignettingBlur=e},enumerable:!1,configurable:!0}),t.defaults={curvature:1,lineWidth:1,lineContrast:.25,verticalLine:!1,noise:0,noiseSize:1,seed:0,vignetting:.3,vignettingAlpha:1,vignettingBlur:.3,time:0},t})(x);var mt=function(e,t){return mt=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},mt(e,t)};function ht(e,t){mt(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var gt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,_t=`precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform vec4 filterArea;
uniform sampler2D uSampler;

uniform float angle;
uniform float scale;

float pattern()
{
   float s = sin(angle), c = cos(angle);
   vec2 tex = vTextureCoord * filterArea.xy;
   vec2 point = vec2(
       c * tex.x - s * tex.y,
       s * tex.x + c * tex.y
   ) * scale;
   return (sin(point.x) * sin(point.y)) * 4.0;
}

void main()
{
   vec4 color = texture2D(uSampler, vTextureCoord);
   float average = (color.r + color.g + color.b) / 3.0;
   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);
}
`;(function(e){ht(t,e);function t(t,n){t===void 0&&(t=1),n===void 0&&(n=5);var r=e.call(this,gt,_t)||this;return r.scale=t,r.angle=n,r}return Object.defineProperty(t.prototype,`scale`,{get:function(){return this.uniforms.scale},set:function(e){this.uniforms.scale=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`angle`,{get:function(){return this.uniforms.angle},set:function(e){this.uniforms.angle=e},enumerable:!1,configurable:!0}),t})(x);var vt=function(e,t){return vt=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},vt(e,t)};function yt(e,t){vt(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var bt=function(){return bt=Object.assign||function(e){for(var t=arguments,n,r=1,i=arguments.length;r<i;r++)for(var a in n=t[r],n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a]);return e},bt.apply(this,arguments)},xt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,St=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float alpha;
uniform vec3 color;

uniform vec2 shift;
uniform vec4 inputSize;

void main(void){
    vec4 sample = texture2D(uSampler, vTextureCoord - shift * inputSize.zw);

    // Premultiply alpha
    sample.rgb = color.rgb * sample.a;

    // alpha user alpha
    sample *= alpha;

    gl_FragColor = sample;
}`,Ct=function(e){yt(t,e);function t(n){var r=e.call(this)||this;r.angle=45,r._distance=5,r._resolution=E.FILTER_RESOLUTION;var i=n?bt(bt({},t.defaults),n):t.defaults,a=i.kernels,o=i.blur,s=i.quality,c=i.pixelSize,l=i.resolution;r._tintFilter=new x(xt,St),r._tintFilter.uniforms.color=new Float32Array(4),r._tintFilter.uniforms.shift=new b,r._tintFilter.resolution=l,r._blurFilter=a?new H(a):new H(o,s),r.pixelSize=c,r.resolution=l;var u=i.shadowOnly,d=i.rotation,f=i.distance,p=i.alpha,m=i.color;return r.shadowOnly=u,r.rotation=d,r.distance=f,r.alpha=p,r.color=m,r._updatePadding(),r}return t.prototype.apply=function(e,t,n,r){var i=e.getFilterTexture();this._tintFilter.apply(e,t,i,1),this._blurFilter.apply(e,i,n,r),this.shadowOnly!==!0&&e.applyFilter(this,t,n,0),e.returnFilterTexture(i)},t.prototype._updatePadding=function(){this.padding=this.distance+this.blur*2},t.prototype._updateShift=function(){this._tintFilter.uniforms.shift.set(this.distance*Math.cos(this.angle),this.distance*Math.sin(this.angle))},Object.defineProperty(t.prototype,`resolution`,{get:function(){return this._resolution},set:function(e){this._resolution=e,this._tintFilter&&(this._tintFilter.resolution=e),this._blurFilter&&(this._blurFilter.resolution=e)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`distance`,{get:function(){return this._distance},set:function(e){this._distance=e,this._updatePadding(),this._updateShift()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`rotation`,{get:function(){return this.angle/k},set:function(e){this.angle=e*k,this._updateShift()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`alpha`,{get:function(){return this._tintFilter.uniforms.alpha},set:function(e){this._tintFilter.uniforms.alpha=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`color`,{get:function(){return S(this._tintFilter.uniforms.color)},set:function(e){j(e,this._tintFilter.uniforms.color)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`kernels`,{get:function(){return this._blurFilter.kernels},set:function(e){this._blurFilter.kernels=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blur`,{get:function(){return this._blurFilter.blur},set:function(e){this._blurFilter.blur=e,this._updatePadding()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`quality`,{get:function(){return this._blurFilter.quality},set:function(e){this._blurFilter.quality=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`pixelSize`,{get:function(){return this._blurFilter.pixelSize},set:function(e){this._blurFilter.pixelSize=e},enumerable:!1,configurable:!0}),t.defaults={rotation:45,distance:5,color:0,alpha:.5,shadowOnly:!1,kernels:null,blur:2,quality:3,pixelSize:1,resolution:E.FILTER_RESOLUTION},t}(x),wt=function(e,t){return wt=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},wt(e,t)};function Tt(e,t){wt(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Et=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Dt=`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float strength;
uniform vec4 filterArea;


void main(void)
{
	vec2 onePixel = vec2(1.0 / filterArea);

	vec4 color;

	color.rgb = vec3(0.5);

	color -= texture2D(uSampler, vTextureCoord - onePixel) * strength;
	color += texture2D(uSampler, vTextureCoord + onePixel) * strength;

	color.rgb = vec3((color.r + color.g + color.b) / 3.0);

	float alpha = texture2D(uSampler, vTextureCoord).a;

	gl_FragColor = vec4(color.rgb * alpha, alpha);
}
`;(function(e){Tt(t,e);function t(t){t===void 0&&(t=5);var n=e.call(this,Et,Dt)||this;return n.strength=t,n}return Object.defineProperty(t.prototype,`strength`,{get:function(){return this.uniforms.strength},set:function(e){this.uniforms.strength=e},enumerable:!1,configurable:!0}),t})(x);var Ot=function(e,t){return Ot=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Ot(e,t)};function kt(e,t){Ot(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var At=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,jt=`// precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;
uniform float aspect;

uniform sampler2D displacementMap;
uniform float offset;
uniform float sinDir;
uniform float cosDir;
uniform int fillMode;

uniform float seed;
uniform vec2 red;
uniform vec2 green;
uniform vec2 blue;

const int TRANSPARENT = 0;
const int ORIGINAL = 1;
const int LOOP = 2;
const int CLAMP = 3;
const int MIRROR = 4;

void main(void)
{
    vec2 coord = (vTextureCoord * filterArea.xy) / dimensions;

    if (coord.x > 1.0 || coord.y > 1.0) {
        return;
    }

    float cx = coord.x - 0.5;
    float cy = (coord.y - 0.5) * aspect;
    float ny = (-sinDir * cx + cosDir * cy) / aspect + 0.5;

    // displacementMap: repeat
    // ny = ny > 1.0 ? ny - 1.0 : (ny < 0.0 ? 1.0 + ny : ny);

    // displacementMap: mirror
    ny = ny > 1.0 ? 2.0 - ny : (ny < 0.0 ? -ny : ny);

    vec4 dc = texture2D(displacementMap, vec2(0.5, ny));

    float displacement = (dc.r - dc.g) * (offset / filterArea.x);

    coord = vTextureCoord + vec2(cosDir * displacement, sinDir * displacement * aspect);

    if (fillMode == CLAMP) {
        coord = clamp(coord, filterClamp.xy, filterClamp.zw);
    } else {
        if( coord.x > filterClamp.z ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.x -= filterClamp.z;
            } else if (fillMode == MIRROR) {
                coord.x = filterClamp.z * 2.0 - coord.x;
            }
        } else if( coord.x < filterClamp.x ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.x += filterClamp.z;
            } else if (fillMode == MIRROR) {
                coord.x *= -filterClamp.z;
            }
        }

        if( coord.y > filterClamp.w ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.y -= filterClamp.w;
            } else if (fillMode == MIRROR) {
                coord.y = filterClamp.w * 2.0 - coord.y;
            }
        } else if( coord.y < filterClamp.y ) {
            if (fillMode == TRANSPARENT) {
                discard;
            } else if (fillMode == LOOP) {
                coord.y += filterClamp.w;
            } else if (fillMode == MIRROR) {
                coord.y *= -filterClamp.w;
            }
        }
    }

    gl_FragColor.r = texture2D(uSampler, coord + red * (1.0 - seed * 0.4) / filterArea.xy).r;
    gl_FragColor.g = texture2D(uSampler, coord + green * (1.0 - seed * 0.3) / filterArea.xy).g;
    gl_FragColor.b = texture2D(uSampler, coord + blue * (1.0 - seed * 0.2) / filterArea.xy).b;
    gl_FragColor.a = texture2D(uSampler, coord).a;
}
`;(function(e){kt(t,e);function t(n){var r=e.call(this,At,jt)||this;return r.offset=100,r.fillMode=t.TRANSPARENT,r.average=!1,r.seed=0,r.minSize=8,r.sampleSize=512,r._slices=0,r._offsets=new Float32Array(1),r._sizes=new Float32Array(1),r._direction=-1,r.uniforms.dimensions=new Float32Array(2),r._canvas=document.createElement(`canvas`),r._canvas.width=4,r._canvas.height=r.sampleSize,r.texture=w.from(r._canvas,{scaleMode:M.NEAREST}),Object.assign(r,t.defaults,n),r}return t.prototype.apply=function(e,t,n,r){var i=t.filterFrame,a=i.width,o=i.height;this.uniforms.dimensions[0]=a,this.uniforms.dimensions[1]=o,this.uniforms.aspect=o/a,this.uniforms.seed=this.seed,this.uniforms.offset=this.offset,this.uniforms.fillMode=this.fillMode,e.applyFilter(this,t,n,r)},t.prototype._randomizeSizes=function(){var e=this._sizes,t=this._slices-1,n=this.sampleSize,r=Math.min(this.minSize/n,.9/this._slices);if(this.average){for(var i=this._slices,a=1,o=0;o<t;o++){var s=a/(i-o),c=Math.max(s*(1-Math.random()*.6),r);e[o]=c,a-=c}e[t]=a}else{for(var a=1,l=Math.sqrt(1/this._slices),o=0;o<t;o++){var c=Math.max(l*a*Math.random(),r);e[o]=c,a-=c}e[t]=a}this.shuffle()},t.prototype.shuffle=function(){for(var e=this._sizes,t=this._slices-1;t>0;t--){var n=Math.random()*t>>0,r=e[t];e[t]=e[n],e[n]=r}},t.prototype._randomizeOffsets=function(){for(var e=0;e<this._slices;e++)this._offsets[e]=Math.random()*(Math.random()<.5?-1:1)},t.prototype.refresh=function(){this._randomizeSizes(),this._randomizeOffsets(),this.redraw()},t.prototype.redraw=function(){var e=this.sampleSize,t=this.texture,n=this._canvas.getContext(`2d`);n.clearRect(0,0,8,e);for(var r,i=0,a=0;a<this._slices;a++){r=Math.floor(this._offsets[a]*256);var o=this._sizes[a]*e,s=r>0?r:0,c=r<0?-r:0;n.fillStyle=`rgba(`+s+`, `+c+`, 0, 1)`,n.fillRect(0,i>>0,e,o+1>>0),i+=o}t.baseTexture.update(),this.uniforms.displacementMap=t},Object.defineProperty(t.prototype,`sizes`,{get:function(){return this._sizes},set:function(e){for(var t=Math.min(this._slices,e.length),n=0;n<t;n++)this._sizes[n]=e[n]},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`offsets`,{get:function(){return this._offsets},set:function(e){for(var t=Math.min(this._slices,e.length),n=0;n<t;n++)this._offsets[n]=e[n]},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`slices`,{get:function(){return this._slices},set:function(e){this._slices!==e&&(this._slices=e,this.uniforms.slices=e,this._sizes=this.uniforms.slicesWidth=new Float32Array(e),this._offsets=this.uniforms.slicesOffset=new Float32Array(e),this.refresh())},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`direction`,{get:function(){return this._direction},set:function(e){if(this._direction!==e){this._direction=e;var t=e*k;this.uniforms.sinDir=Math.sin(t),this.uniforms.cosDir=Math.cos(t)}},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`red`,{get:function(){return this.uniforms.red},set:function(e){this.uniforms.red=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`green`,{get:function(){return this.uniforms.green},set:function(e){this.uniforms.green=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blue`,{get:function(){return this.uniforms.blue},set:function(e){this.uniforms.blue=e},enumerable:!1,configurable:!0}),t.prototype.destroy=function(){var e;(e=this.texture)==null||e.destroy(!0),this.texture=this._canvas=this.red=this.green=this.blue=this._sizes=this._offsets=null},t.defaults={slices:5,offset:100,direction:0,fillMode:0,average:!1,seed:0,red:[0,0],green:[0,0],blue:[0,0],minSize:8,sampleSize:512},t.TRANSPARENT=0,t.ORIGINAL=1,t.LOOP=2,t.CLAMP=3,t.MIRROR=4,t})(x);var Mt=function(e,t){return Mt=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Mt(e,t)};function Nt(e,t){Mt(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Pt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Ft=`varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;

uniform float outerStrength;
uniform float innerStrength;

uniform vec4 glowColor;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform bool knockout;

const float PI = 3.14159265358979323846264;

const float DIST = __DIST__;
const float ANGLE_STEP_SIZE = min(__ANGLE_STEP_SIZE__, PI * 2.0);
const float ANGLE_STEP_NUM = ceil(PI * 2.0 / ANGLE_STEP_SIZE);

const float MAX_TOTAL_ALPHA = ANGLE_STEP_NUM * DIST * (DIST + 1.0) / 2.0;

void main(void) {
    vec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);

    float totalAlpha = 0.0;

    vec2 direction;
    vec2 displaced;
    vec4 curColor;

    for (float angle = 0.0; angle < PI * 2.0; angle += ANGLE_STEP_SIZE) {
       direction = vec2(cos(angle), sin(angle)) * px;

       for (float curDistance = 0.0; curDistance < DIST; curDistance++) {
           displaced = clamp(vTextureCoord + direction * 
                   (curDistance + 1.0), filterClamp.xy, filterClamp.zw);

           curColor = texture2D(uSampler, displaced);

           totalAlpha += (DIST - curDistance) * curColor.a;
       }
    }
    
    curColor = texture2D(uSampler, vTextureCoord);

    float alphaRatio = (totalAlpha / MAX_TOTAL_ALPHA);

    float innerGlowAlpha = (1.0 - alphaRatio) * innerStrength * curColor.a;
    float innerGlowStrength = min(1.0, innerGlowAlpha);
    
    vec4 innerColor = mix(curColor, glowColor, innerGlowStrength);

    float outerGlowAlpha = alphaRatio * outerStrength * (1. - curColor.a);
    float outerGlowStrength = min(1.0 - innerColor.a, outerGlowAlpha);

    vec4 outerGlowColor = outerGlowStrength * glowColor.rgba;
    
    if (knockout) {
      float resultAlpha = outerGlowAlpha + innerGlowAlpha;
      gl_FragColor = vec4(glowColor.rgb * resultAlpha, resultAlpha);
    }
    else {
      gl_FragColor = innerColor + outerGlowColor;
    }
}
`;(function(e){Nt(t,e);function t(n){var r=this,i=Object.assign({},t.defaults,n),a=i.outerStrength,o=i.innerStrength,s=i.color,c=i.knockout,l=i.quality,u=Math.round(i.distance);return r=e.call(this,Pt,Ft.replace(/__ANGLE_STEP_SIZE__/gi,``+(1/l/u).toFixed(7)).replace(/__DIST__/gi,u.toFixed(0)+`.0`))||this,r.uniforms.glowColor=new Float32Array([0,0,0,1]),Object.assign(r,{color:s,outerStrength:a,innerStrength:o,padding:u,knockout:c}),r}return Object.defineProperty(t.prototype,`color`,{get:function(){return S(this.uniforms.glowColor)},set:function(e){j(e,this.uniforms.glowColor)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`outerStrength`,{get:function(){return this.uniforms.outerStrength},set:function(e){this.uniforms.outerStrength=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`innerStrength`,{get:function(){return this.uniforms.innerStrength},set:function(e){this.uniforms.innerStrength=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`knockout`,{get:function(){return this.uniforms.knockout},set:function(e){this.uniforms.knockout=e},enumerable:!1,configurable:!0}),t.defaults={distance:10,outerStrength:4,innerStrength:0,color:16777215,quality:.1,knockout:!1},t})(x);var It=function(e,t){return It=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},It(e,t)};function Lt(e,t){It(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Rt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,zt=`vec3 mod289(vec3 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x)
{
    return mod289(((x * 34.0) + 1.0) * x);
}
vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t)
{
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}
float turb(vec3 P, vec3 rep, float lacunarity, float gain)
{
    float sum = 0.0;
    float sc = 1.0;
    float totalgain = 1.0;
    for (float i = 0.0; i < 6.0; i++)
    {
        sum += totalgain * pnoise(P * sc, rep);
        sc *= lacunarity;
        totalgain *= gain;
    }
    return abs(sum);
}
`,Bt=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec2 dimensions;

uniform vec2 light;
uniform bool parallel;
uniform float aspect;

uniform float gain;
uniform float lacunarity;
uniform float time;
uniform float alpha;

\${perlin}

void main(void) {
    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;

    float d;

    if (parallel) {
        float _cos = light.x;
        float _sin = light.y;
        d = (_cos * coord.x) + (_sin * coord.y * aspect);
    } else {
        float dx = coord.x - light.x / dimensions.x;
        float dy = (coord.y - light.y / dimensions.y) * aspect;
        float dis = sqrt(dx * dx + dy * dy) + 0.00001;
        d = dy / dis;
    }

    vec3 dir = vec3(d, d, 0.0);

    float noise = turb(dir + vec3(time, 0.0, 62.1 + time) * 0.05, vec3(480.0, 320.0, 480.0), lacunarity, gain);
    noise = mix(noise, 0.0, 0.3);
    //fade vertically.
    vec4 mist = vec4(noise, noise, noise, 1.0) * (1.0 - coord.y);
    mist.a = 1.0;
    // apply user alpha
    mist *= alpha;

    gl_FragColor = texture2D(uSampler, vTextureCoord) + mist;

}
`;(function(e){Lt(t,e);function t(n){var r=e.call(this,Rt,Bt.replace("${perlin}",zt))||this;r.parallel=!0,r.time=0,r._angle=0,r.uniforms.dimensions=new Float32Array(2);var i=Object.assign(t.defaults,n);return r._angleLight=new b,r.angle=i.angle,r.gain=i.gain,r.lacunarity=i.lacunarity,r.alpha=i.alpha,r.parallel=i.parallel,r.center=i.center,r.time=i.time,r}return t.prototype.apply=function(e,t,n,r){var i=t.filterFrame,a=i.width,o=i.height;this.uniforms.light=this.parallel?this._angleLight:this.center,this.uniforms.parallel=this.parallel,this.uniforms.dimensions[0]=a,this.uniforms.dimensions[1]=o,this.uniforms.aspect=o/a,this.uniforms.time=this.time,this.uniforms.alpha=this.alpha,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`angle`,{get:function(){return this._angle},set:function(e){this._angle=e;var t=e*k;this._angleLight.x=Math.cos(t),this._angleLight.y=Math.sin(t)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`gain`,{get:function(){return this.uniforms.gain},set:function(e){this.uniforms.gain=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`lacunarity`,{get:function(){return this.uniforms.lacunarity},set:function(e){this.uniforms.lacunarity=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`alpha`,{get:function(){return this.uniforms.alpha},set:function(e){this.uniforms.alpha=e},enumerable:!1,configurable:!0}),t.defaults={angle:30,gain:.5,lacunarity:2.5,time:0,parallel:!0,center:[0,0],alpha:1},t})(x);var Vt=function(e,t){return Vt=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Vt(e,t)};function Ht(e,t){Vt(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Ut=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Wt=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform vec2 uVelocity;
uniform int uKernelSize;
uniform float uOffset;

const int MAX_KERNEL_SIZE = 2048;

// Notice:
// the perfect way:
//    int kernelSize = min(uKernelSize, MAX_KERNELSIZE);
// BUT in real use-case , uKernelSize < MAX_KERNELSIZE almost always.
// So use uKernelSize directly.

void main(void)
{
    vec4 color = texture2D(uSampler, vTextureCoord);

    if (uKernelSize == 0)
    {
        gl_FragColor = color;
        return;
    }

    vec2 velocity = uVelocity / filterArea.xy;
    float offset = -uOffset / length(uVelocity) - 0.5;
    int k = uKernelSize - 1;

    for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {
        if (i == k) {
            break;
        }
        vec2 bias = velocity * (float(i) / float(k) + offset);
        color += texture2D(uSampler, vTextureCoord + bias);
    }
    gl_FragColor = color / float(uKernelSize);
}
`;(function(e){Ht(t,e);function t(t,n,r){t===void 0&&(t=[0,0]),n===void 0&&(n=5),r===void 0&&(r=0);var i=e.call(this,Ut,Wt)||this;return i.kernelSize=5,i.uniforms.uVelocity=new Float32Array(2),i._velocity=new se(i.velocityChanged,i),i.setVelocity(t),i.kernelSize=n,i.offset=r,i}return t.prototype.apply=function(e,t,n,r){var i=this.velocity,a=i.x,o=i.y;this.uniforms.uKernelSize=a!==0||o!==0?this.kernelSize:0,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`velocity`,{get:function(){return this._velocity},set:function(e){this.setVelocity(e)},enumerable:!1,configurable:!0}),t.prototype.setVelocity=function(e){if(Array.isArray(e)){var t=e[0],n=e[1];this._velocity.set(t,n)}else this._velocity.copyFrom(e)},t.prototype.velocityChanged=function(){this.uniforms.uVelocity[0]=this._velocity.x,this.uniforms.uVelocity[1]=this._velocity.y,this.padding=(Math.max(Math.abs(this._velocity.x),Math.abs(this._velocity.y))>>0)+1},Object.defineProperty(t.prototype,`offset`,{get:function(){return this.uniforms.uOffset},set:function(e){this.uniforms.uOffset=e},enumerable:!1,configurable:!0}),t})(x);var Gt=function(e,t){return Gt=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Gt(e,t)};function Kt(e,t){Gt(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var qt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Jt=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float epsilon;

const int MAX_COLORS = %maxColors%;

uniform vec3 originalColors[MAX_COLORS];
uniform vec3 targetColors[MAX_COLORS];

void main(void)
{
    gl_FragColor = texture2D(uSampler, vTextureCoord);

    float alpha = gl_FragColor.a;
    if (alpha < 0.0001)
    {
      return;
    }

    vec3 color = gl_FragColor.rgb / alpha;

    for(int i = 0; i < MAX_COLORS; i++)
    {
      vec3 origColor = originalColors[i];
      if (origColor.r < 0.0)
      {
        break;
      }
      vec3 colorDiff = origColor - color;
      if (length(colorDiff) < epsilon)
      {
        vec3 targetColor = targetColors[i];
        gl_FragColor = vec4((targetColor + colorDiff) * alpha, alpha);
        return;
      }
    }
}
`;(function(e){Kt(t,e);function t(t,n,r){n===void 0&&(n=.05),r===void 0&&(r=t.length);var i=e.call(this,qt,Jt.replace(/%maxColors%/g,r.toFixed(0)))||this;return i._replacements=[],i._maxColors=0,i.epsilon=n,i._maxColors=r,i.uniforms.originalColors=new Float32Array(r*3),i.uniforms.targetColors=new Float32Array(r*3),i.replacements=t,i}return Object.defineProperty(t.prototype,`replacements`,{get:function(){return this._replacements},set:function(e){var t=this.uniforms.originalColors,n=this.uniforms.targetColors,r=e.length;if(r>this._maxColors)throw Error(`Length of replacements (`+r+`) exceeds the maximum colors length (`+this._maxColors+`)`);t[r*3]=-1;for(var i=0;i<r;i++){var a=e[i],o=a[0];typeof o==`number`?o=j(o):a[0]=S(o),t[i*3]=o[0],t[i*3+1]=o[1],t[i*3+2]=o[2];var s=a[1];typeof s==`number`?s=j(s):a[1]=S(s),n[i*3]=s[0],n[i*3+1]=s[1],n[i*3+2]=s[2]}this._replacements=e},enumerable:!1,configurable:!0}),t.prototype.refresh=function(){this.replacements=this._replacements},Object.defineProperty(t.prototype,`maxColors`,{get:function(){return this._maxColors},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`epsilon`,{get:function(){return this.uniforms.epsilon},set:function(e){this.uniforms.epsilon=e},enumerable:!1,configurable:!0}),t})(x);var Yt=function(e,t){return Yt=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Yt(e,t)};function Xt(e,t){Yt(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Zt=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Qt=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec2 dimensions;

uniform float sepia;
uniform float noise;
uniform float noiseSize;
uniform float scratch;
uniform float scratchDensity;
uniform float scratchWidth;
uniform float vignetting;
uniform float vignettingAlpha;
uniform float vignettingBlur;
uniform float seed;

const float SQRT_2 = 1.414213;
const vec3 SEPIA_RGB = vec3(112.0 / 255.0, 66.0 / 255.0, 20.0 / 255.0);

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 Overlay(vec3 src, vec3 dst)
{
    // if (dst <= 0.5) then: 2 * src * dst
    // if (dst > 0.5) then: 1 - 2 * (1 - dst) * (1 - src)
    return vec3((dst.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x)),
                (dst.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y)),
                (dst.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z)));
}


void main()
{
    gl_FragColor = texture2D(uSampler, vTextureCoord);
    vec3 color = gl_FragColor.rgb;

    if (sepia > 0.0)
    {
        float gray = (color.x + color.y + color.z) / 3.0;
        vec3 grayscale = vec3(gray);

        color = Overlay(SEPIA_RGB, grayscale);

        color = grayscale + sepia * (color - grayscale);
    }

    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;

    if (vignetting > 0.0)
    {
        float outter = SQRT_2 - vignetting * SQRT_2;
        vec2 dir = vec2(vec2(0.5, 0.5) - coord);
        dir.y *= dimensions.y / dimensions.x;
        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);
        color.rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);
    }

    if (scratchDensity > seed && scratch != 0.0)
    {
        float phase = seed * 256.0;
        float s = mod(floor(phase), 2.0);
        float dist = 1.0 / scratchDensity;
        float d = distance(coord, vec2(seed * dist, abs(s - seed * dist)));
        if (d < seed * 0.6 + 0.4)
        {
            highp float period = scratchDensity * 10.0;

            float xx = coord.x * period + phase;
            float aa = abs(mod(xx, 0.5) * 4.0);
            float bb = mod(floor(xx / 0.5), 2.0);
            float yy = (1.0 - bb) * aa + bb * (2.0 - aa);

            float kk = 2.0 * period;
            float dw = scratchWidth / dimensions.x * (0.75 + seed);
            float dh = dw * kk;

            float tine = (yy - (2.0 - dh));

            if (tine > 0.0) {
                float _sign = sign(scratch);

                tine = s * tine / period + scratch + 0.1;
                tine = clamp(tine + 1.0, 0.5 + _sign * 0.5, 1.5 + _sign * 0.5);

                color.rgb *= tine;
            }
        }
    }

    if (noise > 0.0 && noiseSize > 0.0)
    {
        vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;
        pixelCoord.x = floor(pixelCoord.x / noiseSize);
        pixelCoord.y = floor(pixelCoord.y / noiseSize);
        // vec2 d = pixelCoord * noiseSize * vec2(1024.0 + seed * 512.0, 1024.0 - seed * 512.0);
        // float _noise = snoise(d) * 0.5;
        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;
        color += _noise * noise;
    }

    gl_FragColor.rgb = color;
}
`;(function(e){Xt(t,e);function t(n,r){r===void 0&&(r=0);var i=e.call(this,Zt,Qt)||this;return i.seed=0,i.uniforms.dimensions=new Float32Array(2),typeof n==`number`?(i.seed=n,n=void 0):i.seed=r,Object.assign(i,t.defaults,n),i}return t.prototype.apply=function(e,t,n,r){this.uniforms.dimensions[0]=t.filterFrame?.width,this.uniforms.dimensions[1]=t.filterFrame?.height,this.uniforms.seed=this.seed,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`sepia`,{get:function(){return this.uniforms.sepia},set:function(e){this.uniforms.sepia=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`noise`,{get:function(){return this.uniforms.noise},set:function(e){this.uniforms.noise=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`noiseSize`,{get:function(){return this.uniforms.noiseSize},set:function(e){this.uniforms.noiseSize=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`scratch`,{get:function(){return this.uniforms.scratch},set:function(e){this.uniforms.scratch=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`scratchDensity`,{get:function(){return this.uniforms.scratchDensity},set:function(e){this.uniforms.scratchDensity=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`scratchWidth`,{get:function(){return this.uniforms.scratchWidth},set:function(e){this.uniforms.scratchWidth=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`vignetting`,{get:function(){return this.uniforms.vignetting},set:function(e){this.uniforms.vignetting=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`vignettingAlpha`,{get:function(){return this.uniforms.vignettingAlpha},set:function(e){this.uniforms.vignettingAlpha=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`vignettingBlur`,{get:function(){return this.uniforms.vignettingBlur},set:function(e){this.uniforms.vignettingBlur=e},enumerable:!1,configurable:!0}),t.defaults={sepia:.3,noise:.3,noiseSize:1,scratch:.5,scratchDensity:.3,scratchWidth:1,vignetting:.3,vignettingAlpha:1,vignettingBlur:.3},t})(x);var $t=function(e,t){return $t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},$t(e,t)};function en(e,t){$t(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var tn=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,nn=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 thickness;
uniform vec4 outlineColor;
uniform vec4 filterClamp;

const float DOUBLE_PI = 3.14159265358979323846264 * 2.;

void main(void) {
    vec4 ownColor = texture2D(uSampler, vTextureCoord);
    vec4 curColor;
    float maxAlpha = 0.;
    vec2 displaced;
    for (float angle = 0.; angle <= DOUBLE_PI; angle += \${angleStep}) {
        displaced.x = vTextureCoord.x + thickness.x * cos(angle);
        displaced.y = vTextureCoord.y + thickness.y * sin(angle);
        curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));
        maxAlpha = max(maxAlpha, curColor.a);
    }
    float resultAlpha = max(maxAlpha, ownColor.a);
    gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);
}
`;(function(e){en(t,e);function t(n,r,i){n===void 0&&(n=1),r===void 0&&(r=0),i===void 0&&(i=.1);var a=e.call(this,tn,nn.replace(/\$\{angleStep\}/,t.getAngleStep(i)))||this;return a._thickness=1,a.uniforms.thickness=new Float32Array([0,0]),a.uniforms.outlineColor=new Float32Array([0,0,0,1]),Object.assign(a,{thickness:n,color:r,quality:i}),a}return t.getAngleStep=function(e){var n=Math.max(e*t.MAX_SAMPLES,t.MIN_SAMPLES);return(Math.PI*2/n).toFixed(7)},t.prototype.apply=function(e,t,n,r){this.uniforms.thickness[0]=this._thickness/t._frame.width,this.uniforms.thickness[1]=this._thickness/t._frame.height,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`color`,{get:function(){return S(this.uniforms.outlineColor)},set:function(e){j(e,this.uniforms.outlineColor)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`thickness`,{get:function(){return this._thickness},set:function(e){this._thickness=e,this.padding=e},enumerable:!1,configurable:!0}),t.MIN_SAMPLES=1,t.MAX_SAMPLES=100,t})(x);var rn=function(e,t){return rn=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},rn(e,t)};function an(e,t){rn(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var on=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,sn=`precision mediump float;

varying vec2 vTextureCoord;

uniform vec2 size;
uniform sampler2D uSampler;

uniform vec4 filterArea;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

vec2 pixelate(vec2 coord, vec2 size)
{
	return floor( coord / size ) * size;
}

void main(void)
{
    vec2 coord = mapCoord(vTextureCoord);

    coord = pixelate(coord, size);

    coord = unmapCoord(coord);

    gl_FragColor = texture2D(uSampler, coord);
}
`;(function(e){an(t,e);function t(t){t===void 0&&(t=10);var n=e.call(this,on,sn)||this;return n.size=t,n}return Object.defineProperty(t.prototype,`size`,{get:function(){return this.uniforms.size},set:function(e){typeof e==`number`&&(e=[e,e]),this.uniforms.size=e},enumerable:!1,configurable:!0}),t})(x);var cn=function(e,t){return cn=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},cn(e,t)};function ln(e,t){cn(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var un=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,dn=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform float uRadian;
uniform vec2 uCenter;
uniform float uRadius;
uniform int uKernelSize;

const int MAX_KERNEL_SIZE = 2048;

void main(void)
{
    vec4 color = texture2D(uSampler, vTextureCoord);

    if (uKernelSize == 0)
    {
        gl_FragColor = color;
        return;
    }

    float aspect = filterArea.y / filterArea.x;
    vec2 center = uCenter.xy / filterArea.xy;
    float gradient = uRadius / filterArea.x * 0.3;
    float radius = uRadius / filterArea.x - gradient * 0.5;
    int k = uKernelSize - 1;

    vec2 coord = vTextureCoord;
    vec2 dir = vec2(center - coord);
    float dist = length(vec2(dir.x, dir.y * aspect));

    float radianStep = uRadian;
    if (radius >= 0.0 && dist > radius) {
        float delta = dist - radius;
        float gap = gradient;
        float scale = 1.0 - abs(delta / gap);
        if (scale <= 0.0) {
            gl_FragColor = color;
            return;
        }
        radianStep *= scale;
    }
    radianStep /= float(k);

    float s = sin(radianStep);
    float c = cos(radianStep);
    mat2 rotationMatrix = mat2(vec2(c, -s), vec2(s, c));

    for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {
        if (i == k) {
            break;
        }

        coord -= center;
        coord.y *= aspect;
        coord = rotationMatrix * coord;
        coord.y /= aspect;
        coord += center;

        vec4 sample = texture2D(uSampler, coord);

        // switch to pre-multiplied alpha to correctly blur transparent images
        // sample.rgb *= sample.a;

        color += sample;
    }

    gl_FragColor = color / float(uKernelSize);
}
`;(function(e){ln(t,e);function t(t,n,r,i){t===void 0&&(t=0),n===void 0&&(n=[0,0]),r===void 0&&(r=5),i===void 0&&(i=-1);var a=e.call(this,un,dn)||this;return a._angle=0,a.angle=t,a.center=n,a.kernelSize=r,a.radius=i,a}return t.prototype.apply=function(e,t,n,r){this.uniforms.uKernelSize=this._angle===0?0:this.kernelSize,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`angle`,{get:function(){return this._angle},set:function(e){this._angle=e,this.uniforms.uRadian=e*Math.PI/180},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`center`,{get:function(){return this.uniforms.uCenter},set:function(e){this.uniforms.uCenter=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`radius`,{get:function(){return this.uniforms.uRadius},set:function(e){(e<0||e===1/0)&&(e=-1),this.uniforms.uRadius=e},enumerable:!1,configurable:!0}),t})(x);var fn=function(e,t){return fn=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},fn(e,t)};function pn(e,t){fn(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var mn=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,hn=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec4 filterClamp;
uniform vec2 dimensions;

uniform bool mirror;
uniform float boundary;
uniform vec2 amplitude;
uniform vec2 waveLength;
uniform vec2 alpha;
uniform float time;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void)
{
    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;
    vec2 coord = pixelCoord / dimensions;

    if (coord.y < boundary) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
        return;
    }

    float k = (coord.y - boundary) / (1. - boundary + 0.0001);
    float areaY = boundary * dimensions.y / filterArea.y;
    float v = areaY + areaY - vTextureCoord.y;
    float y = mirror ? v : vTextureCoord.y;

    float _amplitude = ((amplitude.y - amplitude.x) * k + amplitude.x ) / filterArea.x;
    float _waveLength = ((waveLength.y - waveLength.x) * k + waveLength.x) / filterArea.y;
    float _alpha = (alpha.y - alpha.x) * k + alpha.x;

    float x = vTextureCoord.x + cos(v * 6.28 / _waveLength - time) * _amplitude;
    x = clamp(x, filterClamp.x, filterClamp.z);

    vec4 color = texture2D(uSampler, vec2(x, y));

    gl_FragColor = color * _alpha;
}
`;(function(e){pn(t,e);function t(n){var r=e.call(this,mn,hn)||this;return r.time=0,r.uniforms.amplitude=new Float32Array(2),r.uniforms.waveLength=new Float32Array(2),r.uniforms.alpha=new Float32Array(2),r.uniforms.dimensions=new Float32Array(2),Object.assign(r,t.defaults,n),r}return t.prototype.apply=function(e,t,n,r){this.uniforms.dimensions[0]=t.filterFrame?.width,this.uniforms.dimensions[1]=t.filterFrame?.height,this.uniforms.time=this.time,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`mirror`,{get:function(){return this.uniforms.mirror},set:function(e){this.uniforms.mirror=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`boundary`,{get:function(){return this.uniforms.boundary},set:function(e){this.uniforms.boundary=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`amplitude`,{get:function(){return this.uniforms.amplitude},set:function(e){this.uniforms.amplitude[0]=e[0],this.uniforms.amplitude[1]=e[1]},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`waveLength`,{get:function(){return this.uniforms.waveLength},set:function(e){this.uniforms.waveLength[0]=e[0],this.uniforms.waveLength[1]=e[1]},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`alpha`,{get:function(){return this.uniforms.alpha},set:function(e){this.uniforms.alpha[0]=e[0],this.uniforms.alpha[1]=e[1]},enumerable:!1,configurable:!0}),t.defaults={mirror:!0,boundary:.5,amplitude:[0,20],waveLength:[30,100],alpha:[1,1],time:0},t})(x);var gn=function(e,t){return gn=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},gn(e,t)};function _n(e,t){gn(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var vn=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,yn=`precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec2 red;
uniform vec2 green;
uniform vec2 blue;

void main(void)
{
   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/filterArea.xy).r;
   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/filterArea.xy).g;
   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/filterArea.xy).b;
   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;
}
`;(function(e){_n(t,e);function t(t,n,r){t===void 0&&(t=[-10,0]),n===void 0&&(n=[0,10]),r===void 0&&(r=[0,0]);var i=e.call(this,vn,yn)||this;return i.red=t,i.green=n,i.blue=r,i}return Object.defineProperty(t.prototype,`red`,{get:function(){return this.uniforms.red},set:function(e){this.uniforms.red=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`green`,{get:function(){return this.uniforms.green},set:function(e){this.uniforms.green=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`blue`,{get:function(){return this.uniforms.blue},set:function(e){this.uniforms.blue=e},enumerable:!1,configurable:!0}),t})(x);var bn=function(e,t){return bn=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},bn(e,t)};function xn(e,t){bn(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Sn=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Cn=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec4 filterClamp;

uniform vec2 center;

uniform float amplitude;
uniform float wavelength;
// uniform float power;
uniform float brightness;
uniform float speed;
uniform float radius;

uniform float time;

const float PI = 3.14159;

void main()
{
    float halfWavelength = wavelength * 0.5 / filterArea.x;
    float maxRadius = radius / filterArea.x;
    float currentRadius = time * speed / filterArea.x;

    float fade = 1.0;

    if (maxRadius > 0.0) {
        if (currentRadius > maxRadius) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
            return;
        }
        fade = 1.0 - pow(currentRadius / maxRadius, 2.0);
    }

    vec2 dir = vec2(vTextureCoord - center / filterArea.xy);
    dir.y *= filterArea.y / filterArea.x;
    float dist = length(dir);

    if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
        return;
    }

    vec2 diffUV = normalize(dir);

    float diff = (dist - currentRadius) / halfWavelength;

    float p = 1.0 - pow(abs(diff), 2.0);

    // float powDiff = diff * pow(p, 2.0) * ( amplitude * fade );
    float powDiff = 1.25 * sin(diff * PI) * p * ( amplitude * fade );

    vec2 offset = diffUV * powDiff / filterArea.xy;

    // Do clamp :
    vec2 coord = vTextureCoord + offset;
    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);
    vec4 color = texture2D(uSampler, clampedCoord);
    if (coord != clampedCoord) {
        color *= max(0.0, 1.0 - length(coord - clampedCoord));
    }

    // No clamp :
    // gl_FragColor = texture2D(uSampler, vTextureCoord + offset);

    color.rgb *= 1.0 + (brightness - 1.0) * p * fade;

    gl_FragColor = color;
}
`;(function(e){xn(t,e);function t(n,r,i){n===void 0&&(n=[0,0]),i===void 0&&(i=0);var a=e.call(this,Sn,Cn)||this;return a.center=n,Object.assign(a,t.defaults,r),a.time=i,a}return t.prototype.apply=function(e,t,n,r){this.uniforms.time=this.time,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`center`,{get:function(){return this.uniforms.center},set:function(e){this.uniforms.center=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`amplitude`,{get:function(){return this.uniforms.amplitude},set:function(e){this.uniforms.amplitude=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`wavelength`,{get:function(){return this.uniforms.wavelength},set:function(e){this.uniforms.wavelength=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`brightness`,{get:function(){return this.uniforms.brightness},set:function(e){this.uniforms.brightness=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`speed`,{get:function(){return this.uniforms.speed},set:function(e){this.uniforms.speed=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`radius`,{get:function(){return this.uniforms.radius},set:function(e){this.uniforms.radius=e},enumerable:!1,configurable:!0}),t.defaults={amplitude:30,wavelength:160,brightness:1,speed:500,radius:-1},t})(x);var wn=function(e,t){return wn=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},wn(e,t)};function Tn(e,t){wn(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var En=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Dn=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uLightmap;
uniform vec4 filterArea;
uniform vec2 dimensions;
uniform vec4 ambientColor;
void main() {
    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);
    vec2 lightCoord = (vTextureCoord * filterArea.xy) / dimensions;
    vec4 light = texture2D(uLightmap, lightCoord);
    vec3 ambient = ambientColor.rgb * ambientColor.a;
    vec3 intensity = ambient + light.rgb;
    vec3 finalColor = diffuseColor.rgb * intensity;
    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;(function(e){Tn(t,e);function t(t,n,r){n===void 0&&(n=0),r===void 0&&(r=1);var i=e.call(this,En,Dn)||this;return i._color=0,i.uniforms.dimensions=new Float32Array(2),i.uniforms.ambientColor=new Float32Array([0,0,0,r]),i.texture=t,i.color=n,i}return t.prototype.apply=function(e,t,n,r){this.uniforms.dimensions[0]=t.filterFrame?.width,this.uniforms.dimensions[1]=t.filterFrame?.height,e.applyFilter(this,t,n,r)},Object.defineProperty(t.prototype,`texture`,{get:function(){return this.uniforms.uLightmap},set:function(e){this.uniforms.uLightmap=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`color`,{get:function(){return this._color},set:function(e){var t=this.uniforms.ambientColor;typeof e==`number`?(j(e,t),this._color=e):(t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],this._color=S(t))},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`alpha`,{get:function(){return this.uniforms.ambientColor[3]},set:function(e){this.uniforms.ambientColor[3]=e},enumerable:!1,configurable:!0}),t})(x);var On=function(e,t){return On=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},On(e,t)};function kn(e,t){On(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var An=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,jn=`varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float blur;
uniform float gradientBlur;
uniform vec2 start;
uniform vec2 end;
uniform vec2 delta;
uniform vec2 texSize;

float random(vec3 scale, float seed)
{
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main(void)
{
    vec4 color = vec4(0.0);
    float total = 0.0;

    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));
    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;

    for (float t = -30.0; t <= 30.0; t++)
    {
        float percent = (t + offset - 0.5) / 30.0;
        float weight = 1.0 - abs(percent);
        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);
        sample.rgb *= sample.a;
        color += sample * weight;
        total += weight;
    }

    color /= total;
    color.rgb /= color.a + 0.00001;

    gl_FragColor = color;
}
`,Mn=function(e){kn(t,e);function t(t,n,r,i){t===void 0&&(t=100),n===void 0&&(n=600);var a=e.call(this,An,jn)||this;return a.uniforms.blur=t,a.uniforms.gradientBlur=n,a.uniforms.start=r||new b(0,window.innerHeight/2),a.uniforms.end=i||new b(600,window.innerHeight/2),a.uniforms.delta=new b(30,30),a.uniforms.texSize=new b(window.innerWidth,window.innerHeight),a.updateDelta(),a}return t.prototype.updateDelta=function(){this.uniforms.delta.x=0,this.uniforms.delta.y=0},Object.defineProperty(t.prototype,`blur`,{get:function(){return this.uniforms.blur},set:function(e){this.uniforms.blur=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`gradientBlur`,{get:function(){return this.uniforms.gradientBlur},set:function(e){this.uniforms.gradientBlur=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`start`,{get:function(){return this.uniforms.start},set:function(e){this.uniforms.start=e,this.updateDelta()},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`end`,{get:function(){return this.uniforms.end},set:function(e){this.uniforms.end=e,this.updateDelta()},enumerable:!1,configurable:!0}),t}(x),Nn=function(e){kn(t,e);function t(){return e!==null&&e.apply(this,arguments)||this}return t.prototype.updateDelta=function(){var e=this.uniforms.end.x-this.uniforms.start.x,t=this.uniforms.end.y-this.uniforms.start.y,n=Math.sqrt(e*e+t*t);this.uniforms.delta.x=e/n,this.uniforms.delta.y=t/n},t}(Mn),Pn=function(e){kn(t,e);function t(){return e!==null&&e.apply(this,arguments)||this}return t.prototype.updateDelta=function(){var e=this.uniforms.end.x-this.uniforms.start.x,t=this.uniforms.end.y-this.uniforms.start.y,n=Math.sqrt(e*e+t*t);this.uniforms.delta.x=-t/n,this.uniforms.delta.y=e/n},t}(Mn);(function(e){kn(t,e);function t(t,n,r,i){t===void 0&&(t=100),n===void 0&&(n=600);var a=e.call(this)||this;return a.tiltShiftXFilter=new Nn(t,n,r,i),a.tiltShiftYFilter=new Pn(t,n,r,i),a}return t.prototype.apply=function(e,t,n,r){var i=e.getFilterTexture();this.tiltShiftXFilter.apply(e,t,i,1),this.tiltShiftYFilter.apply(e,i,n,r),e.returnFilterTexture(i)},Object.defineProperty(t.prototype,`blur`,{get:function(){return this.tiltShiftXFilter.blur},set:function(e){this.tiltShiftXFilter.blur=this.tiltShiftYFilter.blur=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`gradientBlur`,{get:function(){return this.tiltShiftXFilter.gradientBlur},set:function(e){this.tiltShiftXFilter.gradientBlur=this.tiltShiftYFilter.gradientBlur=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`start`,{get:function(){return this.tiltShiftXFilter.start},set:function(e){this.tiltShiftXFilter.start=this.tiltShiftYFilter.start=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`end`,{get:function(){return this.tiltShiftXFilter.end},set:function(e){this.tiltShiftXFilter.end=this.tiltShiftYFilter.end=e},enumerable:!1,configurable:!0}),t})(x);var Fn=function(e,t){return Fn=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Fn(e,t)};function In(e,t){Fn(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var Ln=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Rn=`varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float radius;
uniform float angle;
uniform vec2 offset;
uniform vec4 filterArea;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

vec2 twist(vec2 coord)
{
    coord -= offset;

    float dist = length(coord);

    if (dist < radius)
    {
        float ratioDist = (radius - dist) / radius;
        float angleMod = ratioDist * ratioDist * angle;
        float s = sin(angleMod);
        float c = cos(angleMod);
        coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
    }

    coord += offset;

    return coord;
}

void main(void)
{

    vec2 coord = mapCoord(vTextureCoord);

    coord = twist(coord);

    coord = unmapCoord(coord);

    gl_FragColor = texture2D(uSampler, coord );

}
`;(function(e){In(t,e);function t(n){var r=e.call(this,Ln,Rn)||this;return Object.assign(r,t.defaults,n),r}return Object.defineProperty(t.prototype,`offset`,{get:function(){return this.uniforms.offset},set:function(e){this.uniforms.offset=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`radius`,{get:function(){return this.uniforms.radius},set:function(e){this.uniforms.radius=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`angle`,{get:function(){return this.uniforms.angle},set:function(e){this.uniforms.angle=e},enumerable:!1,configurable:!0}),t.defaults={radius:200,angle:4,padding:20,offset:new b},t})(x);var zn=function(e,t){return zn=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},zn(e,t)};function Bn(e,t){zn(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}function Vn(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols==`function`)for(var i=0,r=Object.getOwnPropertySymbols(e);i<r.length;i++)t.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(e,r[i])&&(n[r[i]]=e[r[i]]);return n}var Hn=`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`,Un=`varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform vec2 uCenter;
uniform float uStrength;
uniform float uInnerRadius;
uniform float uRadius;

const float MAX_KERNEL_SIZE = \${maxKernelSize};

// author: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(vec2 co, float seed) {
    const highp float a = 12.9898, b = 78.233, c = 43758.5453;
    highp float dt = dot(co + seed, vec2(a, b)), sn = mod(dt, 3.14159);
    return fract(sin(sn) * c + seed);
}

void main() {

    float minGradient = uInnerRadius * 0.3;
    float innerRadius = (uInnerRadius + minGradient * 0.5) / filterArea.x;

    float gradient = uRadius * 0.3;
    float radius = (uRadius - gradient * 0.5) / filterArea.x;

    float countLimit = MAX_KERNEL_SIZE;

    vec2 dir = vec2(uCenter.xy / filterArea.xy - vTextureCoord);
    float dist = length(vec2(dir.x, dir.y * filterArea.y / filterArea.x));

    float strength = uStrength;

    float delta = 0.0;
    float gap;
    if (dist < innerRadius) {
        delta = innerRadius - dist;
        gap = minGradient;
    } else if (radius >= 0.0 && dist > radius) { // radius < 0 means it's infinity
        delta = dist - radius;
        gap = gradient;
    }

    if (delta > 0.0) {
        float normalCount = gap / filterArea.x;
        delta = (normalCount - delta) / normalCount;
        countLimit *= delta;
        strength *= delta;
        if (countLimit < 1.0)
        {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
            return;
        }
    }

    // randomize the lookup values to hide the fixed number of samples
    float offset = rand(vTextureCoord, 0.0);

    float total = 0.0;
    vec4 color = vec4(0.0);

    dir *= strength;

    for (float t = 0.0; t < MAX_KERNEL_SIZE; t++) {
        float percent = (t + offset) / MAX_KERNEL_SIZE;
        float weight = 4.0 * (percent - percent * percent);
        vec2 p = vTextureCoord + dir * percent;
        vec4 sample = texture2D(uSampler, p);

        // switch to pre-multiplied alpha to correctly blur transparent images
        // sample.rgb *= sample.a;

        color += sample * weight;
        total += weight;

        if (t > countLimit){
            break;
        }
    }

    color /= total;
    // switch back from pre-multiplied alpha
    // color.rgb /= color.a + 0.00001;

    gl_FragColor = color;
}
`;(function(e){Bn(t,e);function t(n){var r=this,i=Object.assign(t.defaults,n),a=i.maxKernelSize,o=Vn(i,[`maxKernelSize`]);return r=e.call(this,Hn,Un.replace("${maxKernelSize}",a.toFixed(1)))||this,Object.assign(r,o),r}return Object.defineProperty(t.prototype,`center`,{get:function(){return this.uniforms.uCenter},set:function(e){this.uniforms.uCenter=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`strength`,{get:function(){return this.uniforms.uStrength},set:function(e){this.uniforms.uStrength=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`innerRadius`,{get:function(){return this.uniforms.uInnerRadius},set:function(e){this.uniforms.uInnerRadius=e},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,`radius`,{get:function(){return this.uniforms.uRadius},set:function(e){(e<0||e===1/0)&&(e=-1),this.uniforms.uRadius=e},enumerable:!1,configurable:!0}),t.defaults={strength:.1,center:[0,0],innerRadius:0,radius:-1,maxKernelSize:32},t})(x);function Wn(){let e=-1,t,n=-1;function r(r,i){(i>=e||i<n)&&(t=[O.randFloat(-1,1),O.randFloat(-1,.7)],n=i,e=i+_e()/1e3,r.focusController.focus(t[0]*.5,t[1]*.5,!1)),r.focusController.update(i-n);let a=r.coreModel;a.setParameterValueById(`ParamEyeBallX`,O.lerp(a.getParameterValueById(`ParamEyeBallX`),t[0],.3)),a.setParameterValueById(`ParamEyeBallY`,O.lerp(a.getParameterValueById(`ParamEyeBallY`),t[1],.3))}return{update:r}}var Gn={"punchy-v":{topYaw:10,topRoll:8,bottomDip:4,pattern:`v`},"balanced-v":{topYaw:6,topRoll:0,bottomDip:6,pattern:`v`},"swing-lr":{topYaw:8,topRoll:0,bottomDip:6,swingLift:8,pattern:`swing`},"sway-sine":{topYaw:10,topRoll:0,bottomDip:0,swingLift:10,pattern:`sway`}};function Kn(e){let{baseAngles:t,releaseDelayMs:n=1800,defaultIntervalMs:r=600,styles:i={},initialStyle:a=`punchy-v`,autoStyleShift:s=!1}=e,c={...Gn,...i},l=o(0),d=o(0),f=o(0),p=o(0),m=o(0),h=o(0),g=o([]),_=o(`left`),v=o(!1),y=o(!1),b=o(null),x=o(null),S=o(null),C=o(a),w=o(s),T=u(()=>t());function E(e,t,n){return e+(t-e)*n}function ee(e){return 1-(1-e)**3}function te(){return c[C.value]||Gn[`punchy-v`]}function D(e){let{topYaw:t,topRoll:n,swingLift:r,pattern:i}=te(),a=e===`left`?-1:1,o=i===`swing`||i===`sway`?r??n:n,s=T.value.z+(i===`swing`||i===`sway`?o:a*o);return{y:T.value.y+a*t,z:s}}function O(){let{bottomDip:e}=te();return{y:T.value.y,z:T.value.z-e}}function k(e){let t=d.value,r=f.value;for(!v.value&&!g.value.length&&(t=T.value.y,r=T.value.z),t??=T.value.y,r??=T.value.z;g.value.length;){let n=g.value[0];if(e<n.start){t=n.fromY,r=n.fromZ;break}let i=Math.min(1,(e-n.start)/Math.max(n.duration,1)),a=ee(i);if(t=E(n.fromY,n.toY,a),r=E(n.fromZ,n.toZ,a),i>=1){g.value.shift();continue}break}let i=b.value,a=v.value&&i!=null?e-i:1/0;v.value&&!g.value.length&&a>n&&(v.value=!1,y.value=!1,_.value=`left`,g.value=[],b.value=null,t=T.value.y,r=T.value.z,m.value*=.5,h.value*=.5),d.value=t,f.value=r}function A(e){let t=e!=null&&Number.isFinite(e)?Number(e):typeof performance<`u`?performance.now():Date.now();if(k(t),!v.value){v.value=!0,b.value=t;return}let n=Math.min(2e3,Math.max(220,b.value==null?r:t-b.value));if(b.value=t,x.value=n,S.value=S.value==null?n:S.value*.7+n*.3,w.value&&S.value){let e=6e4/S.value,t=e<120?`swing-lr`:e<180?`balanced-v`:`punchy-v`;t!==C.value&&(C.value=t)}let i=Math.max(80,n/2),a={y:d.value,z:f.value};g.value=[];let o=te(),s=_.value===`left`?`right`:`left`;if(o.pattern===`v`){if(!y.value){let e=D(`left`);g.value.push({start:t,duration:i,fromY:a.y,fromZ:a.z,toY:e.y,toZ:e.z}),y.value=!0,_.value=`left`;return}let e=O(),n=D(s);g.value.push({start:t,duration:i,fromY:a.y,fromZ:a.z,toY:e.y,toZ:e.z}),g.value.push({start:t+i,duration:i,fromY:e.y,fromZ:e.z,toY:n.y,toZ:n.z}),_.value=s}else if(o.pattern===`swing`){let e=_.value,r=D(e),i=D(s),o=Math.max(60,n*.35),c=Math.max(60,n-o);g.value.push({start:t,duration:o,fromY:a.y,fromZ:a.z,toY:r.y,toZ:r.z}),g.value.push({start:t+o,duration:c,fromY:r.y,fromZ:r.z,toY:i.y,toZ:i.z}),y.value=!0,_.value=s}else if(o.pattern===`sway`){let e=_.value,r=D(e),c=D(s),l={y:T.value.y,z:T.value.z},u=o.swingLift??10;if(!y.value){g.value.push({start:t,duration:i,fromY:a.y,fromZ:a.z,toY:r.y,toZ:r.z}),y.value=!0,_.value=e;return}let d={y:0,z:l.z+u},f=Math.max(60,n*.5),p=Math.max(60,n-f);g.value.push({start:t,duration:f,fromY:a.y,fromZ:a.z,toY:d.y,toZ:d.z}),g.value.push({start:t+f,duration:p,fromY:d.y,fromZ:d.z,toY:c.y,toZ:c.z}),y.value=!0,_.value=s}}return{targetX:l,targetY:d,targetZ:f,velocityX:p,velocityY:m,velocityZ:h,updateTargets:k,scheduleBeat:A,setStyle:e=>{C.value=e},getStyle:()=>C.value,setAutoStyleShift:e=>{w.value=e},debugState:()=>({primed:v.value,patternStarted:y.value,lastBeatTimestamp:b.value,lastInterval:x.value,avgInterval:S.value,bpm:S.value?6e4/S.value:null,style:C.value,segments:[...g.value]})}}function qn(e){return`expression-defaults:${e}`}function Jn(e){try{let t=localStorage.getItem(qn(e));return t?JSON.parse(t):null}catch{return null}}function Yn(e,t){try{localStorage.setItem(qn(e),JSON.stringify(t))}catch(e){console.warn(`[expression-store] Failed to persist defaults:`,e)}}var Xn=le(`live2d-expressions`,()=>{let e=o(new Map),t=o(``),n=o(new Map),r=o(`none`),i=o(new Map);function a(){for(let t of e.value.values())t.resetTimer!=null&&(clearTimeout(t.resetTimer),t.resetTimer=void 0)}function s(e){return{name:e.name,value:e.currentValue,default:e.defaultValue,active:e.currentValue!==e.defaultValue,autoResetAt:e.resetTimer==null?void 0:Date.now()}}function c(){return Array.from(e.value.keys())}function l(r,i,o){a(),e.value=new Map,n.value=new Map,t.value=r;for(let e of i)n.value.set(e.name,e);for(let t of o)e.value.set(t.name,{...t});let s=Jn(r);if(s)for(let[t,n]of Object.entries(s)){let r=e.value.get(t);r&&(r.defaultValue=n,r.currentValue=n)}}function u(t){let r=n.value.get(t);if(r)return{kind:`group`,group:r};let i=e.value.get(t);return i?{kind:`param`,entry:i}:null}function d(t,n,r){let i=u(t);if(!i)return{success:!1,error:`Expression or parameter "${t}" not found.`,available:c()};let a=typeof n==`boolean`?n?1:0:n;if(i.kind===`group`){let t=[];for(let n of i.group.parameters){let i=e.value.get(n.parameterId);i&&(b(i,a,r),t.push(s(i)))}return{success:!0,state:t}}return b(i.entry,a,r),{success:!0,state:s(i.entry)}}function f(t){if(!t){let t=[];for(let n of e.value.values())t.push(s(n));return{success:!0,state:t}}let n=u(t);if(!n)return{success:!1,error:`Expression or parameter "${t}" not found.`,available:c()};if(n.kind===`group`){let t=[];for(let r of n.group.parameters){let n=e.value.get(r.parameterId);n&&t.push(s(n))}return{success:!0,state:t}}return{success:!0,state:s(n.entry)}}function p(t,n){let r=u(t);if(!r)return{success:!1,error:`Expression or parameter "${t}" not found.`,available:c()};if(r.kind===`group`){let t=r.group.parameters.some(t=>{if(t.value===0)return!1;let n=e.value.get(t.parameterId);return n&&n.currentValue===t.value}),i=[];for(let a of r.group.parameters){let r=e.value.get(a.parameterId);r&&(b(r,t?r.modelDefault:a.value,n),i.push(s(r)))}return{success:!0,state:i}}let i=r.entry;return b(i,i.currentValue===i.modelDefault?i.targetValue:i.modelDefault,n),{success:!0,state:s(i)}}function m(){if(!t.value)return{success:!1,error:`No model loaded.`};let n={};for(let[t,r]of e.value)r.defaultValue=r.currentValue,n[t]=r.currentValue;return Yn(t.value,n),{success:!0}}function h(){a();let t=[];for(let n of e.value.values())n.currentValue=n.modelDefault,t.push(s(n));return{success:!0,state:t}}function g(){a(),e.value=new Map,n.value=new Map,r.value=`none`,i.value=new Map,t.value=``}function _(e){r.value=e}function v(e,t){i.value.set(e,t)}function y(e){return r.value===`all`?!0:r.value===`none`?!1:i.value.get(e)??!1}function b(e,t,n){if(e.resetTimer!=null&&(clearTimeout(e.resetTimer),e.resetTimer=void 0),e.currentValue=t,n&&n>0){let t=e.defaultValue;e.resetTimer=setTimeout(()=>{e.currentValue=t,e.resetTimer=void 0},n*1e3)}}return{expressions:e,modelId:t,expressionGroups:n,llmMode:r,llmExposed:i,registerExpressions:l,resolve:u,set:d,get:f,toggle:p,saveDefaults:m,resetAll:h,dispose:g,setLlmMode:_,setLlmExposed:v,isExposedToLlm:y}});function Zn(e){let t=Xn(),n=new Set;async function r(n,r){let i=[],a=new Map;for(let e of n)try{let t=await r(e.File),n=JSON.parse(t),o=[];for(let e of n.Parameters){let t=l(e.Blend);if(o.push({parameterId:e.Id,blend:t,value:e.Value}),!a.has(e.Id)){let n=u(e.Id);a.set(e.Id,{name:e.Id,parameterId:e.Id,blend:t,currentValue:n,defaultValue:n,modelDefault:n,targetValue:e.Value})}else if(e.Value!==0){let t=a.get(e.Id);t.targetValue===0&&(t.targetValue=e.Value)}}i.push({name:e.Name,parameters:o})}catch(t){console.warn(`[expression-controller] Failed to parse exp3 for "${e.Name}" (${e.File}):`,t)}t.registerExpressions(e.modelId??`unknown`,i,Array.from(a.values()))}function i(e){let r=new Set;for(let n of t.expressions.values()){if(a(n))continue;let t=o(n,e);e.setParameterValueById(n.parameterId,t),r.add(n.parameterId)}for(let t of n)if(!r.has(t)){let n=s(t);n&&e.setParameterValueById(t,n.modelDefault)}n.clear();for(let e of r)n.add(e)}function a(e){switch(e.blend){case`Add`:return e.currentValue===0;case`Multiply`:return e.currentValue===1;default:return e.currentValue===e.modelDefault}}function o(e,t){switch(e.blend){case`Add`:return e.modelDefault+e.currentValue;case`Multiply`:return t.getParameterValueById(e.parameterId)*e.currentValue;default:return e.currentValue}}function s(e){for(let n of t.expressions.values())if(n.parameterId===e)return n}function c(){t.dispose()}function l(e){switch(e){case`Add`:return`Add`;case`Multiply`:return`Multiply`;default:return`Overwrite`}}function u(t){let n=e.internalModel.value;if(!n)return 0;try{let e=n.coreModel.getParameterDefaultValueById;if(typeof e==`function`){let r=e.call(n.coreModel,t);if(r!=null)return r}return n.coreModel.getParameterValueById(t)??0}catch{return 0}}return{initialise:r,applyExpressions:i,dispose:c}}function Qn(e){let{internalModel:t,motionManager:n,modelParameters:r,live2dIdleAnimationEnabled:i,live2dAutoBlinkEnabled:a,live2dForceAutoBlinkEnabled:o,lastUpdateTime:s}=e,c=[],l=[],u=[];function d(e,t=`pre`){t===`pre`?c.push(e):t===`final`?u.push(e):l.push(e)}function f(e,t){for(let n of e){if(t.handled)break;n(t)}}function p(e,d,p){let m=s.value?d-s.value:0,h=localStorage.getItem(`selected-runtime-motion-group`),g={model:e,now:d,timeDelta:m,hookedUpdate:p,internalModel:t,motionManager:n,modelParameters:r,live2dIdleAnimationEnabled:i,live2dAutoBlinkEnabled:a,live2dForceAutoBlinkEnabled:o,isIdleMotion:!n.state.currentGroup||n.state.currentGroup===n.groups.idle||!!h&&n.state.currentGroup===h,handled:!1,markHandled:()=>{g.handled=!0}};f(c,g),!g.handled&&g.hookedUpdate&&g.hookedUpdate.call(n,e,d)&&(g.handled=!0),f(l,g);for(let e of u)e(g);return s.value=d,g.handled}return{register:d,hookUpdate:p}}function $n(e){return t=>{e.updateTargets(t.now);let n=t.model.getParameterValueById(`ParamAngleX`),r=t.model.getParameterValueById(`ParamAngleY`),i=t.model.getParameterValueById(`ParamAngleZ`);{let r=e.targetX.value,i=n,a=e.velocityX.value,o=(120*(r-i)-16*a)/1;e.velocityX.value=a+o*t.timeDelta,n=i+e.velocityX.value*t.timeDelta,Math.abs(r-n)<.01&&Math.abs(e.velocityX.value)<.01&&(n=r,e.velocityX.value=0)}{let n=e.targetY.value,i=r,a=e.velocityY.value,o=(120*(n-i)-16*a)/1;e.velocityY.value=a+o*t.timeDelta,r=i+e.velocityY.value*t.timeDelta,Math.abs(n-r)<.01&&Math.abs(e.velocityY.value)<.01&&(r=n,e.velocityY.value=0)}{let n=e.targetZ.value,r=i,a=e.velocityZ.value,o=(120*(n-r)-16*a)/1;e.velocityZ.value=a+o*t.timeDelta,i=r+e.velocityZ.value*t.timeDelta,Math.abs(n-i)<.01&&Math.abs(e.velocityZ.value)<.01&&(i=n,e.velocityZ.value=0)}t.model.setParameterValueById(`ParamAngleX`,n),t.model.setParameterValueById(`ParamAngleY`,r),t.model.setParameterValueById(`ParamAngleZ`,i)}}function er(e=Wn()){return t=>{t.handled||!t.live2dIdleAnimationEnabled.value&&t.isIdleMotion&&(t.motionManager.stopAllMotions(),e.update(t.internalModel,t.now),t.internalModel.eyeBlink!=null&&t.internalModel.eyeBlink.updateParameters(t.model,t.timeDelta/1e3),t.model.setParameterValueById(`ParamEyeLOpen`,t.modelParameters.value.leftEyeOpen),t.model.setParameterValueById(`ParamEyeROpen`,t.modelParameters.value.rightEyeOpen),t.markHandled())}}function tr(e=Wn()){return t=>{!t.isIdleMotion||t.handled||e.update(t.internalModel,t.now)}}function nr(e){let t={phase:`idle`,progress:0,startLeft:1,startRight:1,delayMs:0},n=1,r=1,i=3e3,a=e=>Math.min(1,Math.max(0,e));function o(){t.phase=`idle`,t.progress=0,t.delayMs=i+Math.random()*(8e3-i)}o();function s(e){return 1-(1-e)*(1-e)}function c(e){return e*e}function l(e,n,r){if(t.phase===`idle`)return t.delayMs=Math.max(0,t.delayMs-e),t.delayMs===0&&(t.phase=`closing`,t.progress=0,t.startLeft=n,t.startRight=r),{eyeLOpen:n,eyeROpen:r};if(t.phase===`closing`){t.progress=Math.min(1,t.progress+e/75);let n=s(t.progress),r=a(t.startLeft*(1-n)),i=a(t.startRight*(1-n));return t.progress>=1&&(t.phase=`opening`,t.progress=0),{eyeLOpen:r,eyeROpen:i}}t.progress=Math.min(1,t.progress+e/75);let i=c(t.progress),l=a(t.startLeft*i),u=a(t.startRight*i);return t.progress>=1&&o(),{eyeLOpen:l,eyeROpen:u}}return i=>{if(!e?.value){if(!i.isIdleMotion||i.handled)return;let e=a(i.modelParameters.value.leftEyeOpen),t=a(i.modelParameters.value.rightEyeOpen);if(!i.live2dAutoBlinkEnabled.value){o(),i.model.setParameterValueById(`ParamEyeLOpen`,e),i.model.setParameterValueById(`ParamEyeROpen`,t),i.markHandled();return}if(i.live2dForceAutoBlinkEnabled.value||!i.internalModel.eyeBlink){let n=Math.max(i.timeDelta??0,0),{eyeLOpen:r,eyeROpen:a}=l((n<5?n*1e3:n)||16,e,t);i.model.setParameterValueById(`ParamEyeLOpen`,r),i.model.setParameterValueById(`ParamEyeROpen`,a),i.markHandled();return}i.internalModel.eyeBlink.updateParameters(i.model,i.timeDelta/1e3);let n=i.model.getParameterValueById(`ParamEyeLOpen`),r=i.model.getParameterValueById(`ParamEyeROpen`);i.model.setParameterValueById(`ParamEyeLOpen`,a(n*e)),i.model.setParameterValueById(`ParamEyeROpen`,a(r*t)),i.markHandled();return}if(!i.isIdleMotion)return;let s=a(i.modelParameters.value.leftEyeOpen),c=a(i.modelParameters.value.rightEyeOpen);if(!i.live2dAutoBlinkEnabled.value){o();let e=i.model.getParameterValueById(`ParamEyeLOpen`),t=i.model.getParameterValueById(`ParamEyeROpen`);i.model.setParameterValueById(`ParamEyeLOpen`,a(e*s)),i.model.setParameterValueById(`ParamEyeROpen`,a(t*c));return}if(!i.live2dForceAutoBlinkEnabled.value&&i.internalModel.eyeBlink!=null){o();let e=i.model.getParameterValueById(`ParamEyeLOpen`),t=i.model.getParameterValueById(`ParamEyeROpen`);i.model.setParameterValueById(`ParamEyeLOpen`,a(e*s)),i.model.setParameterValueById(`ParamEyeROpen`,a(t*c));return}let u=i.model.getParameterValueById(`ParamEyeLOpen`),d=i.model.getParameterValueById(`ParamEyeROpen`),f=.15;if(t.phase===`idle`&&u<=f&&d<=f){o();return}t.phase===`idle`&&(n=u,r=d);let p=t.phase!==`idle`,m=Math.max(i.timeDelta??0,0),{eyeLOpen:h,eyeROpen:g}=l((m<5?m*1e3:m)||16,1,1);if(p&&t.phase===`idle`){i.model.setParameterValueById(`ParamEyeLOpen`,a(n*s)),i.model.setParameterValueById(`ParamEyeROpen`,a(r*c));return}t.phase!==`idle`&&(i.model.setParameterValueById(`ParamEyeLOpen`,a(n*h*s)),i.model.setParameterValueById(`ParamEyeROpen`,a(r*g*c)))}}function rr(e){return t=>{e.applyExpressions(t.model)}}var $=function(e){return e.Happy=`happy`,e.Sad=`sad`,e.Angry=`angry`,e.Think=`think`,e.Surprise=`surprised`,e.Awkward=`awkward`,e.Question=`question`,e.Curious=`curious`,e.Neutral=`neutral`,e}({});Object.values($);var ir=`Idle`;$.Happy,$.Sad,$.Angry,$.Think,$.Surprise,$.Awkward,$.Question,$.Neutral,$.Curious,$.Happy,$.Sad,$.Angry,$.Think,$.Surprise,$.Awkward,$.Question,$.Neutral,$.Curious;var ar={angleX:0,angleY:0,angleZ:0,leftEyeOpen:1,rightEyeOpen:1,leftEyeSmile:0,rightEyeSmile:0,leftEyebrowLR:0,rightEyebrowLR:0,leftEyebrowY:0,rightEyebrowY:0,leftEyebrowAngle:0,rightEyebrowAngle:0,leftEyebrowForm:0,rightEyebrowForm:0,mouthOpen:0,mouthForm:0,cheek:0,bodyAngleX:0,bodyAngleY:0,bodyAngleZ:0,breath:0},or=le(`live2d`,()=>{let{post:e,data:t}=de({name:`airi-stores-stage-ui-live2d`}),n=o(new Set),r=e=>(n.value.add(e),()=>{n.value.delete(e)});function i(){e({type:`live2d-should-update-view`}),n.value.forEach(e=>e())}m(t,e=>{e?.type===`live2d-should-update-view`&&n.value.forEach(e=>e())});let a=F(`settings/live2d/position`,{x:0,y:0}),s=u(()=>({x:`${a.value.x}%`,y:`${a.value.y}%`})),c=F(`settings/live2d/current-motion`,()=>({group:`Idle`,index:0})),l=F(`settings/live2d/available-motions`,()=>[]),d=F(`settings/live2d/motion-map`,{}),f=F(`settings/live2d/scale`,1),p=F(`settings/live2d/parameters`,ar);function h(){a.reset(),c.reset(),l.reset(),d.reset(),f.reset(),p.reset(),i()}return{position:a,positionInPercentageString:s,currentMotion:c,availableMotions:l,motionMap:d,scale:f,modelParameters:p,onShouldUpdateView:r,shouldUpdateView:i,resetState:h}}),sr=e({__name:`Model`,props:i({modelSrc:{},modelId:{},app:{},mouthOpenSize:{default:0},width:{},height:{},paused:{type:Boolean,default:!1},focusAt:{default:()=>({x:0,y:0})},disableFocusAt:{type:Boolean,default:!1},xOffset:{},yOffset:{},scale:{default:1},themeColorsHue:{default:220.44},themeColorsHueDynamic:{type:Boolean,default:!1},live2dIdleAnimationEnabled:{type:Boolean,default:!0},live2dAutoBlinkEnabled:{type:Boolean,default:!0},live2dForceAutoBlinkEnabled:{type:Boolean,default:!1},live2dExpressionEnabled:{type:Boolean,default:!0},live2dShadowEnabled:{type:Boolean,default:!0}},{state:{default:`pending`},stateModifiers:{}}),emits:i([`modelLoaded`,`error`],[`update:state`]),setup(e,{expose:t,emit:i}){let a=e,d=i,f=g(e,`state`);function _(){let e=Number.parseFloat(String(a.xOffset))||0,t=Number.parseFloat(String(a.yOffset))||0;return String(a.xOffset).endsWith(`%`)&&(e=Number.parseFloat(String(a.xOffset).replace(`%`,``))/100*a.width),String(a.yOffset).endsWith(`%`)&&(t=Number.parseFloat(String(a.yOffset).replace(`%`,``))/100*a.height),{xOffset:e,yOffset:t}}let b=n(()=>a.modelSrc),x=o(!1),S=!1,C=new he,w=u(()=>_()),T=n(()=>a.app),E=n(()=>a.paused),D=n(()=>a.focusAt),O=o(),k=o(0),A=o(0),ne=u(()=>Math.max(0,Math.min(100,a.mouthOpenSize))),j=o(0),{isDark:M}=ue(),N=fe(pe),oe=u(()=>N.between(`sm`,`md`).value||N.smaller(`sm`).value),se=s(new Ct({alpha:.2,blur:0,distance:20,rotation:45}));function le(){return O.value.internalModel.coreModel}let P;function de(){let e=2.2;oe.value&&(e=2.2);let t=a.height*.95/A.value*e,n=a.width*.95/k.value*e,r=Math.min(t,n);return(Number.isNaN(r)||r<=0)&&(r=1e-6),{scale:r*a.scale,x:a.width/2+w.value.xOffset,y:a.height+w.value.yOffset}}function F(e=!1){if(!O.value)return;let t=de();if(!e){O.value.scale.set(t.scale,t.scale),O.value.x=t.x,O.value.y=t.y;return}P?.pause();let n={scale:O.value.scale.x,x:O.value.x,y:O.value.y};P=ge(n,{scale:t.scale,x:t.x,y:t.y,duration:200,ease:`outQuad`,onUpdate:()=>{O.value&&(O.value.scale.set(n.scale,n.scale),O.value.x=n.x,O.value.y=n.y)}})}let _e=or(),{currentMotion:I,availableMotions:L,motionMap:ve,modelParameters:R}=ce(_e),ye=n(()=>a.themeColorsHue),z=n(()=>a.themeColorsHueDynamic),B=n(()=>a.live2dIdleAnimationEnabled),be=n(()=>a.live2dAutoBlinkEnabled),xe=n(()=>a.live2dForceAutoBlinkEnabled),V=n(()=>a.live2dExpressionEnabled),H=n(()=>a.live2dShadowEnabled),U=o(),W=Zn({internalModel:U,modelId:a.modelId}),G=s(null),Se=s(null),Ce=o({group:`Idle`,index:0}),we=Kn({baseAngles:()=>({x:R.value.angleX,y:R.value.angleY,z:R.value.angleZ}),initialStyle:`sway-sine`}),K=_e.onShouldUpdateView(()=>{Te()});async function Te(){if(await me(x).not.toBeTruthy(),await C.acquire(),x.value=!0,f.value=`loading`,!T.value||!T.value.stage)try{await me(()=>!!T.value&&!!T.value.stage).toBeTruthy({timeout:1500})}catch{x.value=!1,f.value=`mounted`;return}if(O.value&&T.value?.stage){W.dispose(),U.value=void 0;try{T.value.stage.removeChild(O.value),O.value.destroy()}catch(e){console.warn(`Error removing old model:`,e)}O.value=void 0}if(!b.value){console.warn(`No Live2D model source provided.`),x.value=!1,f.value=`mounted`;return}try{if(S){x.value=!1,f.value=`mounted`;return}let e=new ee;await ie.setupLive2DModel(e,{url:b.value,id:a.modelId},{autoInteract:!1}),L.value.forEach(e=>{e.motionName in $?ve.value[e.fileName]=e.motionName:ve.value[e.fileName]=ir}),O.value=e,T.value.stage.addChild(O.value),k.value=O.value.width,A.value=O.value.height,O.value.anchor.set(.5,.5),F(),O.value.on(`hit`,e=>{O.value&&e.includes(`body`)&&O.value.motion(`tap_body`)});let t=O.value.internalModel,n=t.coreModel,r=t.motionManager;n.setParameterValueById(`ParamMouthOpenY`,ne.value),L.value=Object.entries(r.definitions).flatMap(([e,t])=>t?.map((t,n)=>({motionName:e,motionIndex:n,fileName:t.File}))||[]).filter(Boolean);let i=localStorage.getItem(`selected-runtime-motion-group`),o=localStorage.getItem(`selected-runtime-motion-index`);if(i!==null&&o){let e=r.groups[i];if(e!==void 0&&r.motionGroups[e]){let t=Number.parseInt(o),n=r.motionGroups[e][t];n&&n._looper&&(n._looper.loopDuration=0,console.info(`Configured motion to loop infinitely:`,i,t))}}i!==null&&o&&B.value&&setTimeout(()=>{console.info(`Playing selected runtime motion:`,i,o),I.value={group:i,index:Number.parseInt(o)}},300),r.groups.idle&&r.motionGroups[r.groups.idle]?.forEach(e=>{e._motionData.curves.forEach(e=>{(e.id===`ParamEyeBallX`||e.id===`ParamEyeBallY`)&&(e.id=`_${e.id}`)})});let s=Qn({internalModel:t,motionManager:r,modelParameters:R,live2dIdleAnimationEnabled:B,live2dAutoBlinkEnabled:be,live2dForceAutoBlinkEnabled:xe,lastUpdateTime:j});s.register($n(we),`pre`),s.register(er(),`pre`),s.register(tr(),`post`),s.register(rr(W),`final`),s.register(nr(V),`final`);let c=r.update;r.update=function(e,t){return s.hookUpdate(e,t,c)},r.on(`motionStart`,(e,t)=>{Ce.value={group:e,index:t}}),r.on(`motionFinish`,()=>{let e=localStorage.getItem(`selected-runtime-motion-group`),t=localStorage.getItem(`selected-runtime-motion-index`);e!==null&&t&&B.value&&(console.info(`Motion finished, restarting runtime motion:`,e,t),requestAnimationFrame(()=>{I.value={group:e,index:Number.parseInt(t)}}))}),n.setParameterValueById(`ParamAngleX`,R.value.angleX),n.setParameterValueById(`ParamAngleY`,R.value.angleY),n.setParameterValueById(`ParamAngleZ`,R.value.angleZ),n.setParameterValueById(`ParamEyeLOpen`,R.value.leftEyeOpen),n.setParameterValueById(`ParamEyeROpen`,R.value.rightEyeOpen),n.setParameterValueById(`ParamEyeSmile`,R.value.leftEyeSmile),n.setParameterValueById(`ParamBrowLX`,R.value.leftEyebrowLR),n.setParameterValueById(`ParamBrowRX`,R.value.rightEyebrowLR),n.setParameterValueById(`ParamBrowLY`,R.value.leftEyebrowY),n.setParameterValueById(`ParamBrowRY`,R.value.rightEyebrowY),n.setParameterValueById(`ParamBrowLAngle`,R.value.leftEyebrowAngle),n.setParameterValueById(`ParamBrowRAngle`,R.value.rightEyebrowAngle),n.setParameterValueById(`ParamBrowLForm`,R.value.leftEyebrowForm),n.setParameterValueById(`ParamBrowRForm`,R.value.rightEyebrowForm),n.setParameterValueById(`ParamMouthOpenY`,R.value.mouthOpen),n.setParameterValueById(`ParamMouthForm`,R.value.mouthForm),n.setParameterValueById(`ParamCheek`,R.value.cheek),n.setParameterValueById(`ParamBodyAngleX`,R.value.bodyAngleX),n.setParameterValueById(`ParamBodyAngleY`,R.value.bodyAngleY),n.setParameterValueById(`ParamBodyAngleZ`,R.value.bodyAngleZ),n.setParameterValueById(`ParamBreath`,R.value.breath),G.value=t.eyeBlink,Se.value=r.expressionManager,V.value&&(r.expressionManager&&=null,t.eyeBlink&&=null,U.value=t,Ee(t).catch(e=>{console.warn(`[Model.vue] Expression controller initialisation failed:`,e)})),d(`modelLoaded`)}catch(e){console.error(`[Live2D] Failed to load model:`,e),d(`error`,e instanceof Error?e:Error(String(e)))}finally{x.value=!1,f.value=`mounted`,C.release()}}async function Ee(e){W.dispose();let t=e.settings;if(!t)return;let n=t.expressions??[];n.length!==0&&await W.initialise(n,async e=>{let n=t.resolveURL?.(e)??e,r=await fetch(n);if(!r.ok)throw Error(`Failed to fetch exp3 file: ${e} (${r.status})`);return r.text()})}async function De(e,t){if(!O.value){console.warn(`Cannot set motion: model not loaded`);return}console.info(`Setting motion:`,e,`index:`,t);try{await O.value.motion(e,t,te.FORCE),console.info(`Motion started successfully:`,e)}catch(t){console.error(`Failed to start motion:`,e,t)}}function q(){F(!0)}let J=o(),Y=o(0);function X(){if(!O.value)return;if(!H.value){O.value.filters=[];return}if(!J.value)return;let e=getComputedStyle(J.value).backgroundColor;se.value.color=Number(re(e).replace(`#`,`0x`)),O.value.filters=[se.value]}m([()=>a.width,()=>a.height],q),m(b,async()=>await Te(),{immediate:!0}),m(M,X,{immediate:!0}),m([O,ye],X),m(H,X),m(w,()=>F()),m(()=>a.scale,()=>F());function Z(){if(X(),!H.value){Y.value=0;return}Y.value=requestAnimationFrame(Z)}m([z,H],([e,t])=>{e&&t?Y.value=requestAnimationFrame(Z):(cancelAnimationFrame(Y.value),Y.value=0)},{immediate:!0}),m(ne,e=>le().setParameterValueById(`ParamMouthOpenY`,e)),m(I,e=>De(e.group,e.index)),m(E,e=>e?T.value?.stop():T.value?.start()),m(()=>R.value.angleX,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamAngleX`,e)}),m(()=>R.value.angleY,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamAngleY`,e)}),m(()=>R.value.angleZ,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamAngleZ`,e)}),m(()=>R.value.leftEyeOpen,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamEyeLOpen`,e)}),m(()=>R.value.rightEyeOpen,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamEyeROpen`,e)}),m(()=>R.value.mouthOpen,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamMouthOpenY`,e)}),m(()=>R.value.mouthForm,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamMouthForm`,e)}),m(()=>R.value.cheek,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamCheek`,e)}),m(()=>R.value.bodyAngleX,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBodyAngleX`,e)}),m(()=>R.value.bodyAngleY,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBodyAngleY`,e)}),m(()=>R.value.bodyAngleZ,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBodyAngleZ`,e)}),m(()=>R.value.breath,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBreath`,e)}),m(()=>R.value.leftEyebrowLR,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBrowLX`,e)}),m(()=>R.value.rightEyebrowLR,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBrowRX`,e)}),m(()=>R.value.leftEyebrowY,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBrowLY`,e)}),m(()=>R.value.rightEyebrowY,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBrowRY`,e)}),m(()=>R.value.leftEyebrowAngle,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBrowLAngle`,e)}),m(()=>R.value.rightEyebrowAngle,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBrowRAngle`,e)}),m(()=>R.value.leftEyebrowForm,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBrowLForm`,e)}),m(()=>R.value.rightEyebrowForm,e=>{O.value&&O.value.internalModel.coreModel.setParameterValueById(`ParamBrowRForm`,e)}),m(B,e=>{if(!e&&O.value){let e=O.value.internalModel;e?.motionManager&&e.motionManager.stopAllMotions()}}),m(V,e=>{if(!O.value)return;let t=O.value.internalModel,n=t.motionManager;e?(n.expressionManager&&=null,t.eyeBlink&&=null,U.value=t,Ee(t).catch(e=>{console.warn(`[Model.vue] Expression controller initialisation failed:`,e)})):(n.expressionManager=Se.value,t.eyeBlink=G.value,W.dispose(),U.value=void 0)}),m(D,e=>{O.value&&(a.disableFocusAt||O.value.focus(e.x,e.y))}),c(()=>{let e=ae(()=>we.scheduleBeat());r(()=>e())}),c(async()=>{X()}),r(()=>{S=!0,P?.pause(),K?.(),W.dispose()});function Oe(){return L.value}return t({setMotion:De,listMotionGroups:Oe}),(void 0)?.dispose(()=>{console.warn(`[Dev] Reload on HMR dispose is active for this component. Performing a full reload.`),window.location.reload()}),(e,t)=>(h(),v(p,null,[y(`div`,{ref_key:`dropShadowColorComputer`,ref:J,hidden:``,bg:`primary-400 dark:primary-500`},null,512),l(e.$slots,`default`)],64))}}),cr=e({__name:`Live2D`,props:i({modelSrc:{},modelId:{},paused:{type:Boolean,default:!1},mouthOpenSize:{default:0},focusAt:{default:()=>({x:0,y:0})},disableFocusAt:{type:Boolean},scale:{default:1},themeColorsHue:{default:220.44},themeColorsHueDynamic:{type:Boolean,default:!1},live2dIdleAnimationEnabled:{type:Boolean,default:!0},live2dAutoBlinkEnabled:{type:Boolean,default:!0},live2dForceAutoBlinkEnabled:{type:Boolean,default:!1},live2dExpressionEnabled:{type:Boolean,default:!0},live2dShadowEnabled:{type:Boolean,default:!0},live2dMaxFps:{default:0}},{state:{default:`pending`},stateModifiers:{},canvasState:{default:`pending`},canvasStateModifiers:{},modelState:{default:`pending`},modelStateModifiers:{}}),emits:[`update:state`,`update:canvasState`,`update:modelState`],setup(e,{expose:t}){let n=g(e,`state`),r=g(e,`canvasState`),i=g(e,`modelState`),s=o(),{position:c}=ce(or());return m([i,r],()=>{n.value=i.value===`mounted`&&r.value===`mounted`?`mounted`:`loading`}),t({canvasElement:()=>s.value?.canvasElement()}),(t,n)=>(h(),a(d(P),{relative:``},{default:_(({width:t,height:a})=>[f(I,{ref_key:`live2dCanvasRef`,ref:s,state:r.value,"onUpdate:state":n[1]||=e=>r.value=e,width:t,height:a,resolution:2,"max-fps":e.live2dMaxFps,"max-h":`100dvh`},{default:_(({app:r})=>[f(sr,{state:i.value,"onUpdate:state":n[0]||=e=>i.value=e,"model-src":e.modelSrc,"model-id":e.modelId,app:r,"mouth-open-size":e.mouthOpenSize,width:t,height:a,paused:e.paused,"focus-at":e.focusAt,"x-offset":d(c).x,"y-offset":d(c).y,scale:e.scale,"disable-focus-at":e.disableFocusAt,"theme-colors-hue":e.themeColorsHue,"theme-colors-hue-dynamic":e.themeColorsHueDynamic,"live2d-idle-animation-enabled":e.live2dIdleAnimationEnabled,"live2d-auto-blink-enabled":e.live2dAutoBlinkEnabled,"live2d-force-auto-blink-enabled":e.live2dForceAutoBlinkEnabled,"live2d-expression-enabled":e.live2dExpressionEnabled,"live2d-shadow-enabled":e.live2dShadowEnabled},null,8,[`state`,`model-src`,`model-id`,`app`,`mouth-open-size`,`width`,`height`,`paused`,`focus-at`,`x-offset`,`y-offset`,`scale`,`disable-focus-at`,`theme-colors-hue`,`theme-colors-hue-dynamic`,`live2d-idle-animation-enabled`,`live2d-auto-blink-enabled`,`live2d-force-auto-blink-enabled`,`live2d-expression-enabled`,`live2d-shadow-enabled`])]),_:2},1032,[`state`,`width`,`height`,`max-fps`])]),_:1}))}});export{Xn as a,or as i,sr as n,Kn as o,ar as r,I as s,cr as t};
//# sourceMappingURL=src-BXvqpKan.js.map