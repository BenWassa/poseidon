#!/usr/bin/env python3
"""Validate Poseidon's framework-independent marine content pack."""
from __future__ import annotations
import json, math, re, sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[1]
PACK=ROOT/'content/mexican-caribbean'; MANIFEST=PACK/'manifest.json'; SCHEMA=ROOT/'content/schema/marine-content.schema.json'
ID=re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$'); DAY=re.compile(r'^\d{4}-\d{2}-\d{2}$'); CC=re.compile(r'^[A-Z]{2}$')
BANNED={'rarity','raritypercent','encounterprobability','sightingfrequency','frequency','density','densityscore'}
SOURCE={'id','title','publisher','kind','url','accessedOn','note'}; REGION={'id','name','countryCode','parentRegionId'}
SITE_REQUIRED={'id','name','aliases','regionId','recordType','sourceIds'}; SITE=SITE_REQUIRED|{'coordinates'}
COORD={'lat','lng','precision','sourceIds','note'}
CREATURE_REQUIRED={'id','commonName','aliases','category','regionIds','sourceIds'}; CREATURE=CREATURE_REQUIRED|{'scientificName'}
MANIFEST_KEYS={'kind','schemaVersion','packId','name','lastReviewed','description','sources','regions','siteFiles','creatureFiles'}

def load(path,e):
    try:return json.loads(path.read_text(encoding='utf-8'))
    except (OSError,json.JSONDecodeError) as x:e.append(f'{path.relative_to(ROOT)}: unreadable JSON: {x}'); return None

def keys(o,req,allow,w,e):
    missing=req-o.keys(); extra=o.keys()-allow
    if missing:e.append(f'{w}: missing keys {sorted(missing)}')
    if extra:e.append(f'{w}: unsupported keys {sorted(extra)}')

def text(v,w,e):
    if not isinstance(v,str) or not v.strip():e.append(f'{w}: expected non-empty string'); return False
    return True

def sid(v,w,e):
    if not text(v,w,e):return False
    if not ID.fullmatch(v):e.append(f'{w}: invalid stable ID {v!r}'); return False
    return True

def day(v,w,e):
    if not isinstance(v,str) or not DAY.fullmatch(v):e.append(f'{w}: expected YYYY-MM-DD'); return False
    try:d=date.fromisoformat(v)
    except ValueError:e.append(f'{w}: invalid date {v!r}'); return False
    if d>date.today():e.append(f'{w}: future date {v!r}'); return False
    return True

def strings(v,w,e,nonempty=False):
    if not isinstance(v,list):e.append(f'{w}: expected array'); return []
    if nonempty and not v:e.append(f'{w}: must not be empty')
    out=[]
    for i,x in enumerate(v):
        if text(x,f'{w}[{i}]',e):out.append(x)
    if len({x.casefold() for x in out})!=len(out):e.append(f'{w}: duplicate values')
    return out

def unique_ids(items,w,e):
    seen=set()
    if not isinstance(items,list):e.append(f'{w}: expected array'); return seen
    for i,o in enumerate(items):
        if not isinstance(o,dict):e.append(f'{w}[{i}]: expected object'); continue
        x=o.get('id')
        if sid(x,f'{w}[{i}].id',e):
            if x in seen:e.append(f'{w}: duplicate ID {x!r}')
            seen.add(x)
    return seen

def reject_banned(v,w,e):
    if isinstance(v,dict):
        for k,x in v.items():
            if re.sub('[^a-z]','',k.casefold()) in BANNED:e.append(f'{w}.{k}: rarity/frequency fields are unsupported')
            reject_banned(x,f'{w}.{k}',e)
    elif isinstance(v,list):
        for i,x in enumerate(v):reject_banned(x,f'{w}[{i}]',e)

def shard(rel,kind,listkey,packid,e):
    p=Path(rel)
    if p.is_absolute() or '..' in p.parts or p.suffix!='.json':e.append(f'manifest: unsafe shard path {rel!r}'); return []
    path=PACK/p; o=load(path,e)
    if not isinstance(o,dict):return []
    required={'kind','schemaVersion','packId',listkey}; keys(o,required,required,str(path.relative_to(ROOT)),e)
    if o.get('kind')!=kind:e.append(f'{path.relative_to(ROOT)}.kind: expected {kind!r}')
    if o.get('schemaVersion')!=1:e.append(f'{path.relative_to(ROOT)}.schemaVersion: expected 1')
    if o.get('packId')!=packid:e.append(f'{path.relative_to(ROOT)}.packId: must match manifest')
    reject_banned(o,str(path.relative_to(ROOT)),e)
    records=o.get(listkey,[])
    if not isinstance(records,list):e.append(f'{path.relative_to(ROOT)}.{listkey}: expected array'); return []
    return records

