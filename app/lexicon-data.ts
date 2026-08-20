import { AWL_HEADWORD_COUNT, awlSourceEntries } from "./awl-data";

export type LexiconKind = "word" | "phrase" | "collocation";

export type WordEntry = {
  id: string;
  term: string;
  ipa: string;
  partOfSpeech: string;
  meaningVi: string;
  definitionEn: string;
  topic: string;
  level: string;
  kind: LexiconKind;
  stress: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  family: string[];
  example: string;
  awlSublist?: number;
};

const rawLexicon = String.raw`
allocate|/ˈæl.ə.keɪt/|verb|phân bổ|To distribute resources for a particular purpose.|Academic Core|C1|word|AL-lo-cate|allocate resources;allocate funding;allocate time|assign;distribute|withhold|allocation;allocated|Governments should allocate more funding to public education.
analyse|/ˈæn.əl.aɪz/|verb|phân tích|To examine something carefully in order to understand it.|Academic Core|B2|word|AN-a-lyse|analyse data;analyse the causes;critically analyse|examine;evaluate|ignore|analysis;analytical;analytically|Researchers analysed the factors behind the decline.
assess|/əˈses/|verb|đánh giá|To judge the quality, importance, or effect of something.|Academic Core|B2|word|a-SESS|assess the impact;assess performance;risk assessment|evaluate;appraise|disregard|assessment;reassess|It is difficult to assess the long-term impact of the policy.
coherent|/kəʊˈhɪə.rənt/|adjective|mạch lạc, nhất quán|Logical, clear, and forming a unified whole.|Academic Core|C1|word|co-HE-rent|coherent argument;coherent explanation;internally coherent|logical;consistent|incoherent|coherence;coherently|The report presents a coherent argument for reform.
compelling|/kəmˈpel.ɪŋ/|adjective|thuyết phục, hấp dẫn mạnh mẽ|Very convincing or able to attract strong attention.|Academic Core|C1|word|com-PELL-ing|compelling evidence;compelling argument;compelling reason|convincing;persuasive|unconvincing|compel;compelled|There is compelling evidence that early intervention works.
constitute|/ˈkɒn.stɪ.tjuːt/|verb|cấu thành, được xem là|To form something or be considered as something.|Academic Core|C1|word|CON-sti-tute|constitute a threat;constitute the majority;constitute evidence|form;comprise|exclude|constitution;constituent|These groups constitute nearly half of the population.
derive|/dɪˈraɪv/|verb|bắt nguồn, thu được|To obtain something from a particular source.|Academic Core|C1|word|de-RIVE|derive benefits;derive meaning;be derived from|obtain;originate|lose|derivation;derivative|Many medicines are derived from natural substances.
diminish|/dɪˈmɪn.ɪʃ/|verb|làm giảm, suy giảm|To become or make something less important, strong, or valuable.|Academic Core|C1|word|di-MIN-ish|diminish the impact;diminishing returns;gradually diminish|reduce;decline|intensify|diminution;diminished|Public trust may diminish when institutions lack transparency.
facilitate|/fəˈsɪl.ɪ.teɪt/|verb|tạo điều kiện, làm thuận lợi|To make an action or process easier.|Academic Core|C1|word|fa-CIL-i-tate|facilitate learning;facilitate communication;facilitate access|enable;assist|hinder|facilitation;facilitator|Digital platforms facilitate access to information.
feasible|/ˈfiː.zə.bəl/|adjective|khả thi|Possible and practical to achieve.|Academic Core|C1|word|FEA-si-ble|feasible solution;economically feasible;technically feasible|viable;practical|unfeasible|feasibility;feasibly|The proposal is effective but may not be financially feasible.
fundamental|/ˌfʌn.dəˈmen.təl/|adjective|cơ bản, nền tảng|More important than anything else; forming the basis of something.|Academic Core|B2|word|fun-da-MEN-tal|fundamental right;fundamental change;fundamental principle|essential;basic|minor|fundamentally|Education is a fundamental right rather than a privilege.
implement|/ˈɪm.plɪ.ment/|verb|triển khai, thực hiện|To put a plan, decision, or system into effect.|Academic Core|B2|word|IM-ple-ment|implement a policy;implement measures;fully implement|execute;carry out|abandon|implementation;implementable|Authorities must implement stricter safety measures.
imply|/ɪmˈplaɪ/|verb|ngụ ý, cho thấy gián tiếp|To communicate or suggest something without stating it directly.|Academic Core|B2|word|im-PLY|strongly imply;seem to imply;implication for|suggest;indicate|state|implication;implicit;implicitly|The findings imply that income alone does not determine happiness.
inevitable|/ɪnˈev.ɪ.tə.bəl/|adjective|không thể tránh khỏi|Certain to happen and impossible to avoid.|Academic Core|B2|word|in-EV-i-ta-ble|inevitable consequence;seem inevitable;almost inevitable|unavoidable;inescapable|avoidable|inevitability;inevitably|Some degree of technological disruption is inevitable.
significant|/sɪɡˈnɪf.ɪ.kənt/|adjective|đáng kể, quan trọng|Large or important enough to have a noticeable effect.|Academic Core|B2|word|sig-NIF-i-cant|significant increase;statistically significant;significant impact|substantial;notable|insignificant|significance;significantly|The scheme led to a significant reduction in household waste.
subsequent|/ˈsʌb.sɪ.kwənt/|adjective|tiếp theo, xảy ra sau đó|Happening after something else.|Academic Core|C1|word|SUB-se-quent|subsequent development;subsequent years;subsequent investigation|following;later|preceding|subsequently|Subsequent studies produced similar results.
attainment|/əˈteɪn.mənt/|noun|thành tích đạt được|The act of achieving something, especially a skill or educational level.|Education|C1|word|a-TAIN-ment|educational attainment;academic attainment;levels of attainment|achievement;accomplishment|failure|attain;attainable|Parental involvement can improve educational attainment.
cognitive|/ˈkɒɡ.nɪ.tɪv/|adjective|thuộc nhận thức|Related to thinking, understanding, and remembering.|Education|C1|word|COG-ni-tive|cognitive development;cognitive ability;cognitive skills|mental;intellectual|physical|cognition;cognitively|Reading regularly supports children's cognitive development.
compulsory|/kəmˈpʌl.sər.i/|adjective|bắt buộc|Required by law or a rule.|Education|B2|word|com-PUL-so-ry|compulsory education;compulsory subject;make compulsory|mandatory;obligatory|optional|compulsion;compel|Primary education is compulsory in many countries.
curriculum|/kəˈrɪk.jə.ləm/|noun|chương trình học|The subjects and content taught by a school or educational institution.|Education|B2|word|cur-RIC-u-lum|school curriculum;core curriculum;curriculum reform|syllabus;programme|—|curricula;curricular|Financial literacy should be included in the school curriculum.
literacy|/ˈlɪt.ər.ə.si/|noun|khả năng đọc viết, hiểu biết nền tảng|The ability to read and write, or competence in a specific area.|Education|B2|word|LIT-er-a-cy|literacy rate;digital literacy;improve literacy|competence;proficiency|illiteracy|literate;illiterate|Digital literacy is becoming essential in modern workplaces.
proficiency|/prəˈfɪʃ.ən.si/|noun|sự thành thạo|A high level of skill or ability.|Education|C1|word|pro-FI-cien-cy|language proficiency;gain proficiency;level of proficiency|competence;mastery|inability|proficient;proficiently|Regular practice is essential for developing language proficiency.
tuition|/tjuˈɪʃ.ən/|noun|học phí, sự giảng dạy|Teaching, especially when given to a small group, or the fee paid for it.|Education|B2|word|tu-I-tion|tuition fees;private tuition;pay tuition|instruction;teaching|—|tutor;tutorial|Rising tuition fees may discourage low-income students.
vocational|/vəʊˈkeɪ.ʃən.əl/|adjective|thuộc đào tạo nghề|Related to education that prepares people for a particular job.|Education|C1|word|vo-CA-tion-al|vocational training;vocational skills;vocational course|occupational;career-focused|academic|vocation;vocationally|Vocational training can address shortages of skilled workers.
lifelong learning|/ˌlaɪf.lɒŋ ˈlɜː.nɪŋ/|noun phrase|học tập suốt đời|The continuous development of knowledge and skills throughout life.|Education|B2|phrase|life-long LEARN-ing|promote lifelong learning;commitment to lifelong learning;opportunities for lifelong learning|continuing education;adult learning|—|lifelong learner|Rapid technological change has increased the need for lifelong learning.
biodiversity|/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/|noun|đa dạng sinh học|The variety of plant and animal life in an environment.|Environment|C1|word|bio-di-VER-si-ty|protect biodiversity;loss of biodiversity;rich biodiversity|biological diversity;variety of life|uniformity|biodiverse|Habitat destruction is a major cause of biodiversity loss.
conservation|/ˌkɒn.səˈveɪ.ʃən/|noun|sự bảo tồn|The protection of nature, resources, or culturally important objects.|Environment|B2|word|con-ser-VA-tion|wildlife conservation;conservation efforts;energy conservation|preservation;protection|destruction|conserve;conservationist|Conservation programmes require long-term public support.
degradation|/ˌdeɡ.rəˈdeɪ.ʃən/|noun|sự suy thoái|The process by which something becomes damaged or worse.|Environment|C1|word|deg-ra-DA-tion|environmental degradation;land degradation;severe degradation|deterioration;decline|restoration|degrade;degraded|Industrial activity has accelerated environmental degradation.
detrimental|/ˌdet.rɪˈmen.təl/|adjective|có hại|Causing harm or damage.|Environment|C1|word|det-ri-MEN-tal|detrimental effect;detrimental to health;potentially detrimental|harmful;damaging|beneficial|detriment;detrimentally|Excessive consumption is detrimental to the environment.
emissions|/ɪˈmɪʃ.ənz/|plural noun|khí thải|Gases or substances released into the air.|Environment|B2|word|e-MIS-sions|carbon emissions;reduce emissions;vehicle emissions|discharges;releases|absorption|emission;emit|Public transport can help reduce carbon emissions.
mitigate|/ˈmɪt.ɪ.ɡeɪt/|verb|giảm mức độ nghiêm trọng|To make something harmful or unpleasant less severe.|Environment|C1|word|MIT-i-gate|mitigate the impact;mitigate risks;mitigation measures|alleviate;lessen|exacerbate|mitigation;mitigating|Green spaces can mitigate the effects of urban heat.
renewable|/rɪˈnjuː.ə.bəl/|adjective|có thể tái tạo|Able to be replaced naturally and not permanently depleted.|Environment|B2|word|re-NEW-a-ble|renewable energy;renewable resources;renewable source|sustainable;replenishable|non-renewable|renew;renewal|Investment in renewable energy can reduce dependence on fossil fuels.
sustainable|/səˈsteɪ.nə.bəl/|adjective|bền vững|Able to continue over time without damaging the environment or exhausting resources.|Environment|B2|word|sus-TAIN-a-ble|sustainable development;sustainable solution;environmentally sustainable|viable;eco-friendly|unsustainable|sustain;sustainability;sustainably|Cities need more sustainable transport systems.
ecological footprint|/ˌiː.kəˈlɒdʒ.ɪ.kəl ˈfʊt.prɪnt/|noun phrase|dấu chân sinh thái|The environmental impact of a person, activity, or population.|Environment|C1|phrase|eco-LOG-i-cal FOOT-print|reduce an ecological footprint;large ecological footprint;individual ecological footprint|environmental impact;carbon footprint|—|ecology;ecological|Consumers can reduce their ecological footprint by wasting less food.
automation|/ˌɔː.təˈmeɪ.ʃən/|noun|tự động hóa|The use of machines or software to perform work previously done by people.|Technology|C1|word|au-to-MA-tion|workplace automation;increased automation;automation technology|mechanisation;computerisation|manual labour|automate;automated|Automation may replace repetitive tasks but create new occupations.
breakthrough|/ˈbreɪk.θruː/|noun|bước đột phá|An important discovery or development that enables progress.|Technology|B2|word|BREAK-through|major breakthrough;scientific breakthrough;achieve a breakthrough|advance;discovery|setback|break through|The research could lead to a major medical breakthrough.
cybersecurity|/ˌsaɪ.bə.sɪˈkjʊə.rə.ti/|noun|an ninh mạng|The protection of computer systems and data from digital attacks.|Technology|C1|word|cyber-se-CUR-i-ty|cybersecurity threat;improve cybersecurity;cybersecurity measures|digital security;information security|vulnerability|cybersecure|Companies must invest more heavily in cybersecurity.
digital divide|/ˌdɪdʒ.ɪ.təl dɪˈvaɪd/|noun phrase|khoảng cách số|The gap between people who have access to digital technology and those who do not.|Technology|C1|phrase|DIG-i-tal di-VIDE|bridge the digital divide;widening digital divide;rural digital divide|technology gap;access gap|digital inclusion|digitally excluded|Affordable internet access can help bridge the digital divide.
innovation|/ˌɪn.əˈveɪ.ʃən/|noun|sự đổi mới|A new idea, method, or product, or the process of creating it.|Technology|B2|word|in-no-VA-tion|technological innovation;drive innovation;encourage innovation|invention;advancement|stagnation|innovate;innovative;innovator|Competition can encourage innovation and improve services.
obsolete|/ˈɒb.səl.iːt/|adjective|lỗi thời|No longer used because something newer has replaced it.|Technology|C1|word|OB-so-lete|become obsolete;render obsolete;obsolete technology|outdated;antiquated|current|obsolescence|Some technical skills quickly become obsolete.
surveillance|/səˈveɪ.ləns/|noun|sự giám sát|The careful observation of people or places, often for security.|Technology|C1|word|sur-VEIL-lance|mass surveillance;surveillance camera;under surveillance|monitoring;observation|privacy|surveil|Mass surveillance raises serious concerns about privacy.
technological advancement|/ˌtek.nəˈlɒdʒ.ɪ.kəl ədˈvɑːns.mənt/|noun phrase|tiến bộ công nghệ|An improvement or development in technology.|Technology|B2|phrase|tech-no-LOG-i-cal ad-VANCE-ment|rapid technological advancement;benefit from technological advancement;pace of technological advancement|technological progress;innovation|technological stagnation|advance;advanced|Technological advancements have transformed communication.
data privacy|/ˈdeɪ.tə ˌprɪv.ə.si/|noun phrase|quyền riêng tư dữ liệu|The protection and appropriate handling of personal information.|Technology|B2|phrase|DA-ta PRI-va-cy|protect data privacy;data privacy concerns;data privacy law|information privacy;digital privacy|data exposure|private;privately|Users are increasingly concerned about data privacy.
alleviate|/əˈliː.vi.eɪt/|verb|làm giảm, xoa dịu|To make pain, suffering, or a problem less severe.|Health|C1|word|a-LE-vi-ate|alleviate pain;alleviate poverty;alleviate symptoms|relieve;ease|aggravate|alleviation|Exercise can alleviate symptoms of stress and anxiety.
chronic|/ˈkrɒn.ɪk/|adjective|mãn tính, kéo dài|Continuing for a long time or repeatedly occurring.|Health|C1|word|CHRON-ic|chronic disease;chronic pain;chronic shortage|persistent;long-term|acute|chronically|Poor diets contribute to several chronic diseases.
epidemic|/ˌep.ɪˈdem.ɪk/|noun|dịch bệnh, sự gia tăng nghiêm trọng|A widespread occurrence of a disease or harmful behaviour in a community.|Health|B2|word|ep-i-DEM-ic|global epidemic;obesity epidemic;control an epidemic|outbreak;plague|containment|epidemiology;epidemiological|Some experts describe childhood obesity as an epidemic.
healthcare provision|/ˈhelθ.keə prəˈvɪʒ.ən/|noun phrase|việc cung cấp dịch vụ y tế|The supply and organisation of medical services.|Health|C1|phrase|HEALTH-care pro-VI-sion|improve healthcare provision;public healthcare provision;unequal healthcare provision|medical services;healthcare delivery|—|provide;provider|Rural communities often experience inadequate healthcare provision.
mortality|/mɔːˈtæl.ə.ti/|noun|tỷ lệ tử vong|The number of deaths in a population during a period.|Health|C1|word|mor-TAL-i-ty|mortality rate;infant mortality;reduce mortality|death rate;fatality|survival|mortal;immortality|Better sanitation has reduced infant mortality.
prevalence|/ˈprev.əl.əns/|noun|mức độ phổ biến|The fact or condition of being common within a population.|Health|C1|word|PREV-a-lence|high prevalence;growing prevalence;prevalence of obesity|frequency;incidence|rarity|prevalent|The prevalence of diabetes has risen in recent decades.
sedentary|/ˈsed.ən.tər.i/|adjective|ít vận động|Involving too much sitting and too little physical activity.|Health|C1|word|SED-en-ta-ry|sedentary lifestyle;sedentary behaviour;increasingly sedentary|inactive;stationary|active|sedentariness|A sedentary lifestyle increases the risk of heart disease.
well-being|/ˌwelˈbiː.ɪŋ/|noun|sức khỏe và trạng thái hạnh phúc|The state of being healthy, comfortable, and satisfied.|Health|B2|word|well-BE-ing|mental well-being;promote well-being;overall well-being|welfare;health|distress|wellness|Access to green spaces can improve mental well-being.
preventive care|/prɪˌven.tɪv ˈkeə/|noun phrase|chăm sóc phòng ngừa|Medical services intended to prevent illness before it develops.|Health|C1|phrase|pre-VEN-tive CARE|access to preventive care;invest in preventive care;preventive care services|preventive medicine;early intervention|emergency treatment|prevent;prevention|Preventive care can reduce long-term healthcare expenditure.
demographic|/ˌdem.əˈɡræf.ɪk/|adjective|thuộc nhân khẩu học|Related to the structure of populations and groups within them.|Society|C1|word|demo-GRAPH-ic|demographic change;demographic profile;demographic trend|population-based;social|individual|demography;demographically|Demographic changes are increasing demand for elderly care.
discrimination|/dɪˌskrɪm.ɪˈneɪ.ʃən/|noun|sự phân biệt đối xử|Unfair treatment based on a person's identity or group.|Society|B2|word|dis-crim-i-NA-tion|racial discrimination;face discrimination;tackle discrimination|prejudice;bias|equality|discriminate;discriminatory|Strong laws are needed to combat workplace discrimination.
inequality|/ˌɪn.ɪˈkwɒl.ə.ti/|noun|sự bất bình đẳng|An unfair difference in wealth, opportunity, or treatment.|Society|B2|word|in-e-QUAL-i-ty|income inequality;social inequality;reduce inequality|disparity;imbalance|equality|unequal;equally|Income inequality can undermine social stability.
marginalised|/ˈmɑː.dʒɪ.nəl.aɪzd/|adjective|bị gạt ra ngoài lề xã hội|Treated as unimportant and given little power or opportunity.|Society|C1|word|MAR-gin-al-ised|marginalised groups;socially marginalised;marginalised communities|excluded;disadvantaged|empowered|marginalise;marginalisation|Public services should be accessible to marginalised communities.
multicultural|/ˌmʌl.tiˈkʌl.tʃər.əl/|adjective|đa văn hóa|Including people and traditions from several cultures.|Society|B2|word|multi-CUL-tur-al|multicultural society;multicultural education;multicultural identity|diverse;multi-ethnic|homogeneous|multiculturalism|Multicultural societies can benefit from diverse perspectives.
social cohesion|/ˌsəʊ.ʃəl kəʊˈhiː.ʒən/|noun phrase|sự gắn kết xã hội|The strength of relationships and solidarity within a community.|Society|C1|phrase|SO-cial co-HE-sion|promote social cohesion;weaken social cohesion;strong social cohesion|social unity;community solidarity|social division|cohesive|Shared public spaces can promote social cohesion.
welfare|/ˈwel.feə/|noun|phúc lợi|The health, happiness, and financial support of people.|Society|B2|word|WEL-fare|welfare system;child welfare;welfare benefits|well-being;social support|neglect|—|A strong welfare system can protect vulnerable households.
vulnerable|/ˈvʌl.nər.ə.bəl/|adjective|dễ bị tổn thương|Exposed to the possibility of harm or disadvantage.|Society|B2|word|VUL-ner-a-ble|vulnerable groups;particularly vulnerable;vulnerable to|at risk;defenceless|protected|vulnerability|Older people are particularly vulnerable to extreme heat.
social mobility|/ˌsəʊ.ʃəl məʊˈbɪl.ə.ti/|noun phrase|khả năng dịch chuyển địa vị xã hội|The ability to move to a different social or economic position.|Society|C1|phrase|SO-cial mo-BIL-i-ty|upward social mobility;promote social mobility;barrier to social mobility|economic advancement;class mobility|social immobility|mobile|Education is often viewed as a route to social mobility.
entrepreneurship|/ˌɒn.trə.prəˈnɜː.ʃɪp/|noun|tinh thần và hoạt động khởi nghiệp|The activity of starting and developing businesses while taking financial risks.|Economy & Work|C1|word|en-tre-pre-NEUR-ship|promote entrepreneurship;youth entrepreneurship;entrepreneurship education|enterprise;business creation|dependency|entrepreneur;entrepreneurial|Tax incentives may encourage entrepreneurship.
expenditure|/ɪkˈspen.dɪ.tʃə/|noun|khoản chi, sự chi tiêu|The amount of money spent by a person, organisation, or government.|Economy & Work|C1|word|ex-PEN-di-ture|public expenditure;household expenditure;reduce expenditure|spending;outlay|income|expend|Healthcare accounts for a large share of public expenditure.
productivity|/ˌprɒd.ʌkˈtɪv.ə.ti/|noun|năng suất|The rate at which goods, services, or useful work are produced.|Economy & Work|B2|word|pro-duc-TIV-i-ty|boost productivity;labour productivity;productivity growth|efficiency;output|inefficiency|productive;productively|Flexible working may improve employee productivity.
unemployment|/ˌʌn.ɪmˈplɔɪ.mənt/|noun|tình trạng thất nghiệp|The condition of being without paid work while seeking employment.|Economy & Work|B2|word|un-em-PLOY-ment|unemployment rate;youth unemployment;reduce unemployment|joblessness;worklessness|employment|unemployed;employ|Youth unemployment remains a serious social challenge.
workforce|/ˈwɜːk.fɔːs/|noun|lực lượng lao động|All the people available for work in a country or organisation.|Economy & Work|B2|word|WORK-force|skilled workforce;enter the workforce;ageing workforce|labour force;employees|—|work;worker|Employers need a workforce with strong digital skills.
economic downturn|/ˌiː.kəˈnɒm.ɪk ˈdaʊn.tɜːn/|noun phrase|suy thoái kinh tế|A period when economic activity becomes weaker.|Economy & Work|C1|phrase|eco-NOM-ic DOWN-turn|severe economic downturn;during an economic downturn;economic downturn leads to|recession;economic decline|economic boom|economy;economic|Small businesses are especially vulnerable during an economic downturn.
disposable income|/dɪˌspəʊ.zə.bəl ˈɪn.kʌm/|noun phrase|thu nhập khả dụng|Money available to spend or save after taxes and essential costs.|Economy & Work|C1|phrase|dis-PO-sa-ble IN-come|household disposable income;increase disposable income;limited disposable income|available income;spending power|fixed expenses|dispose|Rising rents have reduced household disposable income.
job security|/ˈdʒɒb sɪˌkjʊə.rə.ti/|noun phrase|sự ổn định việc làm|The likelihood that a person will be able to keep their job.|Economy & Work|B2|phrase|JOB se-CUR-i-ty|greater job security;lack of job security;provide job security|employment stability;secure work|job insecurity|secure;security|Temporary workers often experience little job security.
financial incentive|/faɪˌnæn.ʃəl ɪnˈsen.tɪv/|noun phrase|động lực tài chính|A monetary reward intended to encourage a particular action.|Economy & Work|C1|phrase|fi-NAN-cial in-CEN-tive|offer a financial incentive;tax incentive;create incentives|monetary reward;inducement|disincentive|incentivise|Financial incentives can encourage households to save energy.
accountability|/əˌkaʊn.təˈbɪl.ə.ti/|noun|trách nhiệm giải trình|The obligation to explain decisions and accept responsibility.|Government & Crime|C1|word|ac-count-a-BIL-i-ty|public accountability;ensure accountability;hold accountable|responsibility;answerability|impunity|accountable|Transparency is necessary for greater government accountability.
corruption|/kəˈrʌp.ʃən/|noun|tham nhũng|Dishonest or illegal behaviour by people in positions of power.|Government & Crime|B2|word|cor-RUP-tion|political corruption;combat corruption;widespread corruption|bribery;dishonesty|integrity|corrupt;corruptible|Independent courts can help combat corruption.
deter|/dɪˈtɜː/|verb|ngăn chặn bằng cách làm nản lòng|To discourage someone from doing something by making it difficult or risky.|Government & Crime|C1|word|de-TER|deter crime;deter people from;effective deterrent|discourage;prevent|encourage|deterrent;deterrence|Visible policing may deter people from committing minor offences.
enforcement|/ɪnˈfɔːs.mənt/|noun|sự thực thi|The act of making sure laws and rules are obeyed.|Government & Crime|C1|word|en-FORCE-ment|law enforcement;strict enforcement;effective enforcement|implementation;application|noncompliance|enforce;enforceable|Regulations are ineffective without proper enforcement.
legislation|/ˌledʒ.ɪˈsleɪ.ʃən/|noun|luật pháp được ban hành|A law or set of laws made by a government.|Government & Crime|B2|word|leg-is-LA-tion|introduce legislation;existing legislation;environmental legislation|law;statute|lawlessness|legislate;legislative;legislator|New legislation restricts the sale of harmful products.
rehabilitation|/ˌriː.həˌbɪl.ɪˈteɪ.ʃən/|noun|sự phục hồi, cải tạo|The process of helping someone return to a healthy or productive life.|Government & Crime|C1|word|re-ha-bil-i-TA-tion|prisoner rehabilitation;rehabilitation programme;focus on rehabilitation|recovery;reintegration|punishment|rehabilitate;rehabilitated|Prisons should place greater emphasis on rehabilitation.
regulation|/ˌreɡ.jəˈleɪ.ʃən/|noun|quy định, sự điều tiết|An official rule or the process of controlling an activity.|Government & Crime|B2|word|reg-u-LA-tion|strict regulation;government regulation;safety regulations|rule;control|deregulation|regulate;regulatory|Stricter regulation may improve consumer safety.
deterrent|/dɪˈter.ənt/|noun|biện pháp răn đe|Something that discourages an action by creating fear or difficulty.|Government & Crime|C1|word|de-TER-rent|effective deterrent;act as a deterrent;strong deterrent|discouragement;preventive measure|incentive|deter;deterrence|A fine is only effective if it acts as a real deterrent.
congestion|/kənˈdʒes.tʃən/|noun|sự ùn tắc|A situation in which roads or places are overcrowded and movement is difficult.|Cities & Transport|B2|word|con-JES-tion|traffic congestion;reduce congestion;severe congestion|overcrowding;gridlock|free flow|congest;congested|Congestion charges can reduce traffic in city centres.
commute|/kəˈmjuːt/|verb|đi lại thường xuyên giữa nhà và nơi làm việc|To travel regularly between home and work or study.|Cities & Transport|B2|word|com-MUTE|daily commute;long commute;commute to work|travel;journey|—|commuter;commuting|Many residents commute to the capital each day.
infrastructure|/ˈɪn.frəˌstrʌk.tʃə/|noun|cơ sở hạ tầng|The basic systems and facilities needed for a society or organisation.|Cities & Transport|B2|word|IN-fra-struc-ture|transport infrastructure;public infrastructure;invest in infrastructure|facilities;framework|—|infrastructural|Rapid growth has placed pressure on urban infrastructure.
pedestrian|/pəˈdes.tri.ən/|noun|người đi bộ|A person who is walking, especially near roads.|Cities & Transport|B2|word|pe-DES-tri-an|pedestrian safety;pedestrian zone;pedestrian crossing|walker;person on foot|motorist|pedestrianise|Wider pavements would improve pedestrian safety.
public transport|/ˌpʌb.lɪk ˈtræn.spɔːt/|noun phrase|giao thông công cộng|Transport services available for use by the general public.|Cities & Transport|B1|phrase|PUB-lic TRANS-port|reliable public transport;public transport network;use public transport|mass transit;public transit|private transport|transportation|Affordable public transport can reduce car dependency.
residential|/ˌrez.ɪˈden.ʃəl/|adjective|thuộc khu dân cư|Designed for people to live in rather than for business or industry.|Cities & Transport|B2|word|res-i-DEN-tial|residential area;residential property;densely residential|housing;domestic|commercial|residence;resident|Heavy traffic should be diverted away from residential areas.
urbanisation|/ˌɜː.bən.aɪˈzeɪ.ʃən/|noun|đô thị hóa|The process by which more people move to cities and cities expand.|Cities & Transport|C1|word|ur-ban-i-SA-tion|rapid urbanisation;uncontrolled urbanisation;pace of urbanisation|city growth;urban development|ruralisation|urban;urbanise|Rapid urbanisation has increased demand for affordable housing.
urban sprawl|/ˌɜː.bən ˈsprɔːl/|noun phrase|sự đô thị lan rộng thiếu kiểm soát|The uncontrolled expansion of a city into surrounding land.|Cities & Transport|C1|phrase|UR-ban SPRAWL|limit urban sprawl;uncontrolled urban sprawl;effects of urban sprawl|suburban expansion;city spread|compact development|sprawl|Urban sprawl often increases dependence on private cars.
housing shortage|/ˈhaʊ.zɪŋ ˌʃɔː.tɪdʒ/|noun phrase|tình trạng thiếu nhà ở|A situation in which there are not enough homes for the population.|Cities & Transport|B2|phrase|HOU-sing SHORT-age|severe housing shortage;address a housing shortage;affordable housing shortage|lack of housing;housing deficit|housing surplus|house;housing|Many fast-growing cities face a severe housing shortage.
censorship|/ˈsen.sə.ʃɪp/|noun|sự kiểm duyệt|The suppression or control of information, speech, or media.|Media & Culture|C1|word|CEN-sor-ship|media censorship;government censorship;strict censorship|suppression;restriction|free expression|censor;censored|Excessive censorship can restrict freedom of expression.
credibility|/ˌkred.əˈbɪl.ə.ti/|noun|độ tin cậy|The quality of being trusted and believed.|Media & Culture|C1|word|cred-i-BIL-i-ty|source credibility;lose credibility;enhance credibility|trustworthiness;reliability|doubt|credible;credibly|Anonymous sources may have limited credibility.
cultural diversity|/ˌkʌl.tʃər.əl daɪˈvɜː.sə.ti/|noun phrase|đa dạng văn hóa|The presence of different cultural groups and traditions.|Media & Culture|B2|phrase|CUL-tur-al di-VER-si-ty|promote cultural diversity;celebrate cultural diversity;rich cultural diversity|multiculturalism;cultural variety|cultural uniformity|diverse|Migration can contribute to cultural diversity.
cultural heritage|/ˌkʌl.tʃər.əl ˈher.ɪ.tɪdʒ/|noun phrase|di sản văn hóa|Traditions, places, and objects inherited from past generations.|Media & Culture|B2|phrase|CUL-tur-al HER-i-tage|preserve cultural heritage;intangible cultural heritage;heritage site|cultural legacy;tradition|cultural loss|inherit;heritage|Tourism revenue can help preserve cultural heritage.
mainstream media|/ˌmeɪn.striːm ˈmiː.di.ə/|noun phrase|truyền thông chính thống|Large, established news organisations reaching a broad audience.|Media & Culture|C1|phrase|MAIN-stream ME-di-a|mainstream media coverage;mainstream media outlets;trust in mainstream media|mass media;traditional media|alternative media|—|Some audiences no longer rely exclusively on mainstream media.
misinformation|/ˌmɪs.ɪn.fəˈmeɪ.ʃən/|noun|thông tin sai lệch|False or inaccurate information, whether shared deliberately or not.|Media & Culture|C1|word|mis-in-for-MA-tion|spread misinformation;combat misinformation;online misinformation|false information;inaccuracy|verified information|misinform;misinformed|Social platforms can accelerate the spread of misinformation.
consumerism|/kənˈsjuː.mə.rɪ.zəm/|noun|chủ nghĩa tiêu dùng|The belief or culture that encourages the continual purchase of goods.|Media & Culture|C1|word|con-SU-mer-ism|culture of consumerism;excessive consumerism;promote consumerism|materialism;consumption culture|minimalism|consumer;consume|Advertising is often criticised for promoting consumerism.
media exposure|/ˈmiː.di.ə ɪkˌspəʊ.ʒə/|noun phrase|mức độ tiếp xúc với truyền thông|The amount of contact a person has with media content.|Media & Culture|C1|phrase|ME-di-a ex-PO-sure|extensive media exposure;early media exposure;limit media exposure|media contact;screen exposure|media isolation|expose;exposure|Early media exposure may shape children's preferences.
fluctuate|/ˈflʌk.tʃu.eɪt/|verb|dao động|To rise and fall irregularly in number or amount.|Data & Trends|C1|word|FLUC-tu-ate|fluctuate considerably;prices fluctuate;fluctuate between|vary;oscillate|stabilise|fluctuation;fluctuating|Oil prices fluctuated considerably during the period.
peak|/piːk/|verb|đạt đỉnh|To reach the highest level or amount.|Data & Trends|B2|word|PEAK|peak at;reach a peak;peak in July|reach a maximum;top out|bottom out|peak;peaked|The figure peaked at 75 percent in 2024.
plateau|/ˈplæt.əʊ/|verb|chững lại ở một mức|To stop increasing or decreasing and remain at a stable level.|Data & Trends|C1|word|PLA-teau|plateau at;reach a plateau;then plateaued|level off;stabilise|fluctuate|plateaued|After rising rapidly, sales plateaued at around 50,000 units.
plummet|/ˈplʌm.ɪt/|verb|giảm mạnh|To fall suddenly and by a large amount.|Data & Trends|C1|word|PLUM-met|plummet dramatically;prices plummeted;plummet to|plunge;collapse|soar|plummeted|Demand plummeted after the subsidy was removed.
soar|/sɔː/|verb|tăng vọt|To increase quickly to a high level.|Data & Trends|C1|word|SOAR|soar dramatically;costs soared;soar to|surge;rocket|plummet|soaring|Housing prices soared during the first half of the year.
marginal|/ˈmɑː.dʒɪ.nəl/|adjective|nhỏ, không đáng kể|Very small in amount or effect.|Data & Trends|C1|word|MAR-gin-al|marginal increase;marginal difference;only marginal|slight;minimal|substantial|margin;marginally|There was only a marginal increase in bus usage.
substantial|/səbˈstæn.ʃəl/|adjective|đáng kể, lớn|Large in amount, value, or importance.|Data & Trends|B2|word|sub-STAN-tial|substantial increase;substantial proportion;substantial evidence|considerable;significant|negligible|substantially|The city experienced a substantial rise in population.
proportion|/prəˈpɔː.ʃən/|noun|tỷ lệ, phần|A part or share of a whole.|Data & Trends|B2|word|pro-POR-tion|large proportion;proportion of;in proportion to|percentage;share|whole|proportional;proportionally|A higher proportion of young adults lived in cities.
respectively|/rɪˈspek.tɪv.li/|adverb|theo thứ tự tương ứng|In the same order as the people or things previously mentioned.|Data & Trends|C1|word|re-SPEC-tive-ly|were respectively;at 20 and 30 respectively;ranked respectively|in that order;correspondingly|—|respective|France and Italy recorded 42 and 38 percent respectively.
account for|/əˈkaʊnt fɔː/|phrasal verb|chiếm, giải thích cho|To form a particular amount of a total or explain a result.|Data & Trends|B2|phrase|ac-COUNT FOR|account for the majority;account for 30 percent;largely account for|constitute;represent|exclude|account;accounting|Online sales accounted for almost half of total revenue.
remain stable|/rɪˌmeɪn ˈsteɪ.bəl/|verb phrase|duy trì ổn định|To continue at approximately the same level.|Data & Trends|B2|collocation|re-MAIN STA-ble|remain relatively stable;remain stable at;figures remained stable|stay constant;level off|fluctuate|stability;stabilise|The unemployment rate remained stable at around six percent.
upward trend|/ˈʌp.wəd trend/|noun phrase|xu hướng tăng|A general pattern of increase over time.|Data & Trends|B2|collocation|UP-ward TREND|show an upward trend;clear upward trend;continue the upward trend|rising trend;growth pattern|downward trend|trend upwards|The data show a clear upward trend in renewable energy use.
exacerbate|/ɪɡˈzæs.ə.beɪt/|verb|làm trầm trọng hơn|To make an existing problem or negative situation worse.|High-value Language|C1|word|ex-AC-er-bate|exacerbate inequality;exacerbate the problem;further exacerbate|aggravate;worsen|alleviate|exacerbation|High housing costs may exacerbate social inequality.
advocate|/ˈæd.və.keɪt/|verb|ủng hộ công khai|To publicly support a policy, idea, or course of action.|High-value Language|C1|word|AD-vo-cate|advocate reform;strongly advocate;advocate for change|support;promote|oppose|advocacy;advocate|Many experts advocate greater investment in preventive care.
controversial|/ˌkɒn.trəˈvɜː.ʃəl/|adjective|gây tranh cãi|Causing strong disagreement or public debate.|High-value Language|B2|word|con-tro-VER-sial|highly controversial;controversial issue;remain controversial|contentious;disputed|uncontroversial|controversy;controversially|The use of facial recognition remains controversial.
ethical|/ˈeθ.ɪ.kəl/|adjective|thuộc đạo đức|Related to principles about what is morally right and wrong.|High-value Language|B2|word|ETH-i-cal|ethical concern;ethical dilemma;ethically acceptable|moral;principled|unethical|ethics;ethically|Artificial intelligence raises several ethical concerns.
implication|/ˌɪm.plɪˈkeɪ.ʃən/|noun|hệ quả, hàm ý|A possible effect or meaning of an action or finding.|High-value Language|C1|word|im-pli-CA-tion|far-reaching implications;implication for;policy implications|consequence;significance|—|imply;implicit|The decision has serious implications for future generations.
prevalent|/ˈprev.əl.ənt/|adjective|phổ biến rộng rãi|Common or widespread in a particular place or group.|High-value Language|C1|word|PREV-a-lent|highly prevalent;increasingly prevalent;prevalent among|widespread;common|rare|prevalence|Stress-related illness is increasingly prevalent among employees.
tackle|/ˈtæk.əl/|verb|giải quyết một vấn đề khó|To make a determined effort to deal with a difficult problem.|High-value Language|B2|word|TACK-le|tackle a problem;tackle inequality;effectively tackle|address;confront|ignore|—|Governments must tackle the root causes of homelessness.
far-reaching consequences|/ˌfɑːˈriː.tʃɪŋ ˈkɒn.sɪ.kwən.sɪz/|noun phrase|hệ quả sâu rộng|Effects that influence many people or continue for a long time.|High-value Language|C1|collocation|far-REACH-ing CON-se-quen-ces|have far-reaching consequences;potentially far-reaching consequences;far-reaching social consequences|profound effects;wide-ranging implications|minor effects|consequence;consequential|Climate inaction may have far-reaching consequences.
pose a threat to|/pəʊz ə ˈθret tuː/|verb phrase|gây ra mối đe dọa đối với|To create a danger or risk for someone or something.|High-value Language|B2|collocation|POSE a THREAT to|pose a serious threat to;pose a potential threat to;pose no threat to|endanger;jeopardise|protect|threat;threaten|Habitat destruction poses a serious threat to biodiversity.
play a crucial role in|/pleɪ ə ˌkruː.ʃəl ˈrəʊl ɪn/|verb phrase|đóng vai trò then chốt trong|To be extremely important in a process or result.|High-value Language|B2|collocation|play a CRU-cial ROLE in|play a crucial role in development;play an increasingly crucial role;continue to play a crucial role|be essential to;be instrumental in|be irrelevant to|crucial;crucially|Teachers play a crucial role in children's development.
to a certain extent|/tuː ə ˌsɜː.tən ɪkˈstent/|adverbial phrase|ở một mức độ nhất định|Partly, but not completely.|High-value Language|B2|phrase|to a CER-tain ex-TENT|agree to a certain extent;true to a certain extent;only to a certain extent|partly;up to a point|completely|extent;extensive|Technology can solve this problem to a certain extent.
double-edged sword|/ˌdʌb.əl.edʒd ˈsɔːd/|idiom|con dao hai lưỡi|Something that has both beneficial and harmful effects.|High-value Language|C1|phrase|DOUBLE-edged SWORD|be a double-edged sword;technology as a double-edged sword;prove a double-edged sword|mixed blessing;two-sided issue|clear benefit|—|Social media can be a double-edged sword for young people.
`.trim();

