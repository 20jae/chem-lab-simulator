import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(), tmp=path.join(root,'tmp/cp-ppt');
const skill='C:/Users/USER/.codex/plugins/cache/openai-primary-runtime/presentations/26.921.10847/skills/presentations';
const {resolvePresentationFont,applyPresentationChartFont,finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs'));
const font=resolvePresentationFont({fontFamily:'Arial'});
const p=Presentation.create({slideSize:{width:1280,height:720}});
const ink='#142F3D', teal='#007E83', gray='#54656D';
const source='Cai et al., Chemical Science 2025, 16, 11539–11547. DOI: 10.1039/D5SC01958C. https://pmc.ncbi.nlm.nih.gov/articles/PMC12117708/';
function text(s,t,x,y,w,h,size=28,color=ink,bold=false){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=t;a.text.style={typeface:font,fontSize:size,color,bold,autoFit:'none'};return a;}
function slide(title,notes,ref){const s=p.slides.add();s.background.fill='#FFFFFF';text(s,title,64,44,1150,104,42,ink,true);text(s,String(p.slides.items.length).padStart(2,'0'),1165,668,55,25,17,gray);if(ref)text(s,ref,64,663,1060,30,16,gray);s.speakerNotes.textFrame.setText(notes+'\n\nSource: '+source);return s;}
async function crop(n,box,name){const input=path.join(tmp,`paper-${n}.png`),m=await sharp(input).metadata();const [x,y,w,h]=box;const out=path.join(tmp,name+'.png');await sharp(input).extract({left:Math.round(x*m.width),top:Math.round(y*m.height),width:Math.round(w*m.width),height:Math.round(h*m.height)}).toFile(out);return out;}
async function image(s,file,x,y,w,h,alt){s.images.add({blob:new Uint8Array(await fs.readFile(file)),contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});}
function bars(s,categories,series,ytitle,max,x=64,y=190,w=775,h=395){const c=s.charts.add('bar',{position:{left:x,top:y,width:w,height:h},categories,series,barOptions:{direction:'column',grouping:'clustered',gapWidth:100},hasLegend:series.length>1,legend:{position:'bottom',textStyle:{fontSize:22}},xAxis:{textStyle:{fontSize:22},majorGridlines:null},yAxis:{min:0,max,majorUnit:max/5,title:ytitle,numberFormatCode:'0',textStyle:{fontSize:19},majorGridlines:{fill:'#DFE6E8',width:1}},dataLabels:{showValue:true,position:'outEnd',textStyle:{fontSize:22,bold:true}},chartFill:'#FFFFFF'});applyPresentationChartFont(c,{fontFamily:font});}
const design=await crop(2,[.10,.677,.80,.222],'design');
const orbital=await crop(3,[.102,.758,.259,.142],'orbital');
const cpl=await crop(6,[.524,.744,.383,.132],'cpl');
const cpel=await crop(7,[.359,.232,.503,.166],'cpel');
{
const s=slide('Molecular Design for\nCircularly Polarized OLEDs','약 30초. 이 발표에서는 기존 MR-TADF 발광 골격에 구조적 고정을 도입한 연구를 소개합니다. 핵심 질문은 왜 스피로 플루오렌 구조를 도입했고, 그 결과 어떤 특성이 달라졌는가입니다. 원편광 특성과 발광 효율은 서로 다른 지표라는 점을 기억합니다.');
text(s,'Conformation locking with a spiro-fluorene unit',68,258,1090,80,34,teal);
text(s,'A study of Spiro-3TCzBN',68,360,1000,55,29);
text(s,'Xinliang Cai et al.\nChemical Science, 2025, 16, 11539–11547\nDOI: 10.1039/D5SC01958C',68,514,1090,112,23,gray);
}
{
const s=slide('The molecular design problem','약 50초. MR은 다중 공명, TADF는 열활성화 지연형광을 뜻합니다. MR 골격은 비교적 좁은 발광 스펙트럼을 제공하고 TADF는 삼중항 여기자를 발광에 활용합니다. 여기에 나선형 키랄성을 도입하면 좌우 원편광 세기가 달라질 수 있습니다. 하지만 분자들이 가까이 쌓이면 소광과 스펙트럼 넓어짐이 발생합니다. 따라서 키랄성을 유지하면서 고체에서의 상호작용을 제어해야 합니다.','Background and design rationale: pp. 11539–11541');
text(s,'MR-TADF emission',66,181,480,45,30,teal,true);text(s,'A narrow emission band\nTriplet harvesting through TADF',66,242,510,120,27);
text(s,'Requirements for CP-OLEDs',690,181,515,45,30,teal,true);text(s,'Stable molecular chirality\nEfficient emission in a solid film',690,242,520,120,27);
text(s,'Design challenge',66,440,1100,46,29,teal,true);text(s,'Introduce helical chirality while limiting\naggregation-related emission loss.',66,504,1100,107,35,ink,true);
}
{
const s=slide('A carbon bridge locks the helical framework','약 75초. 왼쪽은 출발 설계 골격 m-Cz-BNCz입니다. 붕소 기준 메타 위치에 있는 tert-butylcarbazole, 즉 TCz 부분을 sp3 탄소 다리로 MR 골격에 연결합니다. 추가 연결이 회전을 제한하면서 hetero[7]helicene을 형성합니다. 여기서 [7]은 일곱 고리가 연속 융합된 나선 구조를 의미하며 하나의 7원자 고리가 아닙니다. 오른쪽 P와 M은 반대 손잡이성의 거울상 이성질체입니다. 이 그림은 설계 개념이며 완성된 모분자에 플루오렌을 한 단계로 붙이는 실제 합성식은 아닙니다.','Figure 1b, p. 11540. Conceptual design, not a one-step synthetic scheme.');
await image(s,design,64,165,1148,350,'Figure 1b: parent scaffold and P/M Spiro-3TCzBN');
text(s,'The sp³ carbon bridge links TCz to the MR core.',67,536,1130,45,29,teal,true);
text(s,'Restricted rotation stabilizes a hetero[7]helicene framework.',67,591,1140,45,27);
}
{
const s=slide('Why use a spiro-fluorene locking unit?','약 60초. 스피로 구조는 두 고리계가 원자 하나를 공유하는 구조입니다. 계산상 플루오렌과 MR 골격의 각도는 89.56도로 거의 직각입니다. 옆으로 돌출된 부피가 분자 간 가까운 접촉을 방해한다는 것이 설계 의도입니다. sp3 다리는 직접적인 π 공액 경로가 아니며 저자들은 다리 위치의 전자와 정공 기여가 미미함을 보고합니다. 다만 TCz 융합은 전자구조와 발광 에너지에 영향을 주므로 전자구조가 전혀 변하지 않는다고 설명하면 안 됩니다. 비교 물질 DPh와 DMe도 고정된 골격이며 고정기에 달린 치환 구조가 다릅니다.','Calculated geometry and electronic structure: pp. 11541–11542, Fig. 2a');
text(s,'Nearly perpendicular geometry',66,177,750,50,31,teal,true);
text(s,'89.56°',66,238,600,80,60,teal,true);
text(s,'Calculated fluorene–MR dihedral angle',66,327,740,45,25,gray);
text(s,'The bulky unit limits close intermolecular contact.\nThe sp³ bridge primarily controls geometry.',66,416,745,122,29);
text(s,'Controls: diphenyl (DPh) and dimethyl (DMe) locks',66,580,1130,45,25);
await image(s,orbital,863,183,339,301,'Calculated orbitals and excited-state energies for Spiro-3TCzBN');
text(s,'Spiro-3TCzBN\nCalculated orbitals',863,502,335,70,23,gray);
}
{
const s=slide('Spiro retains high emission efficiency','약 65초. PLQY는 흡수한 광자 중 방출한 광자의 비율입니다. 동일한 PhCzBCz 호스트에서 3 wt%와 10 wt%의 결과를 비교했습니다. Spiro는 96%에서 88%, DPh는 93%에서 84%, DMe는 90%에서 72%로 감소합니다. 특히 DMe에 비해 농도를 높였을 때의 소광이 작습니다. DPh와의 차이는 비교적 작다는 점도 같이 말합니다. 이 결과는 입체적 차폐라는 해석을 뒷받침하지만 단일 원인만을 완벽히 분리한 실험은 아닙니다. 데이터는 본문 p.11543에서 확인했으며 이 그래프는 그 값을 다시 그린 것입니다.','PLQY values reported in the main text, p. 11543. Host: PhCzBCz.');
bars(s,['Spiro','DPh','DMe'],[{name:'3 wt%',values:[96,93,90],fill:teal},{name:'10 wt%',values:[88,84,72],fill:'#9EBDC1'}],'PLQY (%)',100);
text(s,'88%',916,235,275,95,64,teal,true);text(s,'PLQY at 10 wt%\nfor Spiro-3TCzBN',916,336,290,90,27);
text(s,'Consistent with reduced\nconcentration quenching',916,469,293,110,26,gray);
}
{
const s=slide('The locked helix produces circularly polarized light','약 55초. 키랄 HPLC를 이용해 Spiro의 P와 M을 분리했습니다. 필름에서 두 시료는 부호가 반대인 원편광 발광 신호를 보입니다. 아래 왼쪽은 CPL 신호, 오른쪽은 gPL입니다. 이는 거울상 이성질체가 서로 반대 원편광을 선호한다는 근거입니다. g의 크기는 약 10의 마이너스 4승 수준으로, 거의 완전한 원편광이라는 뜻은 아닙니다. DPh와 DMe는 거울상 이성질체 분리에 성공하지 못했으므로 이들과 실험적 CPL 세기를 직접 비교할 수 없습니다.','Figure 4c,d and text, pp. 11544–11545. Measurements in doped films.');
await image(s,cpl,60,205,755,334,'Opposite CPL and gPL signals of P/M Spiro in doped films');
text(s,'P and M enantiomers',866,185,350,60,29,teal,true);
text(s,'Opposite CPL signs\nin doped films',866,269,340,100,28);
text(s,'gPL(P) = −4.20 × 10⁻⁴\ngPL(M) = +3.17 × 10⁻⁴',866,402,350,108,27);
text(s,'Only Spiro enantiomers were successfully separated in this study.',65,584,1130,47,25,gray);
}
{
const s=slide('A TADF sensitizer improves device operation','약 65초. 분자 설계만으로 소자 성능을 모두 설명하면 안 됩니다. 직접 발광 소자는 느린 RISC와 긴 지연형광 수명 때문에 높은 밝기에서 효율이 떨어졌습니다. 저자들은 DACT-II를 25 wt% 첨가했습니다. 이 감응제가 삼중항을 수확하고 Förster 에너지 전달로 발광체에 에너지를 전달합니다. 아래 수치는 감응제를 사용한 라세미체 소자의 1000 cd/m²에서의 EQE입니다. Spiro 34.1%, DPh 30.0%, DMe 26.9%입니다. 세 개 모두 같은 종류의 감응 구조를 비교한 것으로, 최종 순수 P/M CP-OLED 수치와 구분해야 합니다.','Sensitized racemic OLEDs: p. 11544. 25 wt% DACT-II + 3 wt% emitter in PhCzBCz.');
text(s,'DACT-II harvests triplets and transfers energy to the emitter.',66,149,1135,70,29);
bars(s,['Spiro','DPh','DMe'],[{name:'EQE at 1000 cd/m²',values:[34.1,30,26.9],fill:teal}],'EQE (%)',40,64,247,775,350);
text(s,'34.1%',924,295,284,85,57,teal,true);
text(s,'EQE at 1000 cd/m²\nfor the Spiro racemate',915,393,295,100,26);
text(s,'Sensitization also contributes\nto the final device efficiency.',915,519,300,88,23,gray);
}
{
const s=slide('Enantiopure devices combine high EQE with CPEL','약 60초. 마지막으로 분리한 P와 M을 각각 소자에 넣었습니다. 최대 EQE는 M에서 34.9%, P에서 34.6%이며 발광 피크는 둘 다 560 nm입니다. CPEL 곡선의 부호는 서로 반대이고 gEL은 M에서 +4.26×10^-4, P에서 -3.51×10^-4입니다. 높은 EQE와 원편광 불균형의 크기는 별개입니다. 약 35%라는 값은 원편광도가 아니라 외부양자효율입니다. 수치와 부호는 논문 Table 2 및 Fig.5f를 따릅니다. 서론의 부호별 크기 배정과는 불일치가 있으므로 발표에는 본문 결과 및 표의 일치하는 값을 사용합니다.','Figure 5e,f and Table 2, p. 11545. Sensitized P/M devices.');
await image(s,cpel,62,204,771,339,'CPEL and gEL of enantiopure OLEDs, Figure 5e,f');
text(s,'34.9%',899,191,310,85,62,teal,true);
text(s,'Maximum EQE (M)\n560 nm emission',899,287,310,90,28);
text(s,'gEL(M) = +4.26 × 10⁻⁴\ngEL(P) = −3.51 × 10⁻⁴',872,427,351,105,27);
text(s,'High external quantum efficiency and a measurable circular polarization bias',66,581,1146,62,25,ink,true);
}
{
const s=slide('What this molecular design demonstrates','약 50초. 결론은 두 구조적 역할로 요약합니다. 탄소 다리는 나선형 골격을 고정해 키랄성을 유지하게 하고, 직교하는 부피 큰 플루오렌은 고농도에서 분자 간 상호작용을 줄이는 데 기여합니다. 높은 효율의 CP-OLED를 구현했지만 g값은 10^-4 수준으로 작으며, 약 35%의 효율에는 DACT-II 감응제도 기여합니다. 따라서 구조를 추가하면 모든 성질이 동시에 가장 좋아졌다고 결론내리기보다는, 형태 고정과 입체 차폐를 결합한 설계가 유효했다는 점을 강조하면 됩니다.','Cai et al., Chemical Science 2025, 16, 11539–11547. DOI: 10.1039/D5SC01958C');
text(s,'Conformation locking',66,174,1090,48,32,teal,true);text(s,'The carbon bridge stabilizes the helical chiral framework.',66,236,1135,64,30);
text(s,'Steric protection',66,342,1090,48,32,teal,true);text(s,'The orthogonal fluorene unit helps limit concentration quenching.',66,404,1135,76,30);
text(s,'Limits of the result',66,529,1080,42,27,gray,true);text(s,'Small |gEL| (~10⁻⁴). High device EQE also relies on TADF sensitization.',66,583,1140,62,25,gray);
}
await (await PresentationFile.exportPptx(p)).save(path.join(tmp,'candidate.pptx'));
const finalPath=path.join(root,'output/CP_OLED_Molecular_Design_EN.pptx');
const result=await finalizePresentation({workspaceDir:root,candidatePath:path.join(tmp,'candidate.pptx'),finalPath,pythonExecutable:'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],requiredNativeChartOwnerSlides:[5,7],materializeLiteralChartWorkbooks:true,fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:path.join(tmp,'validation.json')});
console.log(JSON.stringify(result));
for(let i=0;i<p.slides.items.length;i++){const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(tmp,`slide-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));}