def validate_coordinate(value,w,sourceids,record_type,e):
    if not isinstance(value,dict):e.append(f'{w}: expected object'); return
    keys(value,COORD,COORD,w,e)
    for field,minimum,maximum in (('lat',-90,90),('lng',-180,180)):
        number=value.get(field)
        if isinstance(number,bool) or not isinstance(number,(int,float)) or not math.isfinite(number):
            e.append(f'{w}.{field}: expected finite number')
        elif not minimum<=number<=maximum:e.append(f'{w}.{field}: out of bounds [{minimum}, {maximum}]')
    precision=value.get('precision')
    if precision not in {'exact-site','approximate-site','reef-area'}:e.append(f'{w}.precision: unsupported coordinate precision')
    if record_type=='area' and precision=='exact-site':e.append(f'{w}.precision: area records cannot claim exact-site precision')
    for r in strings(value.get('sourceIds'),f'{w}.sourceIds',e,True):
        if r not in sourceids:e.append(f'{w}.sourceIds: unknown source {r!r}')
    text(value.get('note'),f'{w}.note',e)

def validate():
    e=[]; counts={'regions':0,'sites':0,'creatures':0,'sources':0,'geolocatedSites':0}
    schema=load(SCHEMA,e)
    if not isinstance(schema,dict) or schema.get('$schema')!='https://json-schema.org/draft/2020-12/schema':e.append('schema: expected Draft 2020-12 declaration')
    m=load(MANIFEST,e)
    if not isinstance(m,dict):return e,counts
    keys(m,MANIFEST_KEYS,MANIFEST_KEYS,'manifest',e)
    if m.get('kind')!='manifest':e.append("manifest.kind: expected 'manifest'")
    if m.get('schemaVersion')!=1:e.append('manifest.schemaVersion: expected 1')
    sid(m.get('packId'),'manifest.packId',e); text(m.get('name'),'manifest.name',e); text(m.get('description'),'manifest.description',e); day(m.get('lastReviewed'),'manifest.lastReviewed',e); reject_banned(m,'manifest',e)
    packid=m.get('packId') if isinstance(m.get('packId'),str) else ''
    sources=m.get('sources',[]); regions=m.get('regions',[]); sourceids=unique_ids(sources,'sources',e); regionids=unique_ids(regions,'regions',e)
    counts['sources']=len(sources) if isinstance(sources,list) else 0; counts['regions']=len(regions) if isinstance(regions,list) else 0
    if isinstance(sources,list):
        for i,o in enumerate(sources):
            if not isinstance(o,dict):continue
            w=f'sources[{i}]'; keys(o,SOURCE,SOURCE,w,e)
            for k in ('title','publisher','note'):text(o.get(k),f'{w}.{k}',e)
            if o.get('kind') not in {'government','citizen-science','reference'}:e.append(f'{w}.kind: unsupported source kind')
            u=o.get('url')
            if text(u,f'{w}.url',e):
                p=urlparse(u)
                if p.scheme!='https' or not p.netloc:e.append(f'{w}.url: expected absolute HTTPS URL')
            day(o.get('accessedOn'),f'{w}.accessedOn',e)
    parents={}
    if isinstance(regions,list):
        for i,o in enumerate(regions):
            if not isinstance(o,dict):continue
            w=f'regions[{i}]'; keys(o,{'id','name','countryCode'},REGION,w,e); text(o.get('name'),f'{w}.name',e)
            if not isinstance(o.get('countryCode'),str) or not CC.fullmatch(o['countryCode']):e.append(f'{w}.countryCode: expected two-letter uppercase code')
            p=o.get('parentRegionId')
            if p is not None and sid(p,f'{w}.parentRegionId',e):
                if p not in regionids:e.append(f'{w}.parentRegionId: unknown region {p!r}')
                elif p==o.get('id'):e.append(f'{w}.parentRegionId: cannot parent itself')
                else:parents[o['id']]=p
    for start in parents:
        seen=set(); cur=start
        while cur in parents:
            if cur in seen:e.append(f'regions: parent cycle from {start!r}'); break
            seen.add(cur); cur=parents[cur]
    sitefiles=strings(m.get('siteFiles'),'manifest.siteFiles',e,True); creaturefiles=strings(m.get('creatureFiles'),'manifest.creatureFiles',e,True); refs=sitefiles+creaturefiles
    if len(set(refs))!=len(refs):e.append('manifest: shard paths must be unique')
    sites=[]; creatures=[]
    for r in sitefiles:sites+=shard(r,'sites','sites',packid,e)
    for r in creaturefiles:creatures+=shard(r,'creatures','creatures',packid,e)
    counts['sites']=len(sites); counts['creatures']=len(creatures)
    wanted={(PACK/r).resolve() for r in refs}; found={p.resolve() for p in PACK.rglob('*.json') if p.name!='manifest.json'}
    for p in sorted(found-wanted):e.append(f'manifest: unreferenced JSON shard {p.relative_to(ROOT)}')
    for p in sorted(wanted-found):e.append(f'manifest: missing JSON shard {p.relative_to(ROOT)}')
    unique_ids(sites,'sites',e); unique_ids(creatures,'creatures',e)
    if [o.get('id','') for o in sites if isinstance(o,dict)]!=sorted(o.get('id','') for o in sites if isinstance(o,dict)):e.append('sites: must be sorted by id')
    terms={}
    for i,o in enumerate(sites):
        if not isinstance(o,dict):continue
        w=f'sites[{i}]'; keys(o,SITE_REQUIRED,SITE,w,e); name=o.get('name'); text(name,f'{w}.name',e); aliases=strings(o.get('aliases'),f'{w}.aliases',e); rid=o.get('regionId')
        if not sid(rid,f'{w}.regionId',e) or rid not in regionids:e.append(f'{w}.regionId: unknown region {rid!r}')
        record_type=o.get('recordType')
        if record_type not in {'site','area'}:e.append(f'{w}.recordType: expected site or area')
        for r in strings(o.get('sourceIds'),f'{w}.sourceIds',e,True):
            if r not in sourceids:e.append(f'{w}.sourceIds: unknown source {r!r}')
        if 'coordinates' in o:
            counts['geolocatedSites']+=1
            validate_coordinate(o.get('coordinates'),f'{w}.coordinates',sourceids,record_type,e)
        if isinstance(name,str) and name.casefold() in {a.casefold() for a in aliases}:e.append(f'{w}.aliases: duplicates primary name')
        if isinstance(rid,str):
            for t in [name,*aliases]:
                if isinstance(t,str):
                    k=(rid,t.casefold()); prior=terms.get(k)
                    if prior and prior!=o.get('id'):e.append(f'{w}: ambiguous site term {t!r} also used by {prior!r}')
                    elif isinstance(o.get('id'),str):terms[k]=o['id']
    if len(creatures)<30:e.append(f'creatures: expected at least 30 entries; found {len(creatures)}')
    cn=[o.get('commonName','') for o in creatures if isinstance(o,dict)]
    if cn!=sorted(cn,key=str.casefold):e.append('creatures: catalogue must be commonName-sorted')
    terms={}; scientific={}
    for i,o in enumerate(creatures):
        if not isinstance(o,dict):continue
        w=f'creatures[{i}]'; keys(o,CREATURE_REQUIRED,CREATURE,w,e); common=o.get('commonName'); text(common,f'{w}.commonName',e); aliases=strings(o.get('aliases'),f'{w}.aliases',e)
        sci=o.get('scientificName')
        if sci is not None and text(sci,f'{w}.scientificName',e):
            k=sci.casefold(); prior=scientific.get(k)
            if prior and prior!=o.get('id'):e.append(f'{w}.scientificName: duplicate of {prior!r}')
            elif isinstance(o.get('id'),str):scientific[k]=o['id']
        sid(o.get('category'),f'{w}.category',e)
        for r in strings(o.get('regionIds'),f'{w}.regionIds',e,True):
            if r not in regionids:e.append(f'{w}.regionIds: unknown region {r!r}')
        for r in strings(o.get('sourceIds'),f'{w}.sourceIds',e,True):
            if r not in sourceids:e.append(f'{w}.sourceIds: unknown source {r!r}')
        if isinstance(common,str) and common.casefold() in {a.casefold() for a in aliases}:e.append(f'{w}.aliases: duplicates commonName')
        for t in [common,*aliases]:
            if isinstance(t,str):
                k=t.casefold(); prior=terms.get(k)
                if prior and prior!=o.get('id'):e.append(f'{w}: ambiguous creature term {t!r} also used by {prior!r}')
                elif isinstance(o.get('id'),str):terms[k]=o['id']
    return e,counts

def main():
    e,c=validate()
    if e:
        print(f'Content validation failed with {len(e)} error(s):',file=sys.stderr)
        for x in e:print(f'- {x}',file=sys.stderr)
        return 1
    print(f"Content validation passed: {c['regions']} regions, {c['sites']} sites/areas ({c['geolocatedSites']} geolocated), {c['creatures']} creatures, {c['sources']} sources.")
    return 0
if __name__=='__main__':raise SystemExit(main())