const splitList = (value: string) =>
  value === "—" ? [] : value.split(";").map((item) => item.trim()).filter(Boolean);

const curatedLexicon: WordEntry[] = rawLexicon.split("\n").map((line, index) => {
  const [
    term,
    ipa,
    partOfSpeech,
    meaningVi,
    definitionEn,
    topic,
    level,
    kind,
    stress,
    collocations,
    synonyms,
    antonyms,
    family,
    example,
  ] = line.split("|");

  return {
    id: `${term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${index}`,
    term,
    ipa,
    partOfSpeech,
    meaningVi,
    definitionEn,
    topic,
    level,
    kind: kind as LexiconKind,
    stress,
    collocations: splitList(collocations),
    synonyms: splitList(synonyms),
    antonyms: splitList(antonyms),
    family: splitList(family),
    example,
  };
});

const awlByTerm = new Map(
  awlSourceEntries.map((entry) => [entry.term.toLowerCase(), entry]),
);

const curatedWithAwlTags = curatedLexicon.map((entry) => ({
  ...entry,
  awlSublist: awlByTerm.get(entry.term.toLowerCase())?.sublist,
}));

const curatedTerms = new Set(curatedWithAwlTags.map((entry) => entry.term.toLowerCase()));

const awlSupplement: WordEntry[] = awlSourceEntries
  .filter((entry) => !curatedTerms.has(entry.term.toLowerCase()))
  .map((entry) => ({
    id: `awl-${entry.term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    term: entry.term,
    ipa: entry.ipa,
    partOfSpeech: entry.partOfSpeech,
    meaningVi: entry.meaningVi,
    definitionEn: entry.definitionEn,
    topic: "Academic Word List",
    level: entry.level,
    kind: "word",
    stress: entry.stress,
    collocations: entry.collocations,
    synonyms: entry.synonyms,
    antonyms: entry.antonyms,
    family: entry.family,
    example: entry.example,
    awlSublist: entry.sublist,
  }));

export const lexicon: WordEntry[] = [...curatedWithAwlTags, ...awlSupplement];

export const topics = ["Tất cả", ...Array.from(new Set(lexicon.map((item) => item.topic)))];

export const lexiconStats = {
  entries: lexicon.length,
  collocations: lexicon.reduce((total, item) => total + item.collocations.length, 0),
  synonyms: lexicon.reduce((total, item) => total + item.synonyms.length, 0),
  topics: topics.length - 1,
  awlHeadwords: AWL_HEADWORD_COUNT,
};
