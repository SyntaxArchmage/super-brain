const WIKI = {
  taxonomy: [
    {
      id: "core",
      label: "三电系统",
      children: [
        { id: "battery", label: "动力电池", type: "article" },
      ]
    },
    {
      id: "driving",
      label: "驾驶与底盘",
      children: [
        { id: "chassis", label: "底盘与悬架", type: "article" },
        { id: "adas", label: "智能驾驶", type: "article" },
      ]
    },
    {
      id: "comfort",
      label: "舒适与空间",
      children: [
        { id: "seating", label: "座椅与空间", type: "article" },
        { id: "motion-sick", label: "防晕车技术", type: "article" },
      ]
    },
    {
      id: "aftersale",
      label: "售后服务",
      children: [
        { id: "charging-service", label: "充电服务", type: "article" },
        { id: "repair-network", label: "维修点覆盖", type: "article" },
        { id: "maintenance-cost", label: "保养与维修报价", type: "article" },
        { id: "warranty", label: "质保年限", type: "article" },
      ]
    },
    {
      id: "safety",
      label: "安全防护",
      children: [
        { id: "crash-safety", label: "碰撞与车身安全", type: "article" },
      ]
    },
    {
      id: "cockpit",
      label: "智能座舱",
      children: [
        { id: "smart-cockpit", label: "车机与影音娱乐", type: "article" },
      ]
    },
    {
      id: "powertrain",
      label: "续航与动力",
      children: [
        { id: "range-charging", label: "续航与补能", type: "article" },
        { id: "performance", label: "动力性能", type: "article" },
      ]
    },
    {
      id: "policy",
      label: "购车政策",
      children: [
        { id: "shanghai-policy", label: "上海购车政策", type: "article" },
      ]
    },
    {
      id: "value",
      label: "选购决策",
      children: [
        { id: "price-value", label: "价格与性价比", type: "article" },
        { id: "recommendation", label: "综合推荐", type: "article" },
      ]
    }
  ],

  pages: {
    index: {
      title: "上海新能源 MPV 购车调研",
      subtitle: "多维度深度拆解 · 逐项调研 · 纯电 / 插混 / 增程 · 2025-2026",
      type: "index"
    },

    battery: {
      title: "动力电池深度调研",
      subtitle: "逐车型拆解电池供应商、电芯化学体系、容量规格、充电倍率与技术路线，构建电池维度的横向质量对比。",
      domain: "三电系统",
      type: "article",
      meta: [
        { text: "数据来源：工信部申报 + 官方参数 + 供应链调研", dot: "#2563eb" },
        { text: "覆盖 11 款车型" },
        { text: "概念卡片：8 个" }
      ],
      body: `
<h2>电池总览对比表</h2>
<p>下表汇总了所有调研车型的动力电池核心参数。电池的关键技术包括800V高压平台带来的快充能力、C倍率决定的充电速度、CTP技术对能量密度的提升、以及热管理系统对安全和冬季性能的保障。电池约占整车成本 30-40%，其供应商实力、化学体系选择直接决定了续航、补能和安全三大体验指标。</p>

<div class="data-table-wrap">
<table class="data-table">
<thead>
<tr><th>车型</th><th>动力类型</th><th>电池供应商</th><th>电芯化学体系</th><th>电池容量</th><th>电压平台</th><th>充电倍率</th><th>CLTC纯电续航</th><th>10→80%充电</th></tr>
</thead>
<tbody>
<tr><td><strong>腾势D9 EV</strong></td><td>纯电</td><td>弗迪电池（比亚迪）</td><td>磷酸锰铁锂+硅碳负极</td><td>115 kWh</td><td>—</td><td>闪充</td><td>800 km</td><td>~9 min</td></tr>
<tr><td><strong>腾势D9 DM-i</strong></td><td>插混</td><td>弗迪电池（比亚迪）</td><td>磷酸锰铁锂+硅碳负极</td><td>66.5 kWh</td><td>—</td><td>闪充</td><td>401 km</td><td>~5 min</td></tr>
<tr><td><strong>极氪009 四驱</strong></td><td>纯电</td><td>时代吉利（宁德时代）</td><td>三元锂（麒麟电池）</td><td>115 kWh</td><td>900V</td><td>6C</td><td>720 km</td><td>10 min</td></tr>
<tr><td><strong>极氪009 两驱</strong></td><td>纯电</td><td>时代吉利（宁德时代）</td><td>三元锂（麒麟电池）</td><td>108 kWh</td><td>800V</td><td>—</td><td>740 km</td><td>—</td></tr>
<tr><td><strong>小鹏X9 纯电 长续航</strong></td><td>纯电</td><td>中创新航 (CALB)</td><td>三元锂 159Ah</td><td>~105 kWh</td><td>800V</td><td>5C</td><td>740 km</td><td>~12 min</td></tr>
<tr><td><strong>小鹏X9 纯电 标准</strong></td><td>纯电</td><td>中创新航 (CALB)</td><td>磷酸铁锂 140Ah</td><td>~94.8 kWh</td><td>800V</td><td>5C</td><td>650 km</td><td>~12 min</td></tr>
<tr><td><strong>小鹏X9 增程</strong></td><td>增程</td><td>中创新航 (CALB)</td><td>磷酸铁锂 117Ah</td><td>63.3 kWh</td><td>800V</td><td>5C</td><td>452 km</td><td>~12 min</td></tr>
<tr><td><strong>理想MEGA</strong></td><td>纯电</td><td>宁德时代 (CATL)</td><td>三元锂（麒麟5C）</td><td>102.7 kWh</td><td>800V</td><td>5C</td><td>710 km</td><td>~8 min</td></tr>
<tr><td><strong>岚图梦想家 PHEV</strong></td><td>插混</td><td>宁德时代 (CATL)</td><td>三元锂</td><td>62.5 kWh</td><td>800V</td><td>5C</td><td>350 km</td><td>~12 min</td></tr>
<tr><td><strong>岚图梦想家 EV</strong></td><td>纯电</td><td>宁德时代 (CATL)</td><td>三元锂</td><td>108.7 kWh</td><td>—</td><td>常规</td><td>700 km</td><td>~30 min</td></tr>
<tr><td><strong>合创V09 762版</strong></td><td>纯电</td><td>巨湾技研 (GBT)</td><td>三元锂 XFC极速电芯</td><td>114.19 kWh</td><td>800V</td><td>4C</td><td>762 km</td><td>~10 min</td></tr>
<tr><td><strong>合创V09 620版</strong></td><td>纯电</td><td>中创新航 (CALB)</td><td>三元锂 / 磷酸铁锂</td><td>92~95 kWh</td><td>800V</td><td>常规</td><td>620 km</td><td>~30 min</td></tr>
<tr><td><strong>别克GL8陆尊 PHEV</strong></td><td>插混</td><td>江苏正力新能</td><td>三元锂</td><td>34.8 kWh</td><td>—</td><td>5C</td><td>202 km</td><td>~15 min</td></tr>
<tr><td><strong>星海V9 长续航</strong></td><td>插混</td><td>未公开</td><td>磷酸铁锂</td><td>34.9 kWh</td><td>—</td><td>常规</td><td>200 km</td><td>~18 min</td></tr>
<tr><td><strong>星海V9 标准</strong></td><td>插混</td><td>未公开</td><td>三元锂</td><td>20.2 kWh</td><td>—</td><td>常规</td><td>100 km</td><td>—</td></tr>
</tbody>
</table>
</div>

<h2>电池供应商格局</h2>
<p>MPV 市场的电池供应链呈现「头部集中 + 特色玩家」的格局。宁德时代和弗迪电池两大巨头占据多数份额，中创新航凭借小鹏独家合作快速崛起，巨湾技研则以极速充电技术打出差异化。</p>

<h3>弗迪电池（比亚迪）→ 腾势D9</h3>
<p>第二代腾势D9全系搭载弗迪电池生产的<strong>第二代刀片电池</strong>。该电池采用磷酸锰铁锂复合正极与硅碳负极材料，正极使用单晶化材料缩短锂离子迁移路径，负极重构电极结构防止快充析锂，电解液为低粘度配方（-40°C 不凝固），电池内阻降低 50%。配合刀片电池超大散热面积和液冷直贴设计，实现「全链路离子闪通」。</p>

<div class="evidence">
<div class="ev-label">关键数据</div>
<p>纯电版 115 kWh，常温 10%-70% 仅需 5 分钟，10%-97% 仅需 9 分钟。在零下 30°C 极寒环境下，充电时间仅比常温多 3 分钟。这是目前 MPV 品类中冷启动充电表现最好的电池方案。</p>
</div>

<h3>宁德时代 (CATL) → 极氪009 / 理想MEGA / 岚图梦想家</h3>
<p>宁德时代是 MPV 市场最大的第三方电池供应商，为三个品牌提供电池。但三家车型使用的是不同产品线：</p>
<ul>
<li><strong>极氪009</strong>：时代吉利生产的 6C 麒麟电池（三元锂），115 kWh，全栈 900V 架构，峰值充电功率 705kW，10 min 补能 510 km。这是 MPV 品类中充电倍率最高的方案。</li>
<li><strong>理想MEGA</strong>：宁德时代独供的麒麟 5C 电池（三元锂），102.7 kWh，CTP 3.0 架构，电芯能量密度 255 Wh/kg。理想与宁德时代历时三年联合研发，宁德时代为此专门建设了超级产线。</li>
<li><strong>岚图梦想家</strong>：PHEV 版搭载 62.5 kWh 三元锂电池，支持 5C 超充（峰值 320 kW）；EV 版搭载 108.7 kWh 三元锂电池，为常规充电。</li>
</ul>

<div class="analysis">
<div class="an-label">供应链分析</div>
<p>虽然三家都用宁德时代电池，但技术代差明显：极氪009 的 6C/900V 是目前最高规格；理想MEGA 的 5C/800V 次之但能量密度更高（255 Wh/kg）；岚图 PHEV 的 5C 虽然倍率相同但峰值功率仅 320 kW（受限于混动架构），EV 版甚至不支持超充。选宁德时代电池不等于充电一样快——平台架构和电池产品线才是关键。</p>
</div>

<h3>中创新航 (CALB) → 小鹏X9 / 合创V09</h3>
<p>中创新航是小鹏X9 全系（纯电+增程）的独家电池供应商。小鹏X9 增程版搭载的是行业首款量产 5C 超充磷酸铁锂增程电池（63.3 kWh），纯电版长续航版则使用三元锂 159Ah 电芯（~105 kWh），标准续航版使用磷酸铁锂 140Ah 电芯。</p>
<p>合创V09 的常规版本（620 km）同样由中创新航供应，三元锂/磷酸铁锂双路线，但不支持 4C 超充。</p>

<h3>巨湾技研 (GBT) → 合创V09 超充版</h3>
<p>合创V09 的 762 km 超充版搭载巨湾技研定制开发的 XFC 极速电池包（三元锂，114.19 kWh），能量密度 153 Wh/kg，峰值快充功率 410 kW（4C），是全球首款搭载 800V + 4C 超充的量产 MPV。巨湾技研是广汽集团孵化的民营控股高科技企业，专攻极速充电领域。</p>

<h3>江苏正力新能 → 别克GL8陆尊 PHEV</h3>
<p>新款别克GL8陆尊 PHEV 搭载正力新能生产的三元锂电池（34.8 kWh），支持 5C 超充，峰值功率 186 kW。正力新能前身为中航锂电旗下子公司，2022 年独立运营后主攻乘用车插混市场。</p>

<h2>化学体系路线之争</h2>
<p>在 MPV 电池领域，磷酸铁锂与三元锂两大路线并存，但用途分工已越来越清晰：</p>

<div class="data-table-wrap">
<table class="data-table compact">
<thead>
<tr><th>维度</th><th>磷酸铁锂 (LFP)</th><th>三元锂 (NCM/NCA)</th></tr>
</thead>
<tbody>
<tr><td>能量密度</td><td>135-180 Wh/kg</td><td>200-260 Wh/kg</td></tr>
<tr><td>成本</td><td>600-800 元/kWh</td><td>800-1200 元/kWh</td></tr>
<tr><td>安全性</td><td>热稳定性优，不易热失控</td><td>需更复杂的热管理</td></tr>
<tr><td>低温表现</td><td>衰减较明显（-20°C 约 30-40%）</td><td>衰减较小（-20°C 约 15-25%）</td></tr>
<tr><td>循环寿命</td><td>3000+ 次</td><td>1500-2000 次</td></tr>
<tr><td>适用车型</td><td>增程/插混大电池、纯电标准续航</td><td>纯电长续航、超充旗舰</td></tr>
</tbody>
</table>
</div>

<div class="analysis">
<div class="an-label">路线选择解读</div>
<p>腾势D9 的「磷酸锰铁锂」是第三条路线——在 LFP 基础上掺锰提升电压平台和能量密度，同时保留 LFP 的安全和成本优势。比亚迪将其定义为「第二代刀片电池」，是目前唯一量产装车的 LMFP 方案。小鹏X9 增程版使用 LFP + 5C 超充也是行业首创，证明磷酸铁锂同样可以实现高倍率充电。三元锂阵营则以宁德时代麒麟电池为代表，在能量密度和充电功率上持续领跑。</p>
</div>

<h2>电压平台与充电速度</h2>
<p>高压平台是实现超快充的基础设施。电压越高，相同充电功率下电流越小，发热越少，充电速度天花板越高。</p>

<div class="data-table-wrap">
<table class="data-table compact">
<thead>
<tr><th>平台等级</th><th>代表车型</th><th>峰值功率</th><th>10→80% 时间</th><th>实际体验</th></tr>
</thead>
<tbody>
<tr><td><strong>900V + 6C</strong></td><td>极氪009 四驱</td><td>705 kW</td><td>10 min</td><td>服务区泡面时间回血 500km</td></tr>
<tr><td><strong>800V + 5C</strong></td><td>理想MEGA / 小鹏X9 / 岚图PHEV</td><td>320-520 kW</td><td>8-12 min</td><td>一杯咖啡时间满电出发</td></tr>
<tr><td><strong>800V + 4C</strong></td><td>合创V09 超充版</td><td>410 kW</td><td>~10 min</td><td>接近 5C 体验</td></tr>
<tr><td><strong>比亚迪闪充</strong></td><td>腾势D9</td><td>—</td><td>5-9 min</td><td>极寒仅多 3 min，全天候最稳</td></tr>
<tr><td><strong>常规快充</strong></td><td>岚图EV / 合创620 / 星海V9</td><td>106-158 kW</td><td>18-35 min</td><td>需要耐心等待</td></tr>
</tbody>
</table>
</div>

<div class="note">
<div class="note-label">选购提醒</div>
<p>超充速度不仅取决于车辆本身，还取决于充电桩。6C/900V 的极氪009 需要极氪超充站才能发挥全部实力；5C 的理想MEGA 在理想超充站（3900+ 站）覆盖最广；比亚迪闪充站则依托比亚迪体系全国密布。<strong>买超充车之前，先看你家/公司/常跑路线附近有没有对应品牌的超充桩。</strong></p>
</div>

<h2>电池安全与质保</h2>
<p>电池安全是所有用户最关心的底线。各品牌在新国标（2026.7.1 实施）之前已纷纷提前达标：</p>
<ul>
<li><strong>腾势D9</strong>：第二代刀片电池，针刺不起火不冒烟（LFP 天然优势），比亚迪终身电芯质保。</li>
<li><strong>极氪009</strong>：麒麟电池 CTP 架构 + 双大面水冷，三排电芯独立隔热，电池包 10 万公里 SOH 97%+。</li>
<li><strong>小鹏X9</strong>：4-3-4 立体电池防护框架，抗 2000kg 底部冲击，单电芯热失控 24 小时不起火不爆炸，提前满足 2026 新国标。</li>
<li><strong>理想MEGA</strong>：单体失效率降至 PPB（十亿分之一）级别，每块裸电芯可追溯 20 年超 1 万项数据。双呼吸散热系统降低快充对电池的伤害。</li>
<li><strong>合创V09</strong>：XFC 电池热失控 2 小时不起火，可抗枪弹射击，IP68 防护。</li>
</ul>

<h2>电池质量综合评级</h2>
<p>综合电池容量、供应商实力、充电倍率、安全技术和质保政策，各车型电池维度评级如下：</p>

<div class="data-table-wrap">
<table class="data-table compact">
<thead>
<tr><th>车型</th><th>电池综合评级</th><th>核心优势</th><th>主要短板</th></tr>
</thead>
<tbody>
<tr><td><strong>极氪009 四驱</strong></td><td class="rating-s">S</td><td>6C/900V 行业最高规格，10 min 补 510km</td><td>入门版非 900V</td></tr>
<tr><td><strong>腾势D9 EV</strong></td><td class="rating-s">S</td><td>115kWh + 闪充，极寒充电最稳</td><td>未公布电压平台</td></tr>
<tr><td><strong>理想MEGA</strong></td><td class="rating-a">A+</td><td>5C 麒麟 + 超低电耗 15.9kWh，电池寿命最优</td><td>仅 800V（非 900V）</td></tr>
<tr><td><strong>小鹏X9 纯电</strong></td><td class="rating-a">A+</td><td>800V+5C 全系标配，LFP/三元双路线</td><td>非宁德时代供应</td></tr>
<tr><td><strong>小鹏X9 增程</strong></td><td class="rating-a">A</td><td>行业首款 LFP 5C 超充增程电池</td><td>容量仅 63.3kWh</td></tr>
<tr><td><strong>岚图梦想家 PHEV</strong></td><td class="rating-a">A</td><td>混动 MPV 最大电池 62.5kWh + 5C</td><td>EV 版无超充</td></tr>
<tr><td><strong>合创V09 762版</strong></td><td class="rating-b">B+</td><td>4C XFC 极速充电先驱</td><td>小众供应商，品牌力弱</td></tr>
<tr><td><strong>别克GL8 PHEV</strong></td><td class="rating-b">B</td><td>5C 超充 + 合资品牌品质</td><td>电池容量小（34.8kWh）</td></tr>
<tr><td><strong>星海V9</strong></td><td class="rating-c">C+</td><td>价格低，双电池路线可选</td><td>无超充，容量小，供应商未公开</td></tr>
</tbody>
</table>
</div>
`,
      concepts: [
        { name: "刀片电池", role: "比亚迪独供", summary: "优势：针刺不起火（安全天花板）、成本低600-800元/kWh、循环寿命3000+次、闪充极寒仅多3min。劣势：能量密度比三元锂低约30%（需要更大体积装同样电量），低温-20°C续航打7折。结论：安全+成本王者，搭配闪充后补能短板已补齐。" },
        { name: "麒麟电池", role: "宁德时代旗舰", summary: "优势：6C版10min补510km（行业最快）、5C版12min续航500km、能量密度255Wh/kg（包体170Wh/kg）、10万公里SOH 97%+。劣势：成本高（三元锂1000+元/kWh）、仅供极氪/理想/极少数品牌、低温-20°C续航打75折。结论：充电速度+能量密度双冠，但贵。" },
        { name: "磷酸铁锂", role: "化学体系·安全派", summary: "优势：热稳定性最好（500°C+不分解）、成本600-800元/kWh（比三元锂便宜30-40%）、寿命3000+次循环。劣势：能量密度仅135-180Wh/kg（体积大15-20%）、-20°C续航衰减30-40%。用在：腾势D9刀片、小鹏X9标准/增程、合创620、星海V9。" },
        { name: "三元锂电池", role: "化学体系·性能派", summary: "优势：能量密度200-260Wh/kg（同体积多装30%电量）、低温-20°C仅衰减15-25%、支持更高充电倍率。劣势：成本800-1200元/kWh、热失控风险更高（需复杂热管理）、循环寿命1500-2000次。用在：极氪009、理想MEGA、岚图、合创超充版、GL8。" },
        { name: "800V高压平台", role: "超充必备硬件", summary: "有800V/900V的车型：极氪009(900V/705kW)、理想MEGA(800V/520kW)、小鹏X9(800V)、岚图PHEV(800V/320kW)、合创V09(800V/410kW)。没有的：腾势D9(闪充另一套)、别克GL8(186kW)、星海V9(常规)。实际意义：有800V才能跑满超充桩功率，否则花钱装了超充桩也喂不饱。" },
        { name: "C倍率", role: "充电速度指标", summary: "MPV实测排行：极氪009=6C(10min补510km) > 理想MEGA=5C(8min补500km) > 腾势D9=闪充(5min补70%) > 小鹏X9=5C(12min补313km) > 合创V09=4C(10min补400km) > 岚图PHEV=5C(12min但峰值仅320kW) > 其余=常规(30min+)。选购关键：看峰值功率×持续时间，不只看C倍率标称。" },
        { name: "CTP技术", role: "封装降本关键", summary: "效果：体积利用率从40-55%提升到60-72%，同样底盘塞进更多电量（D9凭此装下115kWh、极氪009也是115kWh）。对买车人的意义：CTP让MPV这种大车终于能装够电（100kWh+），否则续航只有500km出头。比亚迪刀片=CTP 2.0，宁德麒麟=CTP 3.0（多了双面水冷）。" },
        { name: "热管理系统", role: "超充安全基石", summary: "为什么重要：5C充电=12分钟灌满100度电，发热量巨大，散热不好→析锂→电池爆炸/加速老化。各家方案对比：宁德麒麟=双大面水冷(换热面积4倍)、比亚迪=液冷直贴+内阻降50%、理想=双呼吸散热(5C充电不伤电池)、巨湾XFC=40万公里极速快充无衰减。热管理差→冬天充电极慢、夏天限功率。" }
      ],
      contributions: [
        { target: "range-charging", text: "电池化学体系（磷酸铁锂 vs 三元锂）和容量规格直接决定续航里程和充电速率上限。" },
        { target: "crash-safety", text: "电池热失控防护能力（针刺测试/热管理系统）是新能源车被动安全的核心指标。" },
        { target: "recommendation", text: "续航补能维度权重 20%——电池技术是综合评分的关键输入。" }
      ]
    },

    chassis: {
      title: "底盘与悬架深度调研",
      subtitle: "逐车型拆解悬架结构、转弯半径、空气悬架、后轮转向、滤震表现，找出谁真正好开好坐。",
      type: "article",
      concepts: [
        { name: "双叉臂悬架", role: "前悬架天花板", summary: "同级中极氪009/理想MEGA/岚图梦想家/小鹏X9用双叉臂（或变体），腾势D9/别克GL8/合创V09/传祺E9/星海V9用麦弗逊。双叉臂操控极限高、侧倾小，但占空间成本高。麦弗逊省空间省成本但弯道支撑差。" },
        { name: "后轮转向", role: "掉头神器", summary: "仅小鹏X9(±5°/10.8m转弯直径) 和 2026款岚图梦想家(±5°/5.9m转弯半径/蟹行模式) 标配。极氪009焕新版/理想MEGA/腾势D9/别克GL8均无。5m大车有无后转向=地库噩梦vs轿车灵活。" },
        { name: "空气悬架", role: "舒适性核心", summary: "分三档：双腔空悬(极氪009/小鹏X9/理想MEGA/岚图梦想家)、单腔或CDC无空悬(腾势D9云辇-C/传祺E9/翼真L380)、纯被动(别克GL8/星海V9)。差距：空悬可调高低+软硬，无空悬只能调软硬。" },
        { name: "CDC减震器", role: "电控阻尼", summary: "CDC = 连续可变阻尼减震器。每秒数百次调整软硬，是滤震精度的关键。云辇-C本质就是高级CDC，但没有空气弹簧所以无法调高度。" },
        { name: "防晕车技术", role: "MPV核心体验", summary: "排行：极氪009(智能恒稳)=小鹏X9(6D防晕车) > 腾势D9(云辇预瞄)=岚图(魔毯预瞄) > 理想MEGA(魔毯3.0) > 其余(无主动防晕)。核心差异：是否有路面预瞄+主动姿态控制。" }
      ],
      contributions: [
        { target: "motion-sick", text: "悬架类型（空悬/CDC）和路面预瞄系统直接决定防晕车能力——底盘是防晕的硬件基础。" },
        { target: "seating", text: "空气悬架的迎宾降低功能影响上车便利性，底盘高度调节与座椅舒适度协同。" },
        { target: "recommendation", text: "底盘质感维度权重 15%——空悬+预瞄+后转向是核心加分项。" }
      ],
      body: `
<h2>底盘与悬架：掉头、滤震、好不好开的终极对比</h2>
<p>MPV 超过 5 米的车身，底盘决定了<strong>两件最重要的事</strong>：① 日常好不好开（掉头/停车/过弯）；② 家人坐着舒不舒服（滤震/晕不晕车）。核心技术包括双叉臂悬架、CDC减震器、空气悬架，以及防晕车技术。下面逐项拆解。</p>

<h3>一、悬架结构对比表</h3>
<table>
  <thead><tr><th>车型</th><th>前悬架</th><th>后悬架</th><th>空气悬架</th><th>后轮转向</th><th>电控减震</th></tr></thead>
  <tbody>
    <tr><td><strong>极氪009</strong></td><td>双叉臂</td><td>多连杆</td><td>✅ 闭式双腔</td><td>❌</td><td>双阀CCD电磁减振</td></tr>
    <tr><td><strong>小鹏X9</strong></td><td>双叉臂</td><td>H臂多连杆</td><td>✅ 双腔(90mm调节)</td><td>✅ ±5°(全系标配)</td><td>CDC可变阻尼</td></tr>
    <tr><td><strong>理想MEGA</strong></td><td>双叉臂</td><td>H臂多连杆</td><td>✅ 双腔</td><td>❌</td><td>CDC可变阻尼</td></tr>
    <tr><td><strong>岚图梦想家</strong></td><td>双叉臂</td><td>五连杆</td><td>✅ 魔毯空悬(60mm)</td><td>✅ ±5°(2026新款)</td><td>CDC主动减震</td></tr>
    <tr><td><strong>腾势D9</strong></td><td>麦弗逊</td><td>多连杆</td><td>❌ (无空悬)</td><td>❌</td><td>云辇-C智能阻尼</td></tr>
    <tr><td><strong>翼真L380</strong></td><td>双球节麦弗逊</td><td>多连杆</td><td>✅ 空悬+CDC(非入门)</td><td>❌</td><td>CDC连续可调</td></tr>
    <tr><td><strong>合创V09</strong></td><td>麦弗逊</td><td>多连杆</td><td>❌</td><td>❌</td><td>❌ 被动减震</td></tr>
    <tr><td><strong>传祺E9</strong></td><td>麦弗逊</td><td>多连杆</td><td>❌</td><td>❌</td><td>电磁阻尼(高配)</td></tr>
    <tr><td><strong>别克GL8</strong></td><td>麦弗逊</td><td>多连杆</td><td>❌</td><td>❌</td><td>❌ 被动减震</td></tr>
    <tr><td><strong>星海V9</strong></td><td>麦弗逊</td><td>多连杆</td><td>❌</td><td>❌</td><td>❌ 被动减震</td></tr>
  </tbody>
</table>

<h3>二、掉头灵活性（转弯半径排行）</h3>
<p>开 MPV 最头疼的就是掉头和地下车库。转弯半径直接决定日常便利性：</p>
<table>
  <thead><tr><th>排名</th><th>车型</th><th>转弯半径</th><th>车长</th><th>后轮转向</th><th>评价</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td>🥇</td><td><strong>小鹏X9</strong></td><td>5.4 m</td><td>5293mm</td><td>✅ ±5°</td><td>5.3m大车=轿车灵活，全球唯一全系标配</td></tr>
    <tr class="rating-s"><td>🥈</td><td><strong>岚图梦想家(2026)</strong></td><td>5.9 m</td><td>5315mm</td><td>✅ ±5°+蟹行</td><td>新增后转向大幅改善，蟹行模式独家</td></tr>
    <tr class="rating-a"><td>🥉</td><td><strong>腾势D9</strong></td><td>5.95 m</td><td>5250mm</td><td>❌</td><td>车身较短弥补无后转向，可接受</td></tr>
    <tr class="rating-a"><td>4</td><td><strong>翼真L380</strong></td><td>6.15 m</td><td>5316mm</td><td>❌</td><td>虚拟主销设计优化转向，中规中矩</td></tr>
    <tr class="rating-b"><td>5</td><td><strong>极氪009</strong></td><td>~6.1 m</td><td>5217mm</td><td>❌</td><td>2024mm车宽是真正痛点，老小区停车噩梦</td></tr>
    <tr class="rating-b"><td>6</td><td><strong>理想MEGA</strong></td><td>6.35 m</td><td>5350mm</td><td>❌</td><td>5.35m最长车身+无后转向，市区调头痛苦</td></tr>
    <tr class="rating-c"><td>7</td><td><strong>合创V09</strong></td><td>6.15 m</td><td>5230mm</td><td>❌</td><td>中规中矩</td></tr>
    <tr class="rating-c"><td>8</td><td><strong>别克GL8</strong></td><td>~6.2 m</td><td>5219mm</td><td>❌</td><td>老底盘虚位大，转向手感最差</td></tr>
    <tr class="rating-c"><td>9</td><td><strong>传祺E9</strong></td><td>~6.0 m</td><td>5212mm</td><td>❌</td><td>中规中矩</td></tr>
    <tr class="rating-c"><td>10</td><td><strong>星海V9</strong></td><td>6.15 m</td><td>5180mm</td><td>❌</td><td>车身最短但转弯不占优</td></tr>
  </tbody>
</table>
<div class="callout"><strong>选购结论：</strong>如果你的停车环境是老旧小区/窄道地库，小鹏X9 的 5.4m 转弯半径是碾压级优势。2026 款岚图梦想家新增后轮转向也大幅改善。理想MEGA 在这项上吃亏最大（5.35m 车身 + 无后转向 = 6.35m 转弯半径，车主反馈"市区真的痛苦"）。</div>

<h3>三、滤震与乘坐舒适性</h3>
<p>好的滤震 = 过减速带不弹人 + 过坑洼不传震 + 高速变道不晃。按实测和车主反馈排名：</p>

<h4>S 级：底盘调校标杆</h4>
<ul>
  <li><strong>极氪009</strong>：闭式双腔空悬+双阀CCD电磁减振+定海智能中枢。过坑无感，碾井盖无声，十万公里长测底盘无异响。150km/h通过11级风区仍稳定。车主："空气悬架过坑无感，孩子坐后面全程安睡"。<em>缺点：2024mm车宽，过窄道/老小区需屏息。</em></li>
  <li><strong>岚图梦想家</strong>：前双叉臂+后五连杆+魔毯空悬+CDC，全铝合金底盘。摄像头预瞄150m外路面，提前调阻尼。过弯侧倾小，麋鹿测试78km/h稳定通过。底盘质感：厚重中带精准。<em>缺点：品牌知名度不够，部分细节做工仍有优化空间。</em></li>
</ul>

<h4>A 级：优秀但各有取舍</h4>
<ul>
  <li><strong>小鹏X9</strong>：双叉臂+双腔空悬90mm调节+6D防晕车算法（每秒1000次路况扫描）。AI底盘提前300ms预判路面特征/0.5s提前预判颠簸路段。车主："双腔空悬过减速带几乎没震动"。<em>缺点：底盘厚重感不如极氪009，高速胎噪风噪偏大。</em></li>
  <li><strong>理想MEGA</strong>：双叉臂+双腔空悬+CDC（魔毯3.0）。大起伏路段"漂浮感"明显但偶有船感。NVH极佳（全球最低风阻0.215Cd）。<em>缺点：对路面细小振动过滤不够彻底；无后轮转向，弯道侧倾提醒感强。</em></li>
  <li><strong>腾势D9</strong>：云辇-C智能阻尼（50+传感器/每秒千次扫描/预瞄2.0提前150m感知）。侧倾角速度降低39.7%，隔振率96%。过坑洼"巧卸"不"硬抗"。车主："过坑压井盖很干脆，高速起伏路面底盘很整"。<em>缺点：麦弗逊前悬+无空悬，无法调高度，极端深坑易托底。制动点头明显。</em></li>
</ul>

<h4>B 级：够用但有明显短板</h4>
<ul>
  <li><strong>翼真L380</strong>：双球节麦弗逊+空悬+CDC。底盘舒适性出色，能有效过滤路面颠簸。高速弯道支撑扎实。但座舱响应稍缓，前悬架终究是麦弗逊变体，极限操控弱于双叉臂。</li>
  <li><strong>传祺E9</strong>：麦弗逊+多连杆，高配有电磁阻尼。家用够用，但无空悬无后转向，底盘体验明显逊色于第一梯队。</li>
  <li><strong>合创V09</strong>：麦弗逊+多连杆，全被动减震。底盘平淡，高速变道晃动明显。</li>
</ul>

<h4>C 级：老底盘/基础配置</h4>
<ul>
  <li><strong>别克GL8</strong>：2018年底盘+麦弗逊+E型多连杆，全被动减震。小颠簸过滤靠阻尼座椅，连续起伏余振多/三排颠簸明显/转向虚位大/高速侧倾明显。车长5.2m但转弯半径大，窄路需多打两把方向。底盘全冲压钢板无铝合金。"七年前的老底盘"。</li>
  <li><strong>星海V9</strong>：麦弗逊+多连杆，全被动。14.99万价位无法要求太多，家用代步够用但长途舒适性差距大。</li>
</ul>

<h3>四、底盘综合评分</h3>
<table>
  <thead><tr><th>车型</th><th>悬架结构</th><th>掉头灵活</th><th>滤震舒适</th><th>高速稳定</th><th>综合</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>S</td></tr>
    <tr class="rating-s"><td><strong>岚图梦想家(2026)</strong></td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>S</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9</strong></td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>A+</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>A</td></tr>
    <tr class="rating-a"><td><strong>腾势D9</strong></td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>A</td></tr>
    <tr class="rating-a"><td><strong>翼真L380</strong></td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>A-</td></tr>
    <tr class="rating-b"><td><strong>传祺E9</strong></td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>B</td></tr>
    <tr class="rating-b"><td><strong>合创V09</strong></td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>B</td></tr>
    <tr class="rating-c"><td><strong>别克GL8</strong></td><td>⭐⭐</td><td>⭐⭐</td><td>⭐⭐</td><td>⭐⭐</td><td>C</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐</td><td>⭐⭐</td><td>C</td></tr>
  </tbody>
</table>

<h3>五、选购建议</h3>
<ul>
  <li><strong>极致滤震（老人/孩子/晕车）</strong>→ 极氪009（闭式双腔空悬+定海中枢，同级最稳）或 岚图梦想家（魔毯预瞄+全铝底盘）</li>
  <li><strong>掉头灵活（老旧小区/窄道地库）</strong>→ 小鹏X9（5.4m转弯，碾压）或 2026款岚图梦想家（5.9m+蟹行）</li>
  <li><strong>均衡之选（什么都不差）</strong>→ 腾势D9（云辇-C够用，转弯5.95m可接受）或 翼真L380（空悬+CDC，中等转弯）</li>
  <li><strong>预算优先</strong>→ 传祺E9（高配有电磁阻尼）、星海V9（14.99万最低门槛）</li>
  <li><strong>不推荐</strong>→ 别克GL8（2018年老底盘，与新势力差距代际级）、合创V09（全被动减震，底盘拖后腿）</li>
</ul>
`
    },

    "charging-service": {
      title: "充电服务与补能网络",
      subtitle: "各品牌自建超充站数量、充电桩功率、覆盖范围、充电费用对比。",
      type: "article",
      concepts: [
        { name: "超充站网络", role: "补能基础", summary: "比亚迪5500+站(2026年底目标2万站) > 理想4000+站(70%为5C桩) > 小鹏3600+站 > 吉利/极氪2100+站 >> 岚图121站。别克/传祺/星海无自建超充。" }
      ],
      body: `
<h2>充电服务：谁的充电最省心？</h2>
<p>电车最大的使用焦虑就是充电。超充站网络的规模和功率直接决定了长途出行便利性。</p>

<h3>自建超充站数量排行（截至2026年4月）</h3>
<table>
  <thead><tr><th>品牌</th><th>超充站数量</th><th>充电桩数量</th><th>最高单桩功率</th><th>覆盖范围</th><th>趋势</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>比亚迪(腾势)</strong></td><td>5500+座</td><td>5500+根闪充桩</td><td>1500kW兆瓦级</td><td>311+城市</td><td>2026年底目标2万座</td></tr>
    <tr class="rating-s"><td><strong>理想</strong></td><td>4088座</td><td>22563根</td><td>5C超充</td><td>280+城市</td><td>70%为5C/4C桩</td></tr>
    <tr class="rating-a"><td><strong>小鹏</strong></td><td>3600+座</td><td>19600+根</td><td>5C超充</td><td>430+城市</td><td>2026目标1万座</td></tr>
    <tr class="rating-a"><td><strong>吉利/极氪</strong></td><td>2103座(集团)</td><td>10212根</td><td>1300kW V4极充</td><td>全国主要城市</td><td>极氪自建9160+根超快充</td></tr>
    <tr class="rating-c"><td><strong>岚图</strong></td><td>121座</td><td>VP480超充桩</td><td>480kW</td><td>30座核心城市</td><td>精准布局高端市场</td></tr>
    <tr class="rating-c"><td><strong>别克/传祺/星海</strong></td><td>无自建</td><td>—</td><td>—</td><td>依赖第三方</td><td>无自建计划</td></tr>
  </tbody>
</table>

<h3>充电体验排名</h3>
<ul>
  <li><strong>S 级（自建网络+极速充电）</strong>
    <ul>
      <li><strong>比亚迪/腾势D9</strong>：5500+闪充站 + 1500kW兆瓦闪充 + 2026年底2万座目标。依托比亚迪体量，充电最不焦虑。闪充技术10%→97%仅9分钟</li>
      <li><strong>理想MEGA</strong>：4088座超充 + 70%为5C桩 + 覆盖280+城市。补能体验"无限接近燃油车"</li>
    </ul>
  </li>
  <li><strong>A 级（自建网络可用）</strong>
    <ul>
      <li><strong>小鹏X9</strong>：3600+自营站 + 430+城市覆盖 + 大湾区超充县县通。数量够用</li>
      <li><strong>极氪009</strong>：极氪自建9160+超快充桩 + 1300kW V4极充（行业最高功率）。但站点密度不如比亚迪/理想</li>
    </ul>
  </li>
  <li><strong>C 级（依赖第三方）</strong>
    <ul>
      <li><strong>岚图梦想家</strong>：仅121座自建站，主要依赖第三方充电网络。好在支持800V/5C，第三方快充桩也能用</li>
      <li><strong>别克GL8/传祺E9/星海V9/合创V09</strong>：完全依赖第三方公共充电桩。充电体验取决于当地公共设施</li>
    </ul>
  </li>
</ul>

<div class="callout"><strong>选购建议：</strong>如果经常跑长途，比亚迪(腾势D9)和理想(MEGA)的自建网络最靠谱。如果主要市区通勤+家充，充电网络差异不大。岚图虽然自建站少，但支持800V快充可以用第三方高功率桩。</div>
`
    },

    "repair-network": {
      title: "维修点覆盖",
      subtitle: "各品牌全国售后服务网点数量、覆盖城市、下沉市场能力对比。",
      type: "article",
      concepts: [
        { name: "售后网络", role: "维修保障", summary: "比亚迪2300+售后网点(覆盖最广/下沉到县级) >> 极氪640+全球门店 > 理想543家 > 小鹏372家 > 岚图200+家 >> 合创(收缩中)。传统品牌别克网点最密，广汽(传祺)2000+家。" }
      ],
      body: `
<h2>维修网点：坏了去哪修？</h2>
<p>再好的车也需要保养和维修。售后网络的覆盖密度直接决定了维修便利性和费用。</p>

<h3>售后服务网点数量对比</h3>
<table>
  <thead><tr><th>品牌</th><th>售后网点数</th><th>覆盖城市</th><th>网点类型</th><th>下沉能力</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>比亚迪(腾势D9)</strong></td><td>2300+家</td><td>全国广泛</td><td>王朝网+海洋网</td><td>⭐⭐⭐⭐⭐ 县级覆盖</td></tr>
    <tr class="rating-a"><td><strong>别克(GL8)</strong></td><td>传统4S体系</td><td>全国广泛</td><td>4S店+授权</td><td>⭐⭐⭐⭐⭐ 县级覆盖</td></tr>
    <tr class="rating-a"><td><strong>广汽(传祺E9)</strong></td><td>2000+家</td><td>全国广泛</td><td>4S店+授权</td><td>⭐⭐⭐⭐ 地级市+</td></tr>
    <tr class="rating-b"><td><strong>理想(MEGA)</strong></td><td>543家</td><td>222城市</td><td>直营+授权</td><td>⭐⭐⭐ 一二线为主</td></tr>
    <tr class="rating-b"><td><strong>极氪(009)</strong></td><td>640+家(全球)</td><td>95%地级市</td><td>直营+移动服务</td><td>⭐⭐⭐ 一二线+部分三线</td></tr>
    <tr class="rating-b"><td><strong>小鹏(X9)</strong></td><td>372家</td><td>250+城市</td><td>直营+授权</td><td>⭐⭐⭐ 一二线为主</td></tr>
    <tr class="rating-c"><td><strong>岚图(梦想家)</strong></td><td>200+家(含500授权)</td><td>一二线为主</td><td>直营+授权</td><td>⭐⭐ 偏远地区不足</td></tr>
    <tr class="rating-c"><td><strong>合创(V09)</strong></td><td>收缩中</td><td>一线为主</td><td>合创+广汽</td><td>⭐ 网点稀少</td></tr>
  </tbody>
</table>

<h3>维修便利性排名</h3>
<ul>
  <li><strong>比亚迪/腾势</strong>：2300+网点覆盖到县级，配件供应最充足价格最亲民。30公里外空白网点还提供定点服务。售后最不用操心</li>
  <li><strong>别克/广汽</strong>：传统车企4S体系成熟，覆盖广但新能源专修能力参差不齐</li>
  <li><strong>极氪</strong>：640+全球门店(含售后)+移动服务车（可完成85%常规保养），98.7%一次性修复率。30分钟救援覆盖95%地级市</li>
  <li><strong>理想</strong>：543家但5个月净减少18家（2026年规模在收缩），三四线城市用户可能需跨城维修</li>
  <li><strong>小鹏</strong>：372家服务网点，1对1鹏管家+免费上门取送车（1年内不限次数）</li>
  <li><strong>岚图</strong>：200+直营+500授权，偏远地区覆盖不足。车主反馈"周边网点距离较远"</li>
</ul>

<div class="callout"><strong>选购建议：</strong>如果你在三四线城市或偏远地区，比亚迪(腾势D9)和传统品牌(别克/传祺)的售后最靠谱。新势力品牌（理想/极氪/小鹏/岚图）在一二线城市体验好，但下沉市场有短板。</div>
`
    },

    "maintenance-cost": {
      title: "保养与维修报价",
      subtitle: "各车型年保养费用、常见保养项目、轮胎/易损件更换成本对比。",
      type: "article",
      concepts: [
        { name: "用车成本", role: "长期花费", summary: "纯电MPV月均养车700-1300元 vs 燃油MPV月均2500-3300元。纯电省在：无机油机滤(保养趋近0元)+电费仅油费1/6。贵在：保险(8000-12000/年)+轮胎(1500元/条)。" }
      ],
      body: `
<h2>保养与维修：养一台MPV到底花多少钱？</h2>
<p>买车一时爽，养车看钱包。纯电/插混MPV比燃油省很多，但也有自己的坑。</p>

<h3>年用车成本对比（按3年/6万公里）</h3>
<table>
  <thead><tr><th>车型</th><th>年保养费</th><th>年保险费</th><th>年能源费</th><th>月均总花费</th><th>对比燃油</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>小鹏X9(纯电)</strong></td><td>≈0元</td><td>~8100元</td><td>~2200元(家充)</td><td>~761元</td><td>省60%+</td></tr>
    <tr class="rating-s"><td><strong>岚图梦想家(纯电)</strong></td><td>~500元</td><td>~7500元</td><td>~2200元</td><td>~770元</td><td>省60%+</td></tr>
    <tr class="rating-a"><td><strong>腾势D9(纯电)</strong></td><td>~930元</td><td>~8000元</td><td>~2200元</td><td>~853元</td><td>省55%+</td></tr>
    <tr class="rating-a"><td><strong>腾势D9(插混)</strong></td><td>~1500元</td><td>~8000元</td><td>~3000元(电+油)</td><td>~1040元</td><td>省50%+</td></tr>
    <tr class="rating-a"><td><strong>极氪009(纯电)</strong></td><td>~900元</td><td>~10500元</td><td>~2800元</td><td>~1300元</td><td>省60%+</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA(纯电)</strong></td><td>~1000元</td><td>~12000元</td><td>~2000元</td><td>~1250元</td><td>省55%</td></tr>
    <tr class="rating-c"><td><strong>别克GL8(插混)</strong></td><td>~3000元</td><td>~8000元</td><td>~8000元(油为主)</td><td>~2500元</td><td>基准</td></tr>
  </tbody>
</table>

<h3>为什么纯电保养这么便宜？</h3>
<ul>
  <li><strong>无机油/机滤/火花塞</strong>：燃油车每7500km换一次机油(500-1500元)，纯电完全不需要</li>
  <li><strong>刹车片磨损极少</strong>：动能回收承担80%制动，刹车片寿命是燃油车3-5倍</li>
  <li><strong>保养项目极少</strong>：主要就是检查三电+换空调滤芯+换制动液(每4万km)。别的几乎没有</li>
</ul>

<h3>隐藏成本注意</h3>
<ul>
  <li><strong>保险费偏高</strong>：新能源MPV零整比高，首年保费通常7000-12000元。极氪009和理想MEGA因车价高，保费最贵</li>
  <li><strong>轮胎成本</strong>：MPV轮胎大，每条1200-2000元，4条更换一次约5000-8000元。极氪009(255/265)和理想MEGA最贵</li>
  <li><strong>过保后电池</strong>：过质保期后电池更换费用10-15万元（但正常使用8-10年内不太会遇到）</li>
  <li><strong>商充 vs 家充差3倍</strong>：家充约0.5-0.6元/度，商业快充1.2-2.0元/度。没有家充条件的用户，用车成本会翻倍</li>
</ul>
`
    },

    "warranty": {
      title: "质保年限",
      subtitle: "各车型整车质保、三电质保、特殊质保政策对比。",
      type: "article",
      concepts: [
        { name: "质保政策", role: "购车保障", summary: "岚图=终身质保+终身免费保养(诚意最高) > 比亚迪/腾势=三电终身(首任)+6年15万km整车 > 极氪=三电终身(首任)+4年12万km > 小鹏=三电终身(首任)+5年12万km > 理想=三电终身(首任)+5年10万km >> 别克=传统质保。" }
      ],
      body: `
<h2>质保年限：谁的保障最放心？</h2>
<p>30-50万的MPV，质保政策直接影响长期持有成本和安心感。</p>

<h3>质保政策对比</h3>
<table>
  <thead><tr><th>车型</th><th>整车质保</th><th>三电质保</th><th>特殊政策</th><th>诚意评级</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>岚图梦想家</strong></td><td>5年/15万km</td><td>首任终身</td><td>终身免费保养(首任)</td><td>S — 诚意最高</td></tr>
    <tr class="rating-a"><td><strong>腾势D9</strong></td><td>6年/15万km</td><td>首任终身</td><td>比亚迪3000+售后网点</td><td>A+ — 整车质保最长</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9</strong></td><td>5年/12万km</td><td>首任终身(非营运)</td><td>1对1鹏管家/免费取送车</td><td>A</td></tr>
    <tr class="rating-a"><td><strong>极氪009</strong></td><td>6年/15万km</td><td>首任终身</td><td>需自费(无终身免费保养)</td><td>A</td></tr>
    <tr class="rating-b"><td><strong>理想MEGA</strong></td><td>5年/10万km</td><td>首任终身</td><td>每月20GB免费流量</td><td>B+ — 整车质保里程最短</td></tr>
    <tr class="rating-b"><td><strong>翼真L380</strong></td><td>5年/12万km</td><td>首任终身</td><td>吉利体系售后</td><td>B+</td></tr>
    <tr class="rating-c"><td><strong>别克GL8</strong></td><td>3年/10万km</td><td>8年/16万km</td><td>传统4S体系</td><td>C — 无终身质保</td></tr>
    <tr class="rating-c"><td><strong>传祺E9</strong></td><td>5年/15万km</td><td>首任终身</td><td>广汽体系</td><td>B</td></tr>
  </tbody>
</table>

<h3>质保细则注意事项</h3>
<ul>
  <li><strong>「首任车主」限制</strong>：几乎所有品牌的三电终身质保仅限首任非营运车主。二手交易后质保缩减为8年/16万km，直接影响二手残值</li>
  <li><strong>年里程上限</strong>：部分品牌要求每年行驶不超过3万km，超出部分不享受终身质保</li>
  <li><strong>按规定保养</strong>：未在官方授权店按时保养可能导致质保失效</li>
  <li><strong>岚图终身免费保养是最大亮点</strong>：其他品牌的终身质保仅管维修不管保养，岚图连保养都免了（首任车主）</li>
</ul>

<div class="callout"><strong>选购建议：</strong>质保最放心的是岚图梦想家（终身质保+终身免费保养）和腾势D9（6年15万km整车+三电终身）。理想MEGA整车质保仅5年/10万km，对于52.98万的车偏短。别克GL8无终身质保，与新能源品牌差距明显。</div>
`
    },

    adas: {
      title: "智能驾驶深度调研",
      subtitle: "逐车型拆解智驾芯片、感知硬件、城市/高速领航、泊车能力，找出谁真正能解放双手。",
      type: "article",
      concepts: [
        { name: "端到端大模型", role: "智驾核心架构", summary: "小鹏(第二代VLA/2天迭代一次/全国无图) > 理想(端到端+VLM/Thor-U) > 华为ADS4(岚图/GOD大模型) > 腾势(天神之眼/跟随策略) > 极氪(千里浩瀚H7/刚上线)。端到端=一个神经网络搞定感知→决策→执行，取代人工规则。" },
        { name: "智驾芯片", role: "算力基础", summary: "图灵芯片2250TOPS(小鹏)遥遥领先 > Thor-U 700-750TOPS(极氪009/理想MEGA/腾势D9高配) > 双Orin-X 508TOPS(老款) > J6M(腾势D9低配) > 别克/星海(无高阶芯片)。" },
        { name: "城市NOA", role: "高阶智驾标志", summary: "小鹏XNGP=全国无图全量/端到端最成熟 > 理想=全域NOA/Thor-U > 岚图=华为ADS4/城市NOA > 腾势=天神之眼/城市领航OTA中 > 极氪=千里浩瀚H7/刚交付 >> 别克/星海/合创=无城市NOA。" },
        { name: "智能泊车", role: "日常高频场景", summary: "小鹏(免遥控离车泊入/跨楼层记忆/断头位) > 极氪(车位到车位领航) ≈ 理想(全场景泊车) ≈ 岚图(华为泊车) > 腾势(智能泊车) >> 别克/星海(基础倒车辅助)。" },
        { name: "主动安全AEB", role: "安全底线", summary: "第二代腾势D9(2026) AEB 120km/h刹停 > 极氪009 AEB+爆胎0.2s稳车+防横风 > 岚图梦想家(华为ADS3.0/AEB+AES 120km/h) > 小鹏AEB > 理想AEB。别克/星海仅基础AEB。注意：一代D9 AEB实测仅80km/h级别可靠。" }
      ],
      contributions: [
        { target: "crash-safety", text: "AEB/AES 主动安全系统是碰撞安全的第一道防线——智驾硬件直接决定主动安全能力。" },
        { target: "recommendation", text: "智能驾驶维度权重 20%——端到端、城市NOA、智能泊车是核心评分项。" }
      ],
      body: `
<h2>智能驾驶：谁真正能解放双手？</h2>
<p>MPV 买来就是为了舒服，如果司机能被解放一半注意力，全家出行体验直接翻倍。2025-2026年智驾已经从「有没有」变成「好不好用」的比拼——主动安全AEB更是安全底线。</p>

<h3>一、智驾硬件配置对比</h3>
<table>
  <thead><tr><th>车型</th><th>智驾芯片</th><th>算力</th><th>激光雷达</th><th>感知传感器总数</th><th>智驾系统</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>小鹏X9</strong></td><td>自研图灵AI</td><td>2250 TOPS</td><td>——（纯视觉）</td><td>31颗</td><td>XNGP / 第二代VLA</td></tr>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>Thor-U</td><td>700 TOPS</td><td>✅ 1颗</td><td>31颗</td><td>千里浩瀚H7 G-ASD</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>Thor-U</td><td>~750 TOPS</td><td>✅ 1颗(128线)</td><td>31颗+</td><td>AD Max 全域NOA</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>Orin-X(乾崑)</td><td>254 TOPS</td><td>✅ 192线(乾崑版)</td><td>34颗</td><td>华为ADS 4</td></tr>
    <tr class="rating-a"><td><strong>腾势D9</strong></td><td>Orin-X / J6M</td><td>254 / ~128 TOPS</td><td>✅ 128线(高配)</td><td>32颗</td><td>天神之眼 DiPilot</td></tr>
    <tr class="rating-b"><td><strong>翼真L380</strong></td><td>Orin-X</td><td>254 TOPS</td><td>✅ 1颗</td><td>30颗+</td><td>吉利银河智驾</td></tr>
    <tr class="rating-b"><td><strong>合创V09</strong></td><td>Orin-X</td><td>254 TOPS</td><td>✅ 1颗</td><td>30颗+</td><td>合创智驾</td></tr>
    <tr class="rating-c"><td><strong>传祺E9</strong></td><td>基础芯片</td><td><100 TOPS</td><td>❌</td><td>~20颗</td><td>基础L2</td></tr>
    <tr class="rating-c"><td><strong>别克GL8</strong></td><td>基础芯片</td><td><100 TOPS</td><td>❌</td><td>~23颗</td><td>基础L2</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>基础芯片</td><td><50 TOPS</td><td>❌</td><td>~15颗</td><td>基础L2</td></tr>
  </tbody>
</table>

<h3>二、智驾功能对比</h3>
<table>
  <thead><tr><th>功能</th><th>小鹏X9</th><th>极氪009</th><th>理想MEGA</th><th>岚图(乾崑)</th><th>腾势D9</th><th>翼真L380</th><th>别克GL8</th><th>星海V9</th></tr></thead>
  <tbody>
    <tr><td><strong>城市领航NOA</strong></td><td>✅ 全国无图</td><td>✅ 逐步开城</td><td>✅ 全域</td><td>✅ 华为ADS4</td><td>✅ OTA中</td><td>⚠️ OTA中</td><td>❌</td><td>❌</td></tr>
    <tr><td><strong>高速领航</strong></td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
    <tr><td><strong>AI泊车/代客泊车</strong></td><td>✅ 离车泊入</td><td>✅ 车位到车位</td><td>✅ 全场景</td><td>✅ 230+车位</td><td>✅ 智能泊车</td><td>✅ 基础</td><td>❌</td><td>❌</td></tr>
    <tr><td><strong>记忆泊车</strong></td><td>✅ 跨楼层</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>⚠️</td><td>❌</td><td>❌</td></tr>
    <tr><td><strong>端到端大模型</strong></td><td>✅ 第二代VLA</td><td>⚠️ 跟进中</td><td>✅ 端到端+VLM</td><td>✅ GOD大模型</td><td>⚠️ 跟进中</td><td>❌</td><td>❌</td><td>❌</td></tr>
    <tr><td><strong>AEB刹停速度</strong></td><td>高速有效</td><td>高速+爆胎控制</td><td>高速有效</td><td>高速有效</td><td>120km/h(二代)</td><td>AEB+AES 120km/h</td><td>基础</td><td>基础</td></tr>
    <tr><td><strong>ETC自动通过</strong></td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
  </tbody>
</table>

<h3>三、智驾体验分级</h3>

<h4>S 级：全场景解放双手</h4>
<ul>
  <li><strong>小鹏X9 — XNGP 全场景智驾王者</strong>
    <br>图灵芯片 2250TOPS + 第二代VLA物理世界大模型 + 全国无图覆盖。城市/高速/泊车三位一体，2天迭代一次。AI泊车免遥控离车泊入，跨楼层记忆泊车。车主评价："XNGP通勤简直解放"，但"高速NGP偶尔偏右超大车时紧张"。
    <br><em>优点：智驾迭代最快、覆盖最广、算力最强、纯视觉成本最低</em>
    <br><em>缺点：偶发接管仍存在（"难题偶尔做对，简单题有时犯错"）、纯视觉夜间/大雨极端场景弱于激光雷达方案</em></li>
</ul>

<h4>A 级：高阶可用但各有短板</h4>
<ul>
  <li><strong>理想MEGA — AD Max 全域NOA</strong>
    <br>Thor-U ~750TOPS + 128线激光雷达 + 端到端+VLM大模型。全域NOA覆盖城市/高速，补能最快所以长途智驾体验最佳。
    <br><em>优点：激光雷达+大算力=主动安全强；全域NOA成熟度高</em>
    <br><em>缺点：52.98万起步太贵；智驾与小鹏各有胜负但价格贵50%</em></li>
  <li><strong>岚图梦想家(乾崑) — 华为ADS 4</strong>
    <br>Orin-X + 192线激光雷达 + GOD大模型。华为智驾生态成熟，城市NOA"效率比D9更快"。车主："一上高速就不想自己开了"。
    <br><em>优点：华为ADS4生态成熟，城市NOA通过复杂路口速度快</em>
    <br><em>缺点：仅乾崑版有高阶智驾（鲲鹏版无激光雷达）；部分承诺功能还没完全落地</em></li>
  <li><strong>极氪009(焕新) — 千里浩瀚H7</strong>
    <br>Thor-U 700TOPS + 激光雷达 + 全系标配。支持车位到车位领航、环岛/ETC通行。但系统刚上线，需要OTA成熟。
    <br><em>优点：硬件配置顶级(700TOPS+激光雷达全系标配)，安全冗余高</em>
    <br><em>缺点：软件刚交付，城市NOA还在逐步开城，实际体验有待验证</em></li>
  <li><strong>腾势D9 — 天神之眼 DiPilot</strong>
    <br>第二代D9(2026)标配天神之眼5.0/3激光雷达/AEB 120km/h+AES+ESA。一代D9天神之眼3.0/AEB实测仅80km/h可靠。
    <br><em>优点：二代D9 AEB+AES主动安全大幅提升(120km/h刹停/140km/h爆胎稳行)；云辇+智驾联动方案独家</em>
    <br><em>缺点：城市NOA成熟度不如小鹏/理想/华为；低配无激光雷达；智驾芯片算力偏低</em></li>
</ul>

<h4>B 级：基础高速可用</h4>
<ul>
  <li><strong>翼真L380</strong>：有激光雷达+Orin-X，高速NOA可用。城市NOA还在OTA中。</li>
  <li><strong>合创V09</strong>：有激光雷达+Orin-X，功能类似但品牌投入不足，OTA更新慢。</li>
</ul>

<h4>C 级：基础L2辅助驾驶</h4>
<ul>
  <li><strong>传祺E9 / 别克GL8 / 星海V9</strong>：仅基础ACC自适应巡航+车道保持。无高速/城市领航，无AI泊车。和2020年的智驾水平差不多。<em>买这三款请做好"全程自己开"的准备。</em></li>
</ul>

<h3>四、智驾综合评分</h3>
<table>
  <thead><tr><th>车型</th><th>硬件算力</th><th>城市NOA</th><th>高速领航</th><th>泊车智能</th><th>主动安全</th><th>综合</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>小鹏X9</strong></td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>S</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>A+</td></tr>
    <tr class="rating-a"><td><strong>岚图(乾崑)</strong></td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>A</td></tr>
    <tr class="rating-a"><td><strong>极氪009</strong></td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>A</td></tr>
    <tr class="rating-a"><td><strong>腾势D9</strong></td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐⭐⭐</td><td>A-</td></tr>
    <tr class="rating-b"><td><strong>翼真L380</strong></td><td>⭐⭐⭐</td><td>⭐⭐</td><td>⭐⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>B+</td></tr>
    <tr class="rating-b"><td><strong>合创V09</strong></td><td>⭐⭐⭐</td><td>⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>⭐⭐⭐</td><td>B</td></tr>
    <tr class="rating-c"><td><strong>传祺E9</strong></td><td>⭐</td><td>—</td><td>—</td><td>⭐</td><td>⭐⭐</td><td>C</td></tr>
    <tr class="rating-c"><td><strong>别克GL8</strong></td><td>⭐</td><td>—</td><td>—</td><td>⭐</td><td>⭐⭐</td><td>C</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>⭐</td><td>—</td><td>—</td><td>⭐</td><td>⭐</td><td>C</td></tr>
  </tbody>
</table>

<h3>五、选购建议</h3>
<ul>
  <li><strong>智驾是第一优先级</strong>→ 小鹏X9（XNGP全场景无图/算力碾压/30.98万起增程版性价比爆棚）</li>
  <li><strong>华为生态+智驾</strong>→ 岚图梦想家乾崑版（ADS4+鸿蒙5+终身质保，32.99万起）</li>
  <li><strong>智驾+极致补能</strong>→ 理想MEGA（全域NOA+5C超充+4088+超充站，但52.98万门槛高）</li>
  <li><strong>安全冗余优先</strong>→ 极氪009（700TOPS+激光雷达全系标配+爆胎控制）或 第二代腾势D9（AEB 120km/h+AES+ESA/3A防护）</li>
  <li><strong>不需要智驾</strong>→ 别买GL8/星海V9的智驾版本，基础版够用（但同级价格你能买到更好智驾的车）</li>
</ul>
`
    },

    seating: {
      title: "座椅与空间深度调研",
      subtitle: "逐车型拆解车身尺寸、二/三排座椅体验、中央过道、后备箱空间，找出谁坐着最舒服、空间利用率最高。",
      type: "article",
      concepts: [
        { name: "零重力座椅", role: "二排核心卖点", summary: "极氪009(NAPPA真皮+旋转+10点按摩) ≈ 腾势D9(Air SPA+16点按摩+14向调节) > 小鹏X9(Nappa+10点按摩+180°躺平) > 理想MEGA(旋转零重力/Home版) > 岚图(零重力+通风加热按摩)。" },
        { name: "三排平权", role: "MPV差异化关键", summary: "理想MEGA(轴距3300mm/三排加热/全平权) > 小鹏X9(三排180°躺平/1.8m无压力/加热) > 岚图(三排大角度靠背/空间优秀) > 极氪009(三排通风+加热/同级唯一全系标配) > 腾势D9(三排可前后移动/放倒不全平)。" },
        { name: "中央过道", role: "上下车便利性", summary: "岚图200mm ≈ 星海V9 200mm > 小鹏X9 180mm(超宽/可选有无过道两版) > 腾势D9标准过道 > 极氪009标准过道。理想MEGA保留过道但二排宽度牺牲。无过道=三排乘客上下车必须翻折二排座椅。" },
        { name: "空间魔术", role: "灵活变形能力", summary: "小鹏X9(三排一键纯平收纳/2554L)最强 > 星海V9(4/6下沉放平/2616L/同级唯一) > 岚图(348→2700L) > 腾势D9(390→2310L) > 理想MEGA(三排立起仍574L/得房率最高) > 极氪009(中等/偏商务固定布局)。" },
        { name: "上车便利性", role: "老人小孩体验", summary: "小鹏X9(门槛39cm最低/空悬降低) > 极氪009(空悬迎宾降低/但车宽2024mm难进窄车位) > 岚图(空悬迎宾) > 腾势D9(1900mm车高头部最优/门槛偏高) > 别克GL8(传统MPV/侧滑门经典)。" }
      ],
      body: `
<h2>座椅与空间：谁真正坐得舒服、装得下？</h2>
<p>MPV 的核心价值就两个字：空间。但「大」不等于「好」——轴距只决定物理极限，零重力座椅、三排平权设计和上车便利性才决定日常体验。</p>

<h3>一、车身尺寸核心参数</h3>
<table>
  <thead><tr><th>车型</th><th>车长(mm)</th><th>轴距(mm)</th><th>车宽(mm)</th><th>车高(mm)</th><th>停车友好度</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>理想MEGA</strong></td><td>5350</td><td>3300</td><td>1965</td><td>1850</td><td>5.35m无后转向=噩梦</td></tr>
    <tr class="rating-s"><td><strong>小鹏X9</strong></td><td>5293/5316</td><td>3160</td><td>1988</td><td>1785</td><td>后轮转向5.4m=轿车级</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>5315</td><td>3200</td><td>1985</td><td>1820</td><td>新款后轮转向5.9m</td></tr>
    <tr class="rating-a"><td><strong>极氪009</strong></td><td>5217</td><td>3205</td><td>2024</td><td>1812</td><td>2024mm超宽=窄车位卡死</td></tr>
    <tr class="rating-a"><td><strong>腾势D9</strong></td><td>5250</td><td>3110</td><td>1960</td><td>1900</td><td>无后轮转向/大车感强</td></tr>
    <tr class="rating-b"><td><strong>别克GL8</strong></td><td>5260</td><td>3088</td><td>1878</td><td>1799</td><td>最窄最好停/但也最紧凑</td></tr>
    <tr class="rating-b"><td><strong>星海V9</strong></td><td>5230</td><td>3018</td><td>1920</td><td>1820</td><td>轴距最短/空间不如大哥们</td></tr>
  </tbody>
</table>

<h3>二、二排座椅体验横评</h3>
<table>
  <thead><tr><th>车型</th><th>二排核心卖点</th><th>按摩</th><th>通风/加热</th><th>电动调节</th><th>豪华感评分</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>双零重力+旋转(行政版)</td><td>10点</td><td>✅/✅</td><td>✅ 全电动</td><td>★★★★★</td></tr>
    <tr class="rating-s"><td><strong>腾势D9</strong></td><td>Air SPA零重力+16点按摩</td><td>16点</td><td>✅/✅</td><td>✅ 14向</td><td>★★★★★</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9</strong></td><td>零重力Nappa+180°躺平</td><td>10点</td><td>✅/✅</td><td>✅</td><td>★★★★</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>旋转零重力(Home版)</td><td>✅</td><td>✅/✅</td><td>✅</td><td>★★★★</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>零重力+通风加热按摩</td><td>✅</td><td>✅/✅</td><td>✅</td><td>★★★★</td></tr>
    <tr class="rating-b"><td><strong>别克GL8</strong></td><td>传统商务二排</td><td>高配有</td><td>部分有</td><td>部分</td><td>★★★</td></tr>
    <tr class="rating-b"><td><strong>星海V9</strong></td><td>加热通风(高配)</td><td>高配有</td><td>高配有</td><td>部分</td><td>★★★</td></tr>
  </tbody>
</table>

<h3>三、三排座椅体验横评</h3>
<table>
  <thead><tr><th>车型</th><th>三排体验</th><th>三排加热</th><th>后备箱(L)</th><th>中央过道</th><th>三排评分</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>理想MEGA</strong></td><td>电动靠背+加热+全平权</td><td>✅</td><td>574→超大</td><td>保留/二排略窄</td><td>★★★★★</td></tr>
    <tr class="rating-s"><td><strong>小鹏X9</strong></td><td>180°躺平+加热+1.8m无压力</td><td>✅</td><td>→2554L(纯平)</td><td>180mm超宽</td><td>★★★★★</td></tr>
    <tr class="rating-a"><td><strong>极氪009</strong></td><td>通风+加热全系标配</td><td>✅(同级唯一全系)</td><td>中等</td><td>标准</td><td>★★★★</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>空间优秀+靠背大角度可调</td><td>新款有</td><td>348→2700L</td><td>200mm</td><td>★★★★</td></tr>
    <tr class="rating-b"><td><strong>腾势D9</strong></td><td>可前后移动/放倒不全平</td><td>✅</td><td>390→2310L</td><td>170mm标准</td><td>★★★</td></tr>
    <tr class="rating-b"><td><strong>星海V9</strong></td><td>4/6下沉放平(同级唯一)</td><td>—</td><td>593→2616L</td><td>200mm</td><td>★★★</td></tr>
  </tbody>
</table>

<h3>四、空间解读与选购建议</h3>
<ul>
  <li><strong>轴距之王</strong>：理想MEGA 3300mm，绝对空间最大，三排乘坐完全不委屈。但5.35m无后轮转向=日常停车噩梦</li>
  <li><strong>横向最宽</strong>：极氪009 2024mm，车内横向空间最充裕，但停车困难（老小区过道经常刮蹭）</li>
  <li><strong>头部最高</strong>：腾势D9 1900mm车高，戴帽子进出不碰头。但三排放倒不全平是硬伤</li>
  <li><strong>空间魔术师</strong>：小鹏X9三排一键电动纯平收纳→2554L，灵活性碾压。后轮转向让5.3m大车停起来像轿车</li>
  <li><strong>性价比之选</strong>：星海V9 4/6下沉放平同级唯一，593L后备箱基础就很大。但轴距3018mm决定了绝对空间不如大哥们</li>
</ul>
<div class="callout"><strong>选购建议：</strong>家用优先选三排体验+空间灵活性（小鹏X9/理想MEGA）；商务接待选二排豪华感（极氪009/腾势D9）；经常搬大件选折叠变形能力（小鹏X9/星海V9）。</div>
`
    },

    "motion-sick": {
      title: "防晕车技术深度调研",
      subtitle: "逐车型拆解防晕车技术路线、硬件配置、用户真实反馈，找出谁真正让后排不晕。",
      type: "article",
      concepts: [
        { name: "路面预瞄", role: "主动防晕核心", summary: "摄像头提前扫描路面坑洼→提前调整悬架=乘客感受不到颠簸。极氪009(定海中枢/150km/h防横风) > 腾势D9(云辇预瞄2.0/路面扫描) ≈ 岚图(魔毯预瞄) > 理想MEGA(魔毯3.0) >> 别克/星海(无预瞄)。" },
        { name: "防晕车算法", role: "软件定义舒适", summary: "小鹏X9 6D防晕车算法(每秒1000次扫描/提前300ms预判/200ms爆胎响应) — 纯软件方案但效果惊人。与极氪009硬件方案走不同技术路线，用户反馈均为「老人全程不晕」。" },
        { name: "能量回收晕感", role: "电动MPV通病", summary: "电机松油门立刻减速(类似发动机制动但更突兀)→后排乘客前后晃→晕车。解法：① 调低回收力度(但费电) ② 单踏板模式关掉 ③ 6D/防晕算法自动优化曲线。老人/儿童是高危群体。" }
      ],
      body: `
<h2>防晕车：电动MPV的头号体验问题</h2>
<p>所有电动MPV因电机扭矩响应快、能量回收晕感明显，后排乘客（特别是老人/儿童）天然比燃油车更容易晕车。这是电动MPV的「原罪」——选车时务必带家人试乘。</p>

<h3>一、为什么电动MPV更容易晕？</h3>
<table>
  <thead><tr><th>晕车诱因</th><th>燃油车</th><th>电动MPV</th><th>差异原因</th></tr></thead>
  <tbody>
    <tr><td>加速突兀感</td><td>低（变速箱缓冲）</td><td><strong>高（电机瞬时扭矩）</strong></td><td>电机0延迟出力，乘客被「推」</td></tr>
    <tr><td>减速拖拽感</td><td>低（滑行顺畅）</td><td><strong>高（能量回收）</strong></td><td>松油门=制动，乘客被「拽」</td></tr>
    <tr><td>过弯侧倾</td><td>中</td><td><strong>中偏高（车重2500-3000kg）</strong></td><td>电池让重心低但总重大</td></tr>
    <tr><td>后排感受倍率</td><td>前排的2-3倍</td><td><strong>前排的3-5倍</strong></td><td>以上三项叠加放大</td></tr>
  </tbody>
</table>

<h3>二、各车型防晕车技术路线对比</h3>
<table>
  <thead><tr><th>车型</th><th>技术路线</th><th>核心硬件</th><th>核心算法</th><th>用户反馈</th><th>评分</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>硬件为王</td><td>闭式双腔空悬+双阀CCD电磁减振+定海智能中枢</td><td>智能防横风+爆胎0.2s稳车+恒稳防晕</td><td>「150km/h过11级风」「物理层面解决问题」</td><td>9.5/10</td></tr>
    <tr class="rating-s"><td><strong>小鹏X9</strong></td><td>算法见长</td><td>双腔空悬+CDC</td><td>6D防晕算法(1000Hz扫描/300ms预判)+AI路面记忆+能量回收优化</td><td>「老人全程不晕」「过减速带几乎没震动」</td><td>9.0/10</td></tr>
    <tr class="rating-a"><td><strong>腾势D9</strong></td><td>底盘+预瞄</td><td>云辇-C(高级CDC)+路面预瞄2.0</td><td>摄像头预扫路面+智能调节阻尼</td><td>「过坎像飞毯」「高速稳定性出色」「隔振率96%」</td><td>8.5/10</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>全场景预瞄</td><td>双腔空悬+CDC+后轮转向</td><td>魔毯预瞄+雪地模式(防晕效果拉满)</td><td>「走烂路完全不传到车内」「底盘质感真的好」</td><td>8.0/10</td></tr>
    <tr class="rating-b"><td><strong>理想MEGA</strong></td><td>魔毯3.0</td><td>双腔空悬+CDC</td><td>魔毯悬架3.0</td><td>「偶有船感」「高速横摆需改进」</td><td>7.5/10</td></tr>
    <tr class="rating-c"><td><strong>合创V09</strong></td><td>基础防晕</td><td>CDC减震(无空悬)</td><td>基础舒适模式</td><td>「比普通电车好但不如顶级」</td><td>7.0/10</td></tr>
    <tr class="rating-c"><td><strong>别克GL8</strong></td><td>无主动防晕</td><td>被动悬架</td><td>无</td><td>「燃油车本身不太晕但底盘松散」</td><td>6.0/10</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>无主动防晕</td><td>被动悬架</td><td>无</td><td>「过坑弹跳感明显」「后排比较颠」</td><td>5.5/10</td></tr>
  </tbody>
</table>

<h3>三、防晕车实用建议</h3>
<ul>
  <li><strong>买车前</strong>：一定带容易晕车的家人试乘后排（高速+城市+过减速带三种场景各跑10分钟）</li>
  <li><strong>提车后</strong>：能量回收调到最低档或关闭单踏板模式；开启雪地/舒适模式（降低加减速灵敏度）</li>
  <li><strong>长途出行</strong>：后排坐正中间晕感最小；开窗通风；避免看手机/平板</li>
  <li><strong>技术排名</strong>：极氪009(硬件天花板) ≈ 小鹏X9(算法天花板) > 腾势D9(云辇很强) > 岚图(魔毯不错) > MEGA(偶有船感) >> 其余(听天由命)</li>
</ul>
<div class="callout"><strong>选购建议：</strong>家有容易晕车的老人/小孩，极氪009和小鹏X9是同级最佳方案（一个靠硬件一个靠软件），腾势D9也不错。理想MEGA偶有船感反馈需试乘确认。无空悬的车型（GL8/星海V9）后排晕感无法通过软件解决。</div>
`
    },

    "price-value": {
      title: "价格与性价比深度调研",
      subtitle: "逐车型拆解指导价、实际落地价、配置含金量、保值率，找出每一分钱花得最值的MPV。",
      type: "article",
      concepts: [
        { name: "价格梯队", role: "预算分档", summary: "20万内仅星海V9(17.99万起)。30万档：小鹏X9增程(30.98万)/岚图冠军版(30.99万)/腾势D9 DM(30.98万起)。35-46万混战：腾势D9/极氪009/小鹏X9纯电/岚图。50万+仅理想MEGA(52.98万)。" },
        { name: "保值率", role: "二手残值", summary: "小鹏X9(3年~58%/2026Q1数据) ≈ 腾势D9(3年55-58%/销量30万+支撑) > 极氪009(52-54%/品质口碑) > 理想MEGA(未满3年/1年80%) > 岚图(40-48%/品牌弱) >> 合创(30-35%/品牌存续风险)。新能源MPV整体低于燃油(赛那71%/GL8 60%+)。" },
        { name: "配置含金量", role: "同价位比谁给得多", summary: "小鹏X9增程30.98万(后轮转向+6D防晕+XNGP+双腔空悬+1602km=同价位配置最高) > 岚图冠军版30.99万(华为ADS4+空悬+后转向) > 腾势D9 30.98万(云辇-C+闪充) > 极氪009 41.38万(900V+6C+Naim音响=贵但值) > MEGA 52.98万(顶级但价格门槛高)。" }
      ],
      body: `
<h2>价格与性价比：每一分钱花在刀刃上</h2>
<p>MPV不同价格梯队差异巨大。35-55万的区间里选错一台车=多花5-10万冤枉钱。下面从指导价、落地价、配置含金量和保值率四个维度帮你算清楚。</p>

<h3>一、价格总览</h3>
<table>
  <thead><tr><th>车型</th><th>起步价(万)</th><th>顶配价(万)</th><th>动力形式</th><th>主力购买区间</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>星海V9</strong></td><td>17.99</td><td>27.99</td><td>增程</td><td>20万内唯一中大型MPV</td></tr>
    <tr class="rating-s"><td><strong>小鹏X9增程</strong></td><td>30.98</td><td>36.98</td><td>增程</td><td>30万档性价比最高</td></tr>
    <tr class="rating-s"><td><strong>岚图冠军版</strong></td><td>30.99</td><td>—</td><td>插混</td><td>30万档华为智驾</td></tr>
    <tr class="rating-a"><td><strong>腾势D9 DM-i</strong></td><td>30.98</td><td>46.98</td><td>插混/纯电</td><td>35-40万主力</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9纯电</strong></td><td>35.98</td><td>41.98</td><td>纯电</td><td>35-42万智驾首选</td></tr>
    <tr class="rating-a"><td><strong>极氪009</strong></td><td>41.38</td><td>44.38</td><td>纯电</td><td>41-45万豪华首选</td></tr>
    <tr class="rating-b"><td><strong>岚图梦想家</strong></td><td>32.99</td><td>45.99</td><td>插混/纯电</td><td>33-40万均衡之选</td></tr>
    <tr class="rating-b"><td><strong>别克GL8新能源</strong></td><td>24.99</td><td>32.99</td><td>插混</td><td>25-30万商务经典</td></tr>
    <tr class="rating-c"><td><strong>理想MEGA</strong></td><td>52.98</td><td>55.98</td><td>纯电</td><td>50万+旗舰</td></tr>
  </tbody>
</table>

<h3>二、30万档性价比对决</h3>
<p>30万是MPV市场最激烈的价格战场。三款车售价相差不到1000元：</p>
<table>
  <thead><tr><th>配置项</th><th>小鹏X9增程(30.98万)</th><th>岚图冠军版(30.99万)</th><th>腾势D9 DM(30.98万)</th></tr></thead>
  <tbody>
    <tr><td>后轮转向</td><td>✅ ±5°(转弯5.4m)</td><td>✅ ±5°(转弯5.9m)</td><td>❌</td></tr>
    <tr><td>空气悬架</td><td>✅ 双腔</td><td>✅ 单腔</td><td>❌(云辇-C/CDC)</td></tr>
    <tr><td>智能驾驶</td><td>✅ XNGP全场景</td><td>✅ 华为ADS4(鲲鹏版)</td><td>基础辅助</td></tr>
    <tr><td>纯电续航</td><td>452km</td><td>235km</td><td>401km</td></tr>
    <tr><td>综合续航</td><td>1602km</td><td>1530km</td><td>1200km</td></tr>
    <tr><td>防晕车</td><td>✅ 6D算法</td><td>✅ 魔毯预瞄</td><td>✅ 云辇预瞄</td></tr>
    <tr><td>二排按摩</td><td>✅ 10点</td><td>✅</td><td>✅ 16点</td></tr>
    <tr><td><strong>配置含金量</strong></td><td><strong>★★★★★</strong></td><td><strong>★★★★</strong></td><td><strong>★★★★</strong></td></tr>
  </tbody>
</table>

<h3>三、35-45万档价值排名</h3>
<table>
  <thead><tr><th>车型</th><th>价格(万)</th><th>核心卖点</th><th>综合评分</th><th>性价比评级</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>腾势D9 EV</strong></td><td>35.98起</td><td>800km续航+闪充+云辇+30万+销量验证</td><td>88/100</td><td>S(甜蜜区)</td></tr>
    <tr class="rating-s"><td><strong>小鹏X9纯电</strong></td><td>35.98起</td><td>XNGP+后轮转向+6D防晕+5C超充</td><td>88/100</td><td>S(甜蜜区)</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>32.99起</td><td>华为ADS4+空悬+后转向+终身质保</td><td>85/100</td><td>A(高性价比)</td></tr>
    <tr class="rating-a"><td><strong>极氪009</strong></td><td>41.38起</td><td>900V/6C+定海中枢+Naim音响+品质</td><td>87/100</td><td>A(贵但值)</td></tr>
    <tr class="rating-b"><td><strong>理想MEGA</strong></td><td>52.98起</td><td>3300mm轴距+最低电耗+5C补能+智驾</td><td>87/100</td><td>B(产品力强但溢价高)</td></tr>
  </tbody>
</table>

<h3>四、保值率预估(3年)</h3>
<table>
  <thead><tr><th>车型</th><th>3年残值率(预估)</th><th>影响因素</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>腾势D9</strong></td><td>55-60%</td><td>销量30万+台支撑/比亚迪品牌力/保有量大</td></tr>
    <tr class="rating-a"><td><strong>极氪009</strong></td><td>50-55%</td><td>品质口碑好/改款频率低/豪华定位</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>50%</td><td>品牌溢价/但外观争议影响二手流通</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9</strong></td><td>~58%</td><td>2026Q1数据：25-40万纯电MPV中排名靠前/智驾保值</td></tr>
    <tr class="rating-b"><td><strong>岚图梦想家</strong></td><td>40-45%</td><td>品牌知名度低/保有量小/二手市场窄</td></tr>
    <tr class="rating-c"><td><strong>合创V09</strong></td><td>30-35%</td><td>品牌存续风险/销量极低/配件担忧</td></tr>
  </tbody>
</table>

<div class="callout"><strong>选购建议：</strong>30万预算首选小鹏X9增程（配置碾压）或岚图冠军版（华为生态）。35-40万是甜蜜区，腾势D9和小鹏X9纯电都是88分好车。极氪009 41万起贵但品质和补能独一档。理想MEGA产品力没话说但52.98万门槛劝退大部分人。</div>
`
    },

    recommendation: {
      title: "综合推荐与选购指南",
      subtitle: "基于所有维度（电池/底盘/智驾/空间/防晕/售后/价格）的终极汇总，按使用场景给出明确推荐。",
      type: "article",
      concepts: [
        { name: "六维评分体系", role: "综合评判标准", summary: "续航补能(20%)+空间舒适(20%)+智能驾驶(20%)+底盘质感(15%)+品牌保值(10%)+性价比(15%)。权重按家庭MPV使用场景设定，不同需求可自行调整。" },
        { name: "场景化选车", role: "按需求匹配", summary: "家用二胎→小鹏X9增程；商务接待→极氪009六座；智能科技→小鹏X9纯电；长途重度→理想MEGA；底盘舒适→极氪009；30万预算→小鹏X9增程/岚图冠军版；20万预算→星海V9。" }
      ],
      body: `
<h2>综合推荐：谁是你的最佳MPV？</h2>
<p>我们基于六维评分体系，从电池、底盘、智驾、空间、防晕车、售后、价格七个维度对所有MPV进行了深度拆解，并按场景化选车逻辑给出推荐。最终结论不是「谁最好」，而是「谁最适合你」。</p>

<h3>一、综合评分总览(满分100)</h3>
<table>
  <thead><tr><th>排名</th><th>车型</th><th>续航补能</th><th>空间舒适</th><th>智能驾驶</th><th>底盘质感</th><th>品牌保值</th><th>性价比</th><th>加权总分</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td>1</td><td><strong>小鹏X9</strong></td><td>8.5</td><td>9.0</td><td>9.5</td><td>8.0</td><td>7.0</td><td>9.0</td><td><strong>88</strong></td></tr>
    <tr class="rating-s"><td>2</td><td><strong>腾势D9</strong></td><td>9.0</td><td>8.5</td><td>8.0</td><td>9.0</td><td>9.0</td><td>8.5</td><td><strong>88</strong></td></tr>
    <tr class="rating-a"><td>3</td><td><strong>极氪009</strong></td><td>9.0</td><td>9.0</td><td>7.0</td><td>9.5</td><td>8.0</td><td>7.0</td><td><strong>87</strong></td></tr>
    <tr class="rating-a"><td>4</td><td><strong>理想MEGA</strong></td><td>9.0</td><td>9.0</td><td>9.0</td><td>8.5</td><td>8.0</td><td>6.0</td><td><strong>87</strong></td></tr>
    <tr class="rating-a"><td>5</td><td><strong>岚图梦想家</strong></td><td>8.0</td><td>8.5</td><td>8.5</td><td>8.5</td><td>6.5</td><td>8.5</td><td><strong>85</strong></td></tr>
    <tr class="rating-b"><td>6</td><td><strong>合创V09</strong></td><td>8.0</td><td>7.5</td><td>6.5</td><td>7.5</td><td>5.0</td><td>7.5</td><td><strong>77</strong></td></tr>
    <tr class="rating-b"><td>7</td><td><strong>别克GL8</strong></td><td>5.0</td><td>7.0</td><td>4.0</td><td>7.0</td><td>8.5</td><td>7.0</td><td><strong>72</strong></td></tr>
    <tr class="rating-c"><td>8</td><td><strong>星海V9</strong></td><td>7.0</td><td>6.5</td><td>3.5</td><td>6.0</td><td>4.5</td><td>8.5</td><td><strong>68</strong></td></tr>
  </tbody>
</table>

<h3>二、按你的核心诉求选车</h3>
<table>
  <thead><tr><th>你的核心诉求</th><th>首推车型</th><th>次推</th><th>为什么</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>家庭日用（二胎/三胎）</strong></td><td>小鹏X9增程</td><td>腾势D9 DM-i</td><td>防晕车+智驾+后轮转向+1602km无焦虑+30万起</td></tr>
    <tr class="rating-s"><td><strong>商务接待/高端需求</strong></td><td>极氪009六座</td><td>腾势D9 EV</td><td>品质感+静谧+Naim音响+国宾级认证</td></tr>
    <tr class="rating-a"><td><strong>智能科技/解放双手</strong></td><td>小鹏X9纯电</td><td>岚图梦想家乾崑</td><td>XNGP全场景第一 / 华为ADS4+鸿蒙5</td></tr>
    <tr class="rating-a"><td><strong>长途出行/重度用车</strong></td><td>理想MEGA</td><td>极氪009双电机</td><td>补能最快+电耗最低 / 6C极速+720km</td></tr>
    <tr class="rating-a"><td><strong>底盘舒适/驾乘品质</strong></td><td>极氪009</td><td>岚图梦想家</td><td>定海中枢硬件天花板 / 双叉臂+五连杆+后转向</td></tr>
    <tr class="rating-s"><td><strong>性价比/预算30万</strong></td><td>小鹏X9增程</td><td>岚图梦想家冠军版</td><td>30.98万/智驾领先 / 30.99万/底盘优秀</td></tr>
    <tr class="rating-b"><td><strong>预算20万内</strong></td><td>星海V9越享</td><td>别克GL8新能源</td><td>14.99万起唯一中大型 / 24.99万品牌保障</td></tr>
    <tr class="rating-a"><td><strong>售后无忧/质保最长</strong></td><td>岚图梦想家</td><td>腾势D9</td><td>终身质保+终身保养 / 6年15万km+比亚迪网络</td></tr>
  </tbody>
</table>

<h3>三、各车一句话总结</h3>
<ul>
  <li><strong>小鹏X9</strong>：智驾+灵活性+防晕车的全能选手，30万增程版性价比爆棚。适合科技家庭。</li>
  <li><strong>腾势D9</strong>：均衡到几乎没有短板的MPV销冠，闪充更是解决了最后的焦虑。适合稳妥派。</li>
  <li><strong>极氪009</strong>：底盘和品质是天花板，6C补能行业最快。适合商务+追求品质的人。</li>
  <li><strong>理想MEGA</strong>：产品力没话说，补能体验无限接近燃油车。但价格门槛和外观争议限制了受众。</li>
  <li><strong>岚图梦想家</strong>：华为智驾+底盘调校+终身质保=30万价位最全面。品牌力是唯一短板。</li>
  <li><strong>别克GL8</strong>：商务经典地位不可动摇，但智能化已全面落后时代。</li>
  <li><strong>星海V9</strong>：20万内唯一中大型MPV，预算有限的务实之选。智能和底盘都是基础水平。</li>
</ul>

<h3>四、车主真实声音精选</h3>
<ul>
  <li>「云辇底盘确实稳，过坑压井盖很干脆。高速起伏路面底盘很整。」—— 腾势D9车主</li>
  <li>「5.3米大车转弯半径5.4米，地下车库随便钻。6D防晕车名不虚传，我妈第一次坐电车没晕。」—— 小鹏X9车主</li>
  <li>「900V充电是真快，服务区泡碗面的功夫回血500km。Naim音响一开简直音乐厅。就是宽了点，老小区进出提心吊胆。」—— 极氪009车主</li>
  <li>「乾崑版半年8873公里，满分10分我给9.5。华为高速领航一上高速就不想自己开了。」—— 岚图梦想家车主</li>
  <li>「产品力没话说，补能体验无限接近燃油车。就是这造型…喜欢的爱死。5米35没后转向，市区真的痛苦。」—— 理想MEGA车主</li>
</ul>

<div class="callout"><strong>终极建议：</strong>数据和评分只是参考，MPV是全家人坐的车——一定带家人（特别是容易晕车的老人/小孩）实际试驾后做最终决策。再好的参数也不如10分钟后排试乘来得真实。</div>
`
    },

    "crash-safety": {
      title: "碰撞与安全深度调研",
      subtitle: "逐车型拆解车身结构、碰撞测试成绩、气囊配置、电池安全、主动安全AEB/AES能力，找出谁真正保护全家。",
      type: "article",
      concepts: [
        { name: "车身结构强度", role: "被动安全基础", summary: "极氪009(扭转刚度36450N·m/deg/2000MPa双A柱/全球唯一通过MPV连环追尾) > 腾势D9(75%高强钢/2000MPa/3.2m侧气帘) ≈ 小鹏X9(19道环形设计/A柱零变形/C-NCAP 86.6%五星/主动安全MPV最高) > 岚图(75%高强钢/超美标追尾110km/h) > 别克/星海(传统被动安全)。" },
        { name: "电池热失控防护", role: "新能源安全核心", summary: "比亚迪刀片电池(针刺不起火/500°C热失控门槛)安全性公认最强 > 极氪神盾电池(16项极端测试/十宫格防撞) > 小鹏(IP68防水/24h不起火不爆炸/2000J底部抗冲击) > 岚图琥珀电池(主动预警) > 麒麟电池(宁德时代CTP/热管理优秀但三元锂体系)。" },
        { name: "主动安全AEB/AES", role: "避撞第一道防线", summary: "极氪009(G-AEB 130km/h刹停+G-AES 130km/h避让+70项主动安全) > 第二代腾势D9(3A防护/120km/h AEB+AES+140km/h爆胎稳行) ≈ 岚图梦想家(华为ADS3.0/AEB+AES 120km/h实测通过) > 小鹏X9(AEB+AES+爆胎稳行/C-NCAP主动安全MPV最高分) >> 别克/星海(基础AEB)。注：一代D9实测AEB仅90km/h以下可靠。" },
        { name: "气囊配置", role: "碰撞中的救命稻草", summary: "腾势D9(9气囊/3.2m贯穿三排侧气帘) ≈ 小鹏X9(9气囊/含三排贯穿气帘+二排坐垫气囊+前排双腔远端) ≈ 极氪009(前后排头部气帘+前后排侧气囊+前排中间) > 理想MEGA(三排均有气囊) > 岚图(标准6-8气囊) >> 低配车型(仅4-6气囊)。" }
      ],
      body: `
<h2>碰撞与安全：MPV满载一家人，安全是底线中的底线</h2>
<p>MPV动辄5米+车长、2.5-3吨车重，一旦发生碰撞，能量远超普通轿车。安全的核心在于车身结构强度、电池热失控防护、主动安全AEB/AES和气囊配置四个方面。满载7人（含老人和儿童），安全性不是加分项而是一票否决项。</p>

<h3>一、C-NCAP碰撞测试成绩</h3>
<table>
  <thead><tr><th>车型</th><th>C-NCAP评级</th><th>得分率</th><th>主动安全得分</th><th>特殊成就</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>小鹏X9</strong></td><td>★★★★★</td><td>86.6%</td><td>MPV主动安全最高</td><td>14个子项目满分/A柱零变形</td></tr>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>★★★★★</td><td>优秀</td><td>优秀</td><td>全球唯一通过MPV连环追尾试验</td></tr>
    <tr class="rating-s"><td><strong>腾势D9</strong></td><td>★★★★★</td><td>优秀</td><td>优秀</td><td>电池安全五星/健康座舱五星</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>★★★★★</td><td>优秀</td><td>良好</td><td>首款C-NCAP五星新能源MPV/超美标追尾110km/h</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>★★★★★</td><td>优秀</td><td>优秀</td><td>堡垒车身/88km/h追尾测试</td></tr>
    <tr class="rating-b"><td><strong>别克GL8</strong></td><td>★★★★★</td><td>良好</td><td>良好</td><td>传统安全标准</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>待测试</td><td>—</td><td>—</td><td>尚无权威碰撞数据</td></tr>
  </tbody>
</table>

<h3>二、车身结构与被动安全</h3>
<table>
  <thead><tr><th>车型</th><th>车身扭转刚度</th><th>高强钢占比</th><th>最高钢材强度</th><th>气囊数量</th><th>特殊设计</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>36450 N·m/deg</td><td>高(钢铝混合)</td><td>2000MPa</td><td>8-10个</td><td>2000MPa双A柱/十宫格电池防撞/后碰105km/h耐受</td></tr>
    <tr class="rating-s"><td><strong>小鹏X9</strong></td><td>优秀</td><td>高</td><td>2000MPa</td><td>9个(全系)</td><td>19道环形安全设计/A柱内嵌热气胀工艺管/三排贯穿气帘</td></tr>
    <tr class="rating-s"><td><strong>腾势D9</strong></td><td>36000 N·m/deg</td><td>75%</td><td>2000MPa</td><td>9个(全系)</td><td>3.2m超长侧气帘贯穿三排/碰撞自动解锁</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>31000 N·m/deg</td><td>75%</td><td>高强钢</td><td>6-8个</td><td>双骨架结构/后防撞梁吸能率85%</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>优秀</td><td>高</td><td>高强钢</td><td>8个+</td><td>堡垒车身/三排均有气囊保护</td></tr>
    <tr class="rating-b"><td><strong>别克GL8</strong></td><td>一般</td><td>70%</td><td>1500MPa</td><td>6-8个</td><td>传统笼式车身</td></tr>
  </tbody>
</table>

<h3>三、电池安全对比</h3>
<table>
  <thead><tr><th>车型</th><th>电池类型</th><th>安全技术</th><th>热失控防护</th><th>防水等级</th><th>安全评级</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>腾势D9</strong></td><td>刀片电池(LFP)</td><td>针刺不起火/挤压/高温</td><td>500°C+热失控门槛</td><td>IP68</td><td>★★★★★</td></tr>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>神盾/麒麟电池</td><td>16项极端测试/十宫格防撞</td><td>全域热管理+主动预警</td><td>IP68</td><td>★★★★★</td></tr>
    <tr class="rating-s"><td><strong>小鹏X9</strong></td><td>磷酸铁锂(LFP)</td><td>24h不起火不爆炸(新国标)</td><td>六维电安全保护</td><td>IP68</td><td>★★★★★</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>琥珀电池</td><td>主动预警+热管理</td><td>多重极端测试通过</td><td>IP67+</td><td>★★★★</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>麒麟5C(三元锂)</td><td>宁德时代CTP/热管理</td><td>优秀(但三元锂固有风险高于LFP)</td><td>IP67</td><td>★★★★</td></tr>
  </tbody>
</table>

<h3>四、主动安全功能对比</h3>
<table>
  <thead><tr><th>车型</th><th>AEB刹停速度</th><th>AES避让</th><th>爆胎稳行</th><th>主动安全项数</th><th>哨兵模式</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>130km/h</td><td>✅ 130km/h连续避让</td><td>✅</td><td>70+项</td><td>✅</td></tr>
    <tr class="rating-s"><td><strong>腾势D9</strong></td><td>120km/h(隧道)</td><td>✅ 130km/h</td><td>✅ 140km/h</td><td>3A防护体系</td><td>✅</td></tr>
    <tr class="rating-s"><td><strong>小鹏X9</strong></td><td>高速AEB</td><td>✅ AES</td><td>✅ 全场景</td><td>15+项</td><td>✅</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>AEB标配</td><td>✅</td><td>部分</td><td>17项</td><td>✅</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>AEB标配</td><td>✅</td><td>✅</td><td>丰富</td><td>✅</td></tr>
    <tr class="rating-b"><td><strong>别克GL8</strong></td><td>基础AEB</td><td>❌</td><td>❌</td><td>基础</td><td>❌</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>基础AEB</td><td>❌</td><td>❌</td><td>基础</td><td>❌</td></tr>
  </tbody>
</table>

<h3>五、极端碰撞测试亮点</h3>
<ul>
  <li><strong>极氪009 — 连环追尾</strong>：60km/h追尾19吨货车 + 被55km/h SUV追尾 → 车门正常开启/A/B/C柱零变形/电池无异常/气囊精准弹出。全球唯一通过此项测试的MPV</li>
  <li><strong>岚图梦想家 — 超美标追尾</strong>：110km/h追尾测试通过（美标仅要求80km/h），三排空间完整保留</li>
  <li><strong>理想MEGA — 高速追尾</strong>：88km/h追尾测试通过，三排均有气囊覆盖</li>
  <li><strong>小鹏X9 — C-NCAP五星86.6%</strong>：主动安全得分率97.68%(MPV最高)，14个子项目满分，A柱正碰零变形。（注：翼真L380综合90.0%已超越，但X9主动安全仍MPV最高）</li>
  <li><strong>第二代腾势D9(2026) — 高速场景全覆盖</strong>：120km/h隧道AEB刹停 + AES自动转向 + 140km/h爆胎稳行。<em>注：一代D9实测AEB仅80-90km/h可靠，独立媒体测试中100km/h未能刹停</em></li>
</ul>

<h3>六、安全综合排名</h3>
<table>
  <thead><tr><th>排名</th><th>车型</th><th>被动安全</th><th>主动安全</th><th>电池安全</th><th>综合评级</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td>1</td><td><strong>极氪009</strong></td><td>9.5/10</td><td>9.5/10</td><td>9.0/10</td><td><strong>S 级</strong></td></tr>
    <tr class="rating-s"><td>2</td><td><strong>小鹏X9</strong></td><td>9.0/10</td><td>9.0/10</td><td>9.0/10</td><td><strong>S 级</strong></td></tr>
    <tr class="rating-s"><td>2</td><td><strong>腾势D9</strong></td><td>9.0/10</td><td>9.0/10</td><td>9.5/10</td><td><strong>S 级</strong></td></tr>
    <tr class="rating-a"><td>4</td><td><strong>岚图梦想家</strong></td><td>8.5/10</td><td>8.0/10</td><td>8.5/10</td><td><strong>A 级</strong></td></tr>
    <tr class="rating-a"><td>5</td><td><strong>理想MEGA</strong></td><td>8.5/10</td><td>8.5/10</td><td>8.0/10</td><td><strong>A 级</strong></td></tr>
    <tr class="rating-b"><td>6</td><td><strong>别克GL8</strong></td><td>7.0/10</td><td>6.0/10</td><td>6.5/10</td><td><strong>B 级</strong></td></tr>
    <tr class="rating-c"><td>7</td><td><strong>星海V9</strong></td><td>6.0/10</td><td>5.0/10</td><td>6.5/10</td><td><strong>C 级</strong></td></tr>
  </tbody>
</table>

<div class="callout"><strong>选购建议：</strong>MPV满载一家人（含老人儿童），安全是第一优先级。极氪009/小鹏X9/腾势D9三者在被动+主动+电池安全三个维度都是S级，可以放心买。岚图和理想MEGA也是A级水准。别克GL8和星海V9的主动安全明显落后一代。特别注意：不要为了省钱买低配减气囊的版本——MPV碰撞时侧气帘覆盖三排是关键。</div>
`
    },

    "smart-cockpit": {
      title: "智能座舱深度调研",
      subtitle: "逐车型拆解座舱芯片、屏幕配置、音响系统、后排娱乐、语音交互、车机生态，找出谁的车内体验最好。",
      type: "article",
      concepts: [
        { name: "座舱芯片", role: "车机流畅度基础", summary: "双8295(极氪009/最流畅) > 8295P(小鹏/腾势/理想/岚图/主流旗舰标配) >> 8155(合创/别克/星海/上一代/明显卡顿)。8295 AI算力是8155的7.5倍(30TOPS vs 4TOPS)，GPU性能3倍提升。" },
        { name: "音响系统", role: "MPV影音核心", summary: "极氪009 Naim(31扬声器/3868W/英国国宝级/宾利御用) >>> 腾势D9 帝瓦雷(30扬声器/顶级) > 小鹏X9聆境AI(27扬声器/7.1.6声道) > 岚图丹拿 > 别克BOSE >> 星海/合创(无品牌音响)。" },
        { name: "后排娱乐屏", role: "长途乘客体验", summary: "小鹏X9(21.4英寸/莱茵认证/最大) > 极氪009(17英寸3K OLED吸顶屏) ≈ 岚图/合创(17.3英寸) > 腾势D9(12.8英寸后排屏) > 别克/星海(无后排屏)。OLED vs LCD画质差距明显。" }
      ],
      body: `
<h2>智能座舱：谁让坐车变成一种享受？</h2>
<p>MPV长途出行动辄3-5小时，后排娱乐屏和音响系统的质量，加上座舱芯片的算力，直接决定了旅途是「煎熬」还是「享受」。</p>

<h3>一、座舱硬件对比</h3>
<table>
  <thead><tr><th>车型</th><th>座舱芯片</th><th>中控屏</th><th>后排屏</th><th>音响品牌</th><th>扬声器数</th><th>功率(W)</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>双8295</td><td>16英寸3.5K Mini-LED</td><td>17英寸3K OLED吸顶</td><td>Naim殿堂之声</td><td>31</td><td>3868</td></tr>
    <tr class="rating-s"><td><strong>腾势D9</strong></td><td>8295P</td><td>15.6英寸</td><td>12.8英寸+后排生态屏</td><td>帝瓦雷Devialet</td><td>30</td><td>顶级</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9</strong></td><td>8295P+5G</td><td>大屏</td><td>21.4英寸(莱茵)</td><td>聆境AI音响</td><td>27</td><td>7.1.6声道</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>8295P</td><td>双15.7英寸2K联屏</td><td>后排大屏</td><td>高品质</td><td>21+</td><td>优秀</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>8295P</td><td>一体式中控+副驾</td><td>17.3英寸</td><td>丹拿Dynaudio</td><td>23</td><td>优秀</td></tr>
    <tr class="rating-b"><td><strong>别克GL8</strong></td><td>8155</td><td>标准</td><td>—</td><td>BOSE</td><td>14</td><td>一般</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>8155</td><td>标准</td><td>—</td><td>无品牌</td><td>基础</td><td>—</td></tr>
  </tbody>
</table>

<h3>二、音响体验排名</h3>
<ul>
  <li><strong>S+ 极氪009 Naim</strong>：英国国宝级音响品牌，宾利同源。31扬声器+3868W+7.2.7.8全维环绕。车内关门一开音响 = 小型音乐厅</li>
  <li><strong>S 腾势D9 帝瓦雷</strong>：法国顶级音响品牌。30扬声器+剧院级声场。D9密封性好，配合帝瓦雷效果极佳</li>
  <li><strong>A 小鹏X9 聆境AI</strong>：27扬声器+7.1.6全景声道+AI音效优化。虽无顶级品牌背书但实际效果不输</li>
  <li><strong>A 岚图梦想家 丹拿</strong>：丹麦老牌音响。23扬声器，中频人声表现出色</li>
  <li><strong>B 别克GL8 BOSE</strong>：14扬声器，够用但与上面差距明显</li>
</ul>

<h3>三、智能交互与生态</h3>
<table>
  <thead><tr><th>功能</th><th>极氪009</th><th>腾势D9</th><th>小鹏X9</th><th>岚图(乾崑)</th><th>理想MEGA</th></tr></thead>
  <tbody>
    <tr><td>语音助手</td><td>Zeekr AI</td><td>AI大模型</td><td>小P(AI)</td><td>小艺(华为)</td><td>理想同学</td></tr>
    <tr><td>多音区识别</td><td>✅ 全车</td><td>✅ 全车11屏联动</td><td>✅ 4音区</td><td>✅ 华为多音区</td><td>✅</td></tr>
    <tr><td>手机互联</td><td>CarPlay/CarLink</td><td>比亚迪生态</td><td>XOS/投屏</td><td>鸿蒙5/华为全家桶</td><td>CarPlay/理想</td></tr>
    <tr><td>OTA升级</td><td>✅ 全域</td><td>✅ 全域</td><td>✅ 全域(最频繁)</td><td>✅ 华为推送</td><td>✅ 全域</td></tr>
    <tr><td>智能冰箱</td><td>✅ 8.6L恒温</td><td>✅ 7.5L冷暖</td><td>✅</td><td>✅ 冷暖</td><td>✅</td></tr>
    <tr><td>电吸门</td><td>✅</td><td>✅(第二代新增)</td><td>—</td><td>—</td><td>✅</td></tr>
  </tbody>
</table>

<div class="callout"><strong>选购建议：</strong>追求极致影音→极氪009(Naim音响是同级唯一奢华级)。追求华为生态一体化→岚图梦想家乾崑版。追求后排娱乐→小鹏X9(21.4英寸最大屏)。追求全面均衡→腾势D9(11屏联动+帝瓦雷+AI座舱)。不在意座舱→别克GL8够用就好。</div>
`
    },

    "range-charging": {
      title: "续航与补能深度调研",
      subtitle: "逐车型拆解CLTC续航、实测达成率、冬季衰减、充电速度、800V平台差异，找出谁的续航最实在。",
      type: "article",
      concepts: [
        { name: "CLTC vs 实测", role: "续航真相", summary: "CLTC标称续航=理想工况，高速实测达成率仅70-80%。理想MEGA(76%最佳) > 小鹏X9(~80%城市/高速差异大) > 极氪009(~73%) > 合创V09(~75%)。冬季高速再打7折=标称700km→实跑350-400km。" },
        { name: "800V vs 400V", role: "充电速度分水岭", summary: "900V(极氪009/6C/10min补510km) > 800V+5C(理想/小鹏/岚图/腾势闪充) >> 400V(老款/充电慢一倍)。800V=同样充10分钟多跑200km。是2025-2026年旗舰标配。" },
        { name: "增程vs纯电vs插混", role: "补能策略选择", summary: "纯电(最省钱/充电焦虑)+增程(可油可电/无焦虑/高速油耗高)+插混(灵活/纯电续航短)。无家充→选增程/插混；有家充+市区通勤→纯电最划算；经常长途→增程最省心。" }
      ],
      body: `
<h2>续航与补能：标称续航≠实际续航</h2>
<p>买电车最大的焦虑就是续航。CLTC vs 实测差距巨大——尤其是MPV这种大车。而800V vs 400V平台、增程vs纯电vs插混的路线选择更直接决定补能体验。下面用实测数据说话。</p>

<h3>一、纯电续航对比</h3>
<table>
  <thead><tr><th>车型</th><th>CLTC标称(km)</th><th>高速实测(km)</th><th>达成率</th><th>城市实测(km)</th><th>冬季高速预估(km)</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>腾势D9 EV(第二代)</strong></td><td>800</td><td>~570</td><td>~71%</td><td>~680</td><td>~400</td></tr>
    <tr class="rating-s"><td><strong>合创V09 762版</strong></td><td>762</td><td>~570</td><td>~75%</td><td>—</td><td>~400</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9纯电</strong></td><td>740</td><td>~590</td><td>~80%</td><td>~650</td><td>~410</td></tr>
    <tr class="rating-a"><td><strong>极氪009单电机</strong></td><td>740</td><td>~530</td><td>~73%</td><td>—</td><td>~370</td></tr>
    <tr class="rating-a"><td><strong>极氪009双电机</strong></td><td>720</td><td>~510</td><td>~71%</td><td>—</td><td>~360</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>710</td><td>~507</td><td>76%</td><td>~652</td><td>~355</td></tr>
    <tr class="rating-b"><td><strong>岚图梦想家EV</strong></td><td>700</td><td>~490</td><td>~70%</td><td>—</td><td>~345</td></tr>
  </tbody>
</table>

<h3>二、混动/增程综合续航</h3>
<table>
  <thead><tr><th>车型</th><th>纯电续航(km)</th><th>综合续航(km)</th><th>亏电油耗(L/100km)</th><th>适合场景</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>小鹏X9增程</strong></td><td>452</td><td>1602</td><td>~6.5</td><td>日常纯电+长途无焦虑</td></tr>
    <tr class="rating-s"><td><strong>岚图梦想家PHEV</strong></td><td>350</td><td>1530</td><td>5.42</td><td>日常纯电+油电灵活</td></tr>
    <tr class="rating-a"><td><strong>星海V9</strong></td><td>200</td><td>1300</td><td>~7.0</td><td>短途纯电+长途吃油</td></tr>
    <tr class="rating-a"><td><strong>腾势D9 DM-i</strong></td><td>401</td><td>1520</td><td>~6.35</td><td>纯电通勤最长/长途灵活</td></tr>
    <tr class="rating-b"><td><strong>别克GL8新能源</strong></td><td>200</td><td>1000</td><td>~7.5</td><td>短途纯电/主要吃油</td></tr>
  </tbody>
</table>

<h3>三、充电速度对比(10%→80%)</h3>
<table>
  <thead><tr><th>车型</th><th>电压平台</th><th>充电倍率</th><th>10→80%时间</th><th>峰值功率</th><th>10min补能(km)</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>900V</td><td>6C</td><td>~10min</td><td>705kW</td><td>510km</td></tr>
    <tr class="rating-s"><td><strong>腾势D9(闪充)</strong></td><td>闪充架构</td><td>极速</td><td>~9min(10→97%!)</td><td>1500kW(闪充桩)</td><td>超快</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>800V</td><td>5C</td><td>~8min(30→80%)</td><td>520kW</td><td>500km</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9</strong></td><td>800V</td><td>5C</td><td>~12min</td><td>400kW+</td><td>405km</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>800V</td><td>5C</td><td>~12min</td><td>480kW</td><td>—</td></tr>
    <tr class="rating-b"><td><strong>合创V09</strong></td><td>800V</td><td>4C</td><td>~15min</td><td>380kW</td><td>—</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>400V</td><td>标准</td><td>~30min</td><td>—</td><td>—</td></tr>
  </tbody>
</table>

<div class="callout"><strong>选购建议：</strong>有家充+市区通勤→纯电最划算（月电费几十元）。无家充/经常长途→增程/插混更省心（小鹏X9增程1602km/腾势D9 DM 1521km）。纯电长途→充电速度是关键，极氪6C和腾势闪充是最快的（10分钟补500km级别）。冬季重度用车→纯电续航打5折考虑，增程无焦虑。</div>
`
    },

    performance: {
      title: "动力性能深度调研",
      subtitle: "逐车型拆解零百加速、电机参数、四驱vs两驱、NVH静谧性，找出谁开起来最爽、坐起来最安静。",
      type: "article",
      concepts: [
        { name: "零百加速", role: "动力性能直观指标", summary: "极氪009双电机(3.9s/超跑区间) >> 理想MEGA(5.5s) > 小鹏X9四驱(5.7s) ≈ 岚图(5.9s) >> 极氪单电机(6.9s) ≈ 腾势D9(6.9s) > GL8(7.7s) > X9增程(8.0s) > 星海V9(9.5s)。" },
        { name: "NVH静谧性", role: "乘坐品质核心", summary: "极氪009(Naim音响+全车隔音+电吸门/120km/h车内<65dB) > 腾势D9(帝瓦雷+云辇+电吸门) > 理想MEGA(风阻0.215/电机静) > 小鹏X9(双层隔音玻璃) >> 别克GL8(发动机噪音) > 星海V9(隔音一般)。纯电天然比燃油安静。" }
      ],
      body: `
<h2>动力性能：谁开起来最有底气？</h2>
<p>MPV不追求赛道成绩，但满载7人+行李=3吨+的情况下，动力储备决定了超车/爬坡/高速汇入的安全感。NVH静谧性则直接影响车内对话和休息质量。</p>

<h3>一、零百加速排行</h3>
<table>
  <thead><tr><th>车型</th><th>0-100km/h</th><th>电机形式</th><th>总功率(kW)</th><th>总扭矩(N·m)</th><th>动力定位</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>极氪009双电机</strong></td><td>3.9s</td><td>双电机四驱</td><td>680</td><td>913</td><td>超跑级/唯一进4s</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>5.5s</td><td>双电机四驱</td><td>400+</td><td>542</td><td>充沛/随叫随到</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9四驱</strong></td><td>5.7s</td><td>双电机四驱</td><td>370+</td><td>640+</td><td>充沛/超车无压力</td></tr>
    <tr class="rating-a"><td><strong>岚图梦想家</strong></td><td>5.9s</td><td>双电机四驱</td><td>612马力</td><td>693</td><td>充沛/全系四驱</td></tr>
    <tr class="rating-b"><td><strong>极氪009单电机</strong></td><td>6.9s</td><td>后驱单电机</td><td>310</td><td>—</td><td>够用/日常充足</td></tr>
    <tr class="rating-b"><td><strong>腾势D9 EV</strong></td><td>6.9s</td><td>后驱为主</td><td>—</td><td>—</td><td>够用/舒适取向</td></tr>
    <tr class="rating-b"><td><strong>别克GL8</strong></td><td>7.7s</td><td>插混</td><td>—</td><td>—</td><td>够用/平顺</td></tr>
    <tr class="rating-c"><td><strong>小鹏X9增程</strong></td><td>8.0s</td><td>后驱+增程器</td><td>—</td><td>—</td><td>舒适够用/不急</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>9.5s</td><td>增程</td><td>—</td><td>—</td><td>偏弱/满载爬坡吃力</td></tr>
  </tbody>
</table>

<h3>二、动力实际体验解读</h3>
<ul>
  <li><strong>3-5s(超跑级)</strong>：极氪009双电机3.9s — 推背感强到后排乘客会叫，一般用不到但超车/应急很安心</li>
  <li><strong>5-6s(充沛级)</strong>：MEGA/X9四驱/岚图 — 日常完全够用，高速超车和上坡毫无压力</li>
  <li><strong>7-8s(够用级)</strong>：腾势D9/GL8/X9增程 — 市区通勤无感知差异，但满载高速超车略慢</li>
  <li><strong>9s+(偏弱级)</strong>：星海V9 — 满载爬坡/超车会有「肉」的感觉，动力是它最大短板</li>
</ul>

<h3>三、NVH静谧性排名</h3>
<table>
  <thead><tr><th>车型</th><th>120km/h车内噪音</th><th>关键降噪技术</th><th>静谧感评级</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td><strong>极氪009</strong></td><td>&lt;65dB(预估)</td><td>双层隔音玻璃+电吸门+全车隔音棉+Naim主动降噪</td><td>★★★★★</td></tr>
    <tr class="rating-s"><td><strong>腾势D9</strong></td><td>&lt;66dB(预估)</td><td>电吸门+隐私声盾+帝瓦雷+云辇底盘隔振</td><td>★★★★★</td></tr>
    <tr class="rating-a"><td><strong>理想MEGA</strong></td><td>&lt;67dB(预估)</td><td>0.215cd风阻系数(MPV最低)+双层玻璃</td><td>★★★★</td></tr>
    <tr class="rating-a"><td><strong>小鹏X9</strong></td><td>~68dB</td><td>双层隔音玻璃+空悬隔振</td><td>★★★★</td></tr>
    <tr class="rating-b"><td><strong>岚图梦想家</strong></td><td>~68dB</td><td>双层玻璃+丹拿</td><td>★★★★</td></tr>
    <tr class="rating-b"><td><strong>别克GL8</strong></td><td>~72dB</td><td>BOSE降噪(但发动机噪音明显)</td><td>★★★</td></tr>
    <tr class="rating-c"><td><strong>星海V9</strong></td><td>~74dB</td><td>基础隔音</td><td>★★</td></tr>
  </tbody>
</table>

<div class="callout"><strong>选购建议：</strong>动力不是MPV核心卖点但底线很重要——5-7s够用，低于8s满载会觉得肉。NVH是日常感知最强的指标——纯电天然比燃油安静一大截，极氪009和腾势D9是静谧性天花板。星海V9动力和NVH都是最弱项。</div>
`
    },

    "shanghai-policy": {
      title: "上海购车政策",
      subtitle: "上海新能源车绿牌政策、购置税减免、补贴明细——买MPV之前必须算清楚的账。",
      type: "article",
      concepts: [
        { name: "上海绿牌政策", role: "省下10万沪牌费", summary: "至2026.12.31：仅纯电/燃料电池可免费上绿牌（插混/增程自2023年起已不再享受）。条件：上海户籍或居住证+48月内累计36月社保+名下无绿牌+无燃油拍牌额度。纯电MPV省~10万沪牌费。2027年后政策不确定——越早买越稳。" },
        { name: "购置税减免", role: "又省1-1.5万", summary: "2026-2027年：新能源车购置税减半，每辆减免上限1.5万元。30万车省1.33万；40万+车省1.5万(封顶)。2028年起恢复全额征收。买车趁现在。" }
      ],
      body: `
<h2>上海购车政策：纯电MPV最划算的窗口期</h2>
<p>上海绿牌政策和购置税减免叠加，在上海买纯电MPV光是这两项就能省下10-12万元。但政策有截止日期——2026年底前是确定的窗口期。<strong>注意：插混/增程自2023年起已不再享受免费绿牌，仅纯电和燃料电池车可免费申领。</strong></p>

<h3>一、免费绿牌（至2026.12.31）</h3>
<table>
  <thead><tr><th>条件</th><th>要求</th><th>备注</th></tr></thead>
  <tbody>
    <tr><td>户籍/社保</td><td>上海户籍 或 居住证+48月内累计缴纳36月社保</td><td>累计制，非连续要求</td></tr>
    <tr><td>名下车辆</td><td>无新能源绿牌车 + 无燃油拍牌额度 + 无沪牌燃油车(沪C除外)</td><td>三无条件需同时满足</td></tr>
    <tr><td>以旧换新</td><td>名下已有绿牌车→报废/过户→以旧换新买纯电新车→可再申领</td><td>2026年新增的通道</td></tr>
    <tr class="rating-s"><td><strong>车辆类型</strong></td><td><strong>仅纯电 + 燃料电池</strong></td><td><strong>⚠️ 插混/增程自2023年起不再享受！</strong></td></tr>
    <tr><td>申请方式</td><td>「一网通办」线上申请</td><td>购车后即可上牌</td></tr>
    <tr><td><strong>节省金额</strong></td><td><strong>~10万元(仅纯电)</strong></td><td><strong>沪牌拍卖均价~10万+</strong></td></tr>
  </tbody>
</table>

<h3>二、购置税减免（2026-2027）</h3>
<table>
  <thead><tr><th>车价(万元)</th><th>正常购置税</th><th>减半后实付</th><th>节省金额</th></tr></thead>
  <tbody>
    <tr><td>18万(星海V9)</td><td>~1.59万</td><td>~0.80万</td><td>0.80万</td></tr>
    <tr><td>30万(X9增程/岚图)</td><td>~2.65万</td><td>~1.33万</td><td>1.33万</td></tr>
    <tr><td>36万(D9/X9纯电)</td><td>~3.19万</td><td>~1.69万</td><td>1.5万(封顶)</td></tr>
    <tr><td>41万(极氪009)</td><td>~3.63万</td><td>~2.13万</td><td>1.5万(封顶)</td></tr>
    <tr><td>53万(理想MEGA)</td><td>~4.69万</td><td>~3.19万</td><td>1.5万(封顶)</td></tr>
  </tbody>
</table>

<h3>三、综合省钱总账</h3>
<table>
  <thead><tr><th>省钱项</th><th>金额</th><th>截止时间</th></tr></thead>
  <tbody>
    <tr class="rating-s"><td>免费绿牌(仅纯电/燃料电池)</td><td>~10万元</td><td>2026.12.31</td></tr>
    <tr class="rating-a"><td>购置税减半</td><td>0.8-1.5万元</td><td>2027.12.31</td></tr>
    <tr class="rating-a"><td>各品牌限时权益(置换/保险补贴等)</td><td>2-8万元</td><td>随时变动</td></tr>
    <tr class="rating-s"><td><strong>合计可省(纯电)</strong></td><td><strong>13-19.5万元</strong></td><td><strong>尽早下手</strong></td></tr>
  </tbody>
</table>

<div class="callout"><strong>关键提醒：</strong>① <strong>上海免费绿牌仅限纯电/燃料电池，插混/增程自2023年起已不享受</strong>——买增程/插混MPV需自行拍沪牌(~10万)或上外地牌。② 2027年绿牌政策是否延续尚未确定——趁2026年买纯电最稳。③ 购置税2028年恢复全额——40万的车多交1.5万。④ 各品牌限时权益经常调整，下定前一定和销售确认最新方案。⑤ 上海居住证+48月内累计36月社保是硬门槛，不满足的提前规划。</div>
`
    },
  },

  concepts: {
    "刀片电池": {
      name: "刀片电池（比亚迪独供）",
      role: "电池架构",
      summary: "安全+成本王者。针刺不起火、成本低30-40%、闪充极寒仅多3min。但能量密度比三元低30%。",
      definition: "<h3>优点（买它的理由）</h3><ul><li><strong>安全性天花板</strong>：磷酸铁锂体系，针刺实验不起火不冒烟，热失控门槛 500°C+（三元锂仅 200°C+）</li><li><strong>成本低 30-40%</strong>：LFP 成本 600-800 元/kWh vs 三元锂 800-1200 元/kWh，D9 115kWh 电池成本约 7-9 万（三元同容量要 10-14 万）</li><li><strong>循环寿命长</strong>：3000+ 次循环 vs 三元锂 1500-2000 次，按每周充 2 次算可用 28 年</li><li><strong>闪充极寒表现全场最佳</strong>：-30°C 充电仅比常温多 3 分钟（三元锂差距更大），10%-70% 常温仅 5 分钟</li><li><strong>垂直整合供应链</strong>：弗迪电池是比亚迪全资子公司，不受第三方供应商卡脖子</li></ul><h3>缺点（劝退的地方）</h3><ul><li><strong>能量密度低约 30%</strong>：装同样 115kWh 需要更大更重的电池包，D9 整备质量 2900kg+（比极氪009重约 100kg）</li><li><strong>低温续航衰减明显</strong>：-20°C 续航打 7 折（三元锂打 75 折），800km 标称冬季高速实跑约 500km</li><li><strong>不透明的电压平台</strong>：比亚迪闪充不公布电压架构，无法与行业标准充电桩功率直接对比</li><li><strong>仅供比亚迪系</strong>：锁定单一供应商，其他品牌无法受益</li></ul>",
      examples: `<h3>关键数据</h3><ul><li>D9 纯电版：115 kWh，800 km，10→97% 仅 9 min</li><li>D9 插混版：66.5 kWh，401 km 纯电（是同级插混 2-3 倍电量）</li><li>电池成本占整车约 20-25%（比三元锂方案低 3-5 万元）</li><li>66.5 kWh 插混电池成本 ≈ 4-5 万元，115 kWh 纯电 ≈ 7-9 万元</li></ul>`,
      related: ["磷酸铁锂", "CTP技术", "热管理系统"],
      usedIn: ["battery"],
      sources: [
        { label: "电池网：第二代腾势D9电池技术解读", url: "https://www.itdcw.com/news/qiye/042Q553052026.html" },
        { label: "BitAuto：第二代D9的钱花在哪了？", url: "https://www.bitauto.com/article/1003108732950/" }
      ]
    },
    "麒麟电池": {
      name: "麒麟电池（宁德时代旗舰）",
      role: "电池产品线",
      summary: "充电速度+能量密度双冠。6C/10min补510km，255Wh/kg。但贵、仅供少数品牌。",
      definition: "<h3>优点（买它的理由）</h3><ul><li><strong>充电速度行业第一</strong>：6C 版（极氪009）峰值 705kW，10 min 补 510km；5C 版（MEGA）8 min 补 500km</li><li><strong>能量密度最高</strong>：电芯 255 Wh/kg，包体 170 Wh/kg，同体积多装 30% 电量</li><li><strong>电池寿命优异</strong>：极氪009 十万公里长测 SOH 97%+，5C 循环寿命比 2C 三元还多 50%</li><li><strong>双大面水冷</strong>：换热面积是传统方案 4 倍，5 分钟热启动，超充发热量被迅速带走</li><li><strong>定制化服务</strong>：为理想专建超级产线（一秒一电芯），为极氪定制 900V/6C 规格</li></ul><h3>缺点（劝退的地方）</h3><ul><li><strong>成本高</strong>：三元锂 1000+ 元/kWh，115kWh 电池成本约 10-14 万（比刀片贵 3-5 万）</li><li><strong>仅供极少品牌</strong>：目前 MPV 仅极氪009 和理想MEGA 搭载，供应排他性强</li><li><strong>低温仍有衰减</strong>：-20°C 续航打 75 折（比 LFP 好但仍明显），720km 冬季高速实跑约 530km</li><li><strong>热失控风险比 LFP 高</strong>：三元体系天然热稳定性不如磷酸铁锂，安全完全依赖热管理系统</li></ul>",
      examples: `<h3>关键数据对比</h3><ul><li>麒麟 6C（极氪009 四驱）：115 kWh / 900V / 705kW / 10min 补 510km / 720km</li><li>麒麟 5C（理想MEGA）：102.7 kWh / 800V / 520kW / 8min 补 500km / 710km / 15.9kWh百公里电耗</li><li>MEGA 单体失效率：PPB 级（十亿分之一），每颗电芯可追溯 20 年超 1 万项数据</li><li>理想与宁德时代联合研发耗时 3 年，宁德时代为 MEGA 专建「灯塔工厂」产线</li></ul>`,
      related: ["三元锂电池", "CTP技术", "C倍率", "800V高压平台"],
      usedIn: ["battery"],
      sources: [
        { label: "腾讯新闻：解码理想-宁德时代麒麟5C电池", url: "https://news.qq.com/rain/a/20240305A05GI100" },
        { label: "太平洋汽车：焕新极氪009 900V架构", url: "https://www.pcauto.com.cn/nation/5143/51432951.html" }
      ]
    },
    "磷酸铁锂": {
      name: "磷酸铁锂 (LFP) — 安全派",
      role: "化学体系",
      summary: "安全+便宜+耐用。但体积大、冬天衰减严重。MPV中的主力低价/增程方案。",
      definition: "<h3>优点</h3><ul><li><strong>安全性最好</strong>：热分解温度 500°C+（三元锂仅 200°C+），针刺/过充不易热失控</li><li><strong>成本低 30-40%</strong>：600-800 元/kWh，100kWh 电池包省 2-4 万元</li><li><strong>超长循环寿命</strong>：3000+ 次 vs 三元锂 1500-2000 次</li><li><strong>现在也能 5C 超充了</strong>：小鹏X9 增程版是行业首款 LFP 5C 超充电池（中创新航）</li></ul><h3>缺点</h3><ul><li><strong>能量密度低</strong>：135-180 Wh/kg，同样 100kWh 电池包体积大 15-20%、重约 50-80kg</li><li><strong>冬天续航打骨折</strong>：-20°C 衰减 30-40%（最严重的化学体系），800km 标称冬天高速可能只跑 500km</li><li><strong>低温充电慢</strong>：需要先加热电池才能快充，冬天充电等待时间可能翻倍</li></ul>",
      examples: `<h3>MPV 市场谁在用 LFP？</h3><ul><li><strong>腾势D9</strong>：第二代刀片（LMFP 升级版），115/66.5 kWh</li><li><strong>小鹏X9 标准续航</strong>：中创新航 140Ah LFP，~94.8 kWh</li><li><strong>小鹏X9 增程</strong>：中创新航 117Ah LFP 5C，63.3 kWh（行业首个 LFP 5C）</li><li><strong>合创V09 620版</strong>：中创新航 LFP，95.16 kWh（不支持超充）</li><li><strong>星海V9 长续航</strong>：34.9 kWh LFP（常规充电）</li></ul><p><strong>结论：</strong>如果你家有充电桩、不常跑冬季高速长途，LFP 方案省钱省心。如果在北方冬天频繁跑高速，建议选三元锂。</p>`,
      related: ["刀片电池", "三元锂电池", "CTP技术"],
      usedIn: ["battery"]
    },
    "三元锂电池": {
      name: "三元锂电池 (NCM) — 性能派",
      role: "化学体系",
      summary: "能量密度高+低温好+超充快。但贵、安全性依赖热管理。超充旗舰标配。",
      definition: "<h3>优点</h3><ul><li><strong>能量密度高 30%</strong>：200-260 Wh/kg，同底盘多装 30% 电量（极氪009 装 115kWh 还能保持合理重量）</li><li><strong>低温衰减小</strong>：-20°C 仅衰减 15-25%（LFP 衰减 30-40%），冬季高速差距 50-80km</li><li><strong>天然支持高倍率充电</strong>：锂离子在三元材料中迁移更快，更容易实现 5C/6C</li></ul><h3>缺点</h3><ul><li><strong>贵 30-40%</strong>：800-1200 元/kWh，115kWh 电池成本 10-14 万元</li><li><strong>安全性依赖热管理</strong>：热失控门槛低（200°C+ 即开始分解），必须有优秀的冷却系统</li><li><strong>循环寿命短 30-40%</strong>：1500-2000 次 vs LFP 3000+ 次</li><li><strong>钴资源争议</strong>：NCM 中的钴主要产自刚果(金)，供应链有伦理和地缘风险</li></ul>",
      examples: `<h3>MPV 市场谁在用三元锂？</h3><ul><li><strong>极氪009</strong>：麒麟 6C 三元锂，115/108 kWh — MPV 充电最快</li><li><strong>理想MEGA</strong>：麒麟 5C 三元锂，102.7 kWh，255 Wh/kg — MPV 能量密度最高</li><li><strong>岚图梦想家</strong>：三元锂，PHEV 62.5 kWh（5C）/ EV 108.7 kWh（常规）</li><li><strong>合创V09 超充版</strong>：巨湾 XFC 三元锂，114.19 kWh，4C</li><li><strong>别克GL8 PHEV</strong>：正力新能三元锂，34.8 kWh（5C，186kW）</li><li><strong>小鹏X9 长续航</strong>：中创新航三元锂 159Ah，~105 kWh</li></ul><p><strong>结论：</strong>如果你要超充体验+长续航+冬季不怂，选三元锂。多花的 3-5 万在充电速度和冬季续航上能回本。</p>`,
      related: ["磷酸铁锂", "麒麟电池", "800V高压平台"],
      usedIn: ["battery"]
    },
    "800V高压平台": {
      name: "800V/900V 高压平台",
      role: "超充必备硬件",
      summary: "有它才能跑满超充桩。900V=705kW极限，800V=320-520kW，没有=最多186kW。",
      definition: "<h3>为什么重要？</h3><p>P = U × I。电压从 400V 升到 800V，同功率下电流减半，线缆发热降 75%。这意味着：</p><ul><li>充电功率天花板从 ~200kW 提升到 500-700kW</li><li>线缆可以做更细更轻（降本降重）</li><li>电机效率提升 3-5%（SiC 器件在高压下效率更高）</li></ul><h3>有 vs 没有的差距（实际数据）</h3><ul><li><strong>有 900V</strong>：极氪009 四驱，705kW，10→80% = 10 min</li><li><strong>有 800V</strong>：理想MEGA 520kW / 小鹏X9 / 岚图PHEV 320kW / 合创V09 410kW</li><li><strong>没有</strong>：别克GL8 最高 186kW(15min 30→80%)、星海V9 常规(18min+)、岚图EV 158kW(30min)</li></ul><h3>买车人的坑</h3><ul><li>有 800V 但没对应超充桩 = 白搭（极氪超充站少、合创几乎没有自建站）</li><li>理想 3900+ 超充站覆盖最广，比亚迪闪充站最密，极氪/小鹏在建</li><li><strong>你的充电场景决定 800V 值不值：</strong>家充为主 → 意义不大；高速长途多 → 必须有</li></ul>",
      examples: `<h3>各车型充电桩生态对比</h3><ul><li>理想超充站：4088+ 站，覆盖 280+ 城市（最广）</li><li>比亚迪闪充站：依托比亚迪经销商网络，城市密度最高</li><li>极氪超充站：在建中，当前覆盖不如理想/比亚迪（车主吐槽点）</li><li>小鹏超充站：3600+ 站，覆盖 430+ 城市（大湾区县县通）</li><li>合创/岚图：几乎无自建超充，依赖第三方充电桩</li></ul>`,
      related: ["C倍率", "三元锂电池", "热管理系统"],
      usedIn: ["battery"]
    },
    "C倍率": {
      name: "C 倍率 — 充电速度排行",
      role: "充电指标",
      summary: "MPV实际排行：极氪6C(10min/510km) > MEGA 5C(8min/500km) > D9闪充(5min/70%) > X9 5C(12min/313km) > V09 4C > 其余30min+",
      definition: "<h3>简单理解</h3><p>1C = 1 小时充满，6C = 10 分钟充满。数字越大越快。但实际不能只看标称 C 倍率：</p><h3>标称 vs 实际（坑在这里）</h3><ul><li><strong>极氪009 6C</strong>：标称 6C，实测 705kW 峰值可持续，10min 真能补 510km — <strong>名副其实</strong></li><li><strong>理想MEGA 5C</strong>：标称 5C，实测 520kW 峰值，8min 补 500km — <strong>名副其实，电耗最低所以补的里程多</strong></li><li><strong>小鹏X9 5C</strong>：标称 5C，但实测 10min 补 313km（增程版，63.3kWh 小电池，功率受限）</li><li><strong>岚图PHEV 5C</strong>：标称 5C，但峰值仅 320kW（受混动架构限制），12min 20→80%</li><li><strong>别克GL8 5C</strong>：标称 5C，但电池仅 34.8kWh，峰值 186kW，15min 30→80%</li></ul><h3>结论</h3><p>C 倍率 × 电池容量 × 电压平台 = 实际充电体验。单看 C 倍率会被误导——5C 的别克和 5C 的理想完全不是一个级别。</p>",
      examples: `<h3>实际充电体验排行（按 10→80% 耗时）</h3><ul><li>第一梯队（10 min 内）：腾势D9 闪充(5min/10→70%) ≈ 理想MEGA(8min) ≈ 极氪009(10min)</li><li>第二梯队（10-15 min）：小鹏X9(12min) ≈ 岚图PHEV(12min) ≈ 合创V09超充(10min) ≈ 别克GL8(15min)</li><li>第三梯队（15+ min）：星海V9(18min) ≈ 岚图EV(30min) ≈ 合创620(30min)</li></ul>`,
      related: ["800V高压平台", "麒麟电池", "热管理系统"],
      usedIn: ["battery"]
    },
    "CTP技术": {
      name: "CTP — 让 MPV 终于装得下 100kWh+",
      role: "封装工艺",
      summary: "体积利用率从40%→72%，让D9/009装下115kWh。没有CTP，MPV续航只有500km出头。",
      definition: "<h3>CTP 解决了什么问题？</h3><p>传统电池：电芯→模组→电池包，模组壳体/连接件占掉 40-60% 的空间。MPV 底盘虽大但高度有限（要保证离地间隙），传统封装下只能装 70-80kWh，续航不到 600km。</p><h3>CTP 的实际效果</h3><ul><li>体积利用率：40-55% → 60-72%（同底盘多装 30-50% 电量）</li><li>腾势D9 凭 CTP 装下 115kWh（同级最大），实现 800km 续航</li><li>极氪009 凭 CTP 3.0 装下 115kWh + 900V 全栈</li><li>理想MEGA 凭 CTP 3.0 装下 102.7kWh，百公里电耗仅 15.9kWh（MPV 最省）</li></ul><h3>不同代次的差距</h3><ul><li><strong>CTP 2.0（刀片电池）</strong>：无模组，电芯既是结构件也是储能件。优势是简单可靠。</li><li><strong>CTP 3.0（麒麟电池）</strong>：在 2.0 基础上增加双大面水冷夹层，换热面积 4 倍。优势是支持更高充电倍率。</li></ul>",
      examples: `<h3>如果没有 CTP 技术</h3><p>按传统模组封装，MPV 底盘大约只能装 70-80kWh，续航约 500-550km（CLTC），冬季高速实跑 350-400km。这意味着：</p><ul><li>北京→上海 1300km 需要充电 3-4 次（现在 CTP 大电池仅需 1-2 次）</li><li>纯电 MPV 无法作为长途家用车（这正是 2022 年之前纯电 MPV 不受欢迎的原因）</li></ul>`,
      related: ["刀片电池", "麒麟电池"],
      usedIn: ["battery"]
    },
    "双叉臂悬架": {
      name: "双叉臂 vs 麦弗逊 — 前悬架就是底盘天花板",
      role: "悬架结构",
      summary: "双叉臂：极氪009/小鹏X9/理想MEGA/岚图=操控极限高、侧倾小、弯道稳。麦弗逊：腾势D9/别克GL8/合创V09/传祺E9/星海V9=省空间省成本但支撑差。买MPV看悬架=看厂家有没有诚意。",
      definition: "<h3>优点（双叉臂）</h3><ul><li><strong>侧倾抑制好 30-50%</strong>：上下两个叉臂让车轮运动轨迹精准，弯道时轮胎接地面积变化小 → 过弯更稳</li><li><strong>极限操控高</strong>：麋鹿测试成绩普遍比麦弗逊高 5-10km/h（岚图梦想家78km/h稳定通过）</li><li><strong>舒适性也更好</strong>：双叉臂可以把减震行程做得更长，过大坑不容易触底</li><li><strong>兼容空气悬架更好</strong>：结构空间大，空气弹簧+CDC 的集成更顺畅</li></ul><h3>缺点（双叉臂）</h3><ul><li><strong>占空间大</strong>：前悬需要更多横向空间，影响发动机舱布置（纯电平台不是问题）</li><li><strong>成本高 30-50%</strong>：零件多（4-6 根控制臂 vs 麦弗逊仅1根下摆臂），制造精度要求高</li><li><strong>维修贵</strong>：一个控制臂损坏维修费 2000-5000 元（麦弗逊仅 500-1500 元）</li></ul><h3>为什么腾势D9用麦弗逊？</h3><p>D9 是油改电平台（最初有燃油版），麦弗逊前悬可以省空间给发动机。虽然第二代已无燃油版，但底盘架构未改。云辇-C 通过软件弥补了部分差距，但硬件天花板低于双叉臂。</p>",
      examples: `<h3>MPV 前悬架配置清单</h3><ul><li><strong>双叉臂阵营</strong>：极氪009 ✅ | 小鹏X9 ✅ | 理想MEGA ✅ | 岚图梦想家 ✅ | 翼真L380(双球节变体) ≈</li><li><strong>麦弗逊阵营</strong>：腾势D9 ⚠️ | 合创V09 ⚠️ | 传祺E9 ⚠️ | 别克GL8 ⚠️ | 星海V9 ⚠️</li></ul><p>30万以上MPV还用麦弗逊 = 底盘诚意不足。</p>`,
      related: ["空气悬架", "CDC减震器", "后轮转向"],
      usedIn: ["chassis"],
      sources: [
        { label: "汽车之家：三款MPV底盘滤震实测", url: "https://chejiahao.autohome.com.cn/info/20425643" },
        { label: "BitAuto：岚图梦想家 vs 腾势D9 底盘对比", url: "https://www.bitauto.com/article/1003101417570/" }
      ]
    },
    "后轮转向": {
      name: "后轮转向 — 5m大车掉头的唯一解法",
      role: "操控硬件",
      summary: "有后转=天堂，没有=地库噩梦。小鹏X9(5.4m转弯/全系标配)和2026岚图(5.9m/蟹行模式)是唯二配备的MPV。极氪/理想/D9/GL8全部没有。",
      definition: "<h3>优点（有后轮转向）</h3><ul><li><strong>转弯半径缩小 0.5-1m</strong>：小鹏X9 车长5293mm → 转弯半径仅5.4m（比很多A级轿车还小！）</li><li><strong>地下车库不再噩梦</strong>：老旧地库90°弯、窄道掉头，有后转向一把过，无后转向来回揉3-4把</li><li><strong>高速更稳</strong>：>60km/h后轮同向转，等效加长轴距，高速变道更稳定</li><li><strong>岚图独家蟹行模式</strong>：前后轮同向偏转实现横向平移，侧方停车/避障极端灵活</li></ul><h3>缺点（后轮转向）</h3><ul><li><strong>成本高 1-2 万</strong>：采埃孚后转向系统成本约 8000-15000 元，推高整车售价</li><li><strong>侵占后排空间</strong>：理想MEGA 明确表示「考虑过但放弃，要守第三排空间」</li><li><strong>维修复杂</strong>：额外一套转向机构，保养/维修成本增加</li><li><strong>低速异响风险</strong>：部分车主反馈低速转向时偶有机械声</li></ul>",
      examples: `<h3>后轮转向 MPV 实测数据</h3><ul><li><strong>小鹏X9</strong>：±5° 后轮转角，转弯直径 10.8m (半径5.4m)，采埃孚最新一代，全球唯一全系标配后轮转向的 MPV</li><li><strong>岚图梦想家(2026)</strong>：±5° 后轮转角，转弯半径 5.9m，独家蟹行模式。麋鹿测试 78km/h 稳定通过</li><li><strong>理想MEGA</strong>：无后轮转向，用软件锁死同侧车轮缩小转弯半径 → 6.35m（效果有限）</li></ul><p><strong>车主真实反馈</strong>："5.3米大车转弯半径5.4米，地下车库随便钻" — 小鹏社区车主</p><p>"5米35没后转向，市区真的痛苦" — 理想MEGA 懂车帝评测</p>`,
      related: ["双叉臂悬架", "空气悬架"],
      usedIn: ["chassis"],
      sources: [
        { label: "车质网：小鹏X9全球唯一标配后轮转向MPV", url: "https://www.12365auto.com/news/20240301/523035.shtml" },
        { label: "新华网：2026岚图梦想家全球首搭智能后轮转向", url: "http://www.news.cn/auto/20250915/c4b21c920ddf46798ba0a03672f01e2c/c.html" },
        { label: "36氪：理想MEGA vs 小鹏X9后轮转向对比", url: "https://auto-time.36kr.com/p/2674684999464452" }
      ]
    },
    "空气悬架": {
      name: "空气悬架 — 双腔 vs 单腔 vs 没有，差距巨大",
      role: "悬架配置",
      summary: "双腔空悬(极氪/X9/MEGA/岚图)：可调高低+软硬，过减速带不弹人，上下车自动降低。云辇-C(D9)：只能调软硬不能调高度。无空悬(GL8/V09/星海)：硬过所有坑。",
      definition: "<h3>三种配置的真实差距</h3><h4>1. 双腔空气悬架（极氪009/小鹏X9/理想MEGA/岚图梦想家/翼真L380）</h4><ul><li><strong>优点</strong>：可调高低（40-90mm行程）+ 可调软硬，上下车自动降低便于老人孩子，高速自动降低减风阻，过烂路升高防托底</li><li><strong>优点</strong>：双腔比单腔多一个气室，低压走柔软路线（城市舒适），高压切换硬朗（高速/运动），一车两用</li><li><strong>缺点</strong>：气囊寿命 8-12 万公里可能漏气（换一个 5000-15000 元），极端低温可能僵硬</li></ul><h4>2. CDC无空悬（腾势D9 云辇-C / 传祺E9 高配）</h4><ul><li><strong>优点</strong>：可调软硬（CDC每秒数百次调节），云辇-C有路面预瞄能力，比纯被动好一大截</li><li><strong>缺点</strong>：<strong>不能调高度</strong> → 深坑无法「抬过去」，上下车无法降低车身。腾势D9用麦弗逊+无空悬=硬件天花板低</li><li><strong>实测差距</strong>：过连续减速带，有空悬的车「飘过去」，D9 虽然柔化但仍有明显起伏感</li></ul><h4>3. 纯被动减震（别克GL8 / 合创V09 / 星海V9）</h4><ul><li><strong>特点</strong>：弹簧+减震器硬件固定不可调，只能靠工厂调校一次定终身</li><li><strong>缺点</strong>：无法适应不同路况，城市嫌硬 or 高速嫌软，二选一。GL8连续起伏余振多，三排颠簸明显</li></ul>",
      examples: `<h3>空气悬架配置与价格</h3><ul><li>极氪009：闭式双腔空悬 — 全系标配（41.38万起）</li><li>小鹏X9：双腔空悬(90mm调节) — 全系标配（30.98万起/增程）</li><li>理想MEGA：双腔空悬 — 全系标配（52.98万起）</li><li>岚图梦想家：魔毯空悬(60mm) — 全系标配（32.99万起）</li><li>翼真L380：空悬+CDC — 除入门款标配（29.99万起/入门无空悬）</li><li>腾势D9：<strong>无空悬</strong>，仅云辇-C阻尼调节（33.98万起）</li><li>别克GL8/合创V09/星海V9/传祺E9基础版：<strong>无空悬无CDC</strong></li></ul><p><strong>注意</strong>：小鹏X9 增程30.98万就全系标配双腔空悬+后轮转向，而腾势D9 33.98万起连空悬都没有。底盘硬件配置差距是价格无法掩盖的。</p>`,
      related: ["双叉臂悬架", "CDC减震器", "防晕车技术"],
      usedIn: ["chassis"],
      sources: [
        { label: "有驾：第二代腾势D9云辇-C实测", url: "https://www.yoojia.com/article/9751315026077269731.html" },
        { label: "太平洋汽车：焕新极氪009闭式双腔空悬详解", url: "https://www.pcauto.com.cn/nation/5143/51432951.html" },
        { label: "小鹏官网：X9底盘参数", url: "https://www.xiaopeng.com/x9_2026.html" }
      ]
    },
    "CDC减震器": {
      name: "CDC — 每秒调几百次的智能减震器",
      role: "电控阻尼",
      summary: "CDC=连续可变阻尼减震。有CDC：城市柔软(过滤颠簸)+高速坚硬(抑制侧倾)，一车两性格。无CDC：工厂调一次用到报废。云辇-C本质是高级CDC(有预瞄)但没有空气弹簧。",
      definition: "<h3>优点</h3><ul><li><strong>一车两性格</strong>：城市模式阻尼软（过滤井盖/减速带），运动模式阻尼硬（弯道/高速更稳）</li><li><strong>反应极快</strong>：每秒调节 100-1000 次（人体感知约 0.1 秒，CDC 在 0.01 秒内完成），过坑前就已调好</li><li><strong>配合空悬效果翻倍</strong>：空气弹簧调高低 + CDC 调软硬 = 完整的底盘自适应系统</li><li><strong>路面预瞄（高阶）</strong>：云辇-C/小鹏AI底盘/岚图魔毯 用摄像头提前扫描路面 → 预调阻尼</li></ul><h3>缺点</h3><ul><li><strong>没有空气弹簧=半残</strong>：CDC 只管「软硬」，不管「高低」。腾势D9有CDC无空悬 → 过深坑仍然托底</li><li><strong>故障成本高</strong>：电控减震器一根坏了换原厂 3000-8000 元（被动减震器 500-1500 元）</li><li><strong>调校差距大</strong>：同样是CDC，调校好的（极氪/岚图）和调校差的体验天壤之别</li></ul><h3>各家 CDC 技术对比</h3><ul><li><strong>极氪009</strong>：双阀CCD电磁减振 — 压缩/回弹独立调节，同级唯一</li><li><strong>小鹏X9</strong>：AI底盘CDC — 每秒1000次扫描/200次调节，8-15m预瞄</li><li><strong>岚图梦想家</strong>：CDC+魔毯 — 每秒100次监测，150m预瞄</li><li><strong>腾势D9</strong>：云辇-C — 50+传感器/每秒千次扫描/预瞄2.0(150m)，但无空悬</li><li><strong>翼真L380</strong>：CDC连续可调 — 配合空悬，效果好但调校保守</li></ul>",
      examples: `<h3>有CDC vs 无CDC 的体感差异</h3><ul><li><strong>过减速带</strong>：有CDC(如X9)="一下就过去了没感觉"；无CDC(如GL8)="弹一下，三排再弹一下"</li><li><strong>高速变道</strong>：有CDC自动变硬→侧倾小；无CDC→车身晃1-2秒才稳</li><li><strong>连续烂路</strong>：有CDC+预瞄(如云辇)="浑然不觉"；无CDC="颠得脑袋撞车顶"（夸张但GL8三排真实反馈）</li></ul>`,
      related: ["空气悬架", "双叉臂悬架", "防晕车技术"],
      usedIn: ["chassis"],
      sources: [
        { label: "有驾：云辇-C侧倾角速度降低39.7%实测数据", url: "https://www.yoojia.com/article/9751315026077269731.html" },
        { label: "腾讯新闻：小鹏X9 AI底盘每秒1000次路况扫描", url: "https://news.qq.com/rain/a/20250417A047IL00" }
      ]
    },
    "防晕车技术": {
      name: "防晕车 — MPV 家庭用户的第一诉求",
      role: "核心体验",
      summary: "排行：极氪009(智能恒稳/150km/h过11级风)≈小鹏X9(6D防晕算法/1000Hz扫描/300ms预判) > 腾势D9(云辇预瞄/隔振率96%) ≈ 岚图(魔毯预瞄) > MEGA(魔毯3.0偶有船感) > 其余(无主动防晕/坐后排看运气)。",
      definition: "<h3>为什么 MPV 特别需要防晕车？</h3><p>MPV 车身长(5m+)/重心高/二三排离前轴远 → 天生比轿车更容易晕车。尤其二三排乘客：加减速俯仰感+转弯侧倾感+路面颠簸叠加 = 非常容易晕。</p><h3>各品牌防晕车技术（从好到差）</h3><ul><li><strong>极氪009 — 智能恒稳防晕</strong>：定海中枢打通底盘/制动/转向/智驾四大系统，从根源降低晕车诱因。150km/h通过11级风区仍能智能防横风。双阀CCD压缩/回弹独立调节=最精细的振动控制。<br><em>优点：硬件天花板最高，长途最不晕</em><br><em>缺点：需要选装高配</em></li><li><strong>小鹏X9 — 6D防晕车算法</strong>：AI底盘每秒1000次路况扫描，提前300ms预判+0.5s提前预判颠簸路段。6维度(俯仰/侧倾/升沉/横摆/纵移/横移)全方位抑制。爆胎响应200ms。<br><em>优点：算法最激进，车主反馈「我妈第一次坐电车没晕」</em><br><em>缺点：底盘厚重感不如极氪</em></li><li><strong>腾势D9 — 云辇预瞄2.0</strong>：50+传感器/每秒千次扫描/150m路面预瞄/隔振率96%/侧倾角速度降低39.7%。<br><em>优点：预瞄距离同级最长(150m)，日常城市够用</em><br><em>缺点：无空悬+麦弗逊=硬件上限低，极端路况仍颠</em></li><li><strong>岚图梦想家 — 魔毯预瞄</strong>：摄像头提前扫描路面+CDC自动调节+空悬高度调节三重联动。<br><em>优点：空悬+双叉臂硬件基础好</em><br><em>缺点：算法迭代不如小鹏快</em></li><li><strong>理想MEGA — 魔毯3.0</strong>：双腔空悬+CDC，悬架调校偏柔和。<br><em>优点：大部分路况舒适</em><br><em>缺点：连续起伏路段偶有「船感」，对细小振动过滤不够彻底</em></li><li><strong>其余车型</strong>：无主动防晕车技术，纯靠被动减震调校 → 晕不晕看路况和运气</li></ul>",
      examples: `<h3>车主防晕车真实反馈</h3><ul><li>"孩子坐后面全程安睡" — 极氪009 车主（新浪汽车）</li><li>"6D防晕车名不虚传，我妈第一次坐电车没晕" — 小鹏X9 车主</li><li>"云辇底盘确实稳，过坑压井盖很干脆" — 腾势D9 车主（虎扑）</li><li>"底盘质感真的好，走烂路完全不传到车内" — 岚图梦想家车主</li><li>"第三排坐久了还是会晕，减速带弹两下" — 别克GL8 车主</li></ul><p><strong>选购建议：</strong>如果家里有晕车的老人/孩子，这是最重要的指标。极氪009和小鹏X9是第一选择。</p>`,
      related: ["空气悬架", "CDC减震器", "双叉臂悬架"],
      usedIn: ["chassis"],
      sources: [
        { label: "新浪财经：焕新极氪009智能恒稳防晕系统", url: "https://finance.sina.com.cn/roll/2026-05-20/doc-inhypxki6928624.shtml" },
        { label: "腾讯新闻：小鹏X9 6D防晕车+AI底盘", url: "https://news.qq.com/rain/a/20250417A047IL00" },
        { label: "有驾：腾势D9云辇-C隔振率96%实测", url: "https://www.yoojia.com/article/9751315026077269731.html" }
      ]
    },
    "座舱芯片": {
      name: "座舱芯片 — 8295 vs 8155差距巨大",
      role: "车机流畅度基础",
      summary: "双8295(极氪009/最流畅) > 8295P(小鹏/腾势/理想/岚图/旗舰标配) >> 8155(合创/别克/星海/明显卡顿)。8295 AI算力30TOPS是8155(4TOPS)的7.5倍，GPU性能3倍。",
      definition: "<h3>为什么芯片决定车机体验？</h3><ul><li>8295：CPU主频2.1GHz+GPU 3.5TFLOPS，多任务不卡顿</li><li>8155：CPU主频1.8GHz+GPU 1.3TFLOPS，开导航+放视频就卡</li><li>MPV后排经常要同时播放视频+导航+空调调节，低算力扛不住</li></ul><h3>注意</h3><ul><li>「双8295」(极氪009)：一块负责座舱一块负责娱乐，丝滑度碾压单芯片</li><li>8295P带5G(小鹏X9)：OTA升级更快，在线内容加载更流畅</li><li>8155的车(GL8/星海)：用2年后会越来越卡</li></ul>",
      examples: `<h3>实际体验差异</h3><ul><li>8295车机：语音3秒内响应/导航秒开/后排视频+前排导航同时流畅</li><li>8155车机：语音偶尔卡顿/导航偶尔白屏/多任务明显变慢</li></ul>`,
      related: ["音响系统", "后排娱乐屏"],
      usedIn: ["smart-cockpit"],
      sources: [{ label: "BitAuto：极氪009双8295", url: "https://www.bitauto.com/article/1003110097835/" }]
    },
    "音响系统": {
      name: "音响系统 — Naim vs 帝瓦雷 vs 聆境",
      role: "MPV影音核心",
      summary: "极氪009 Naim(31颗/3868W/宾利御用英国顶级) >>> 腾势D9帝瓦雷(30颗/法国顶级) > 小鹏X9聆境AI(27颗/7.1.6声道) > 岚图丹拿(23颗) > 别克BOSE(14颗) >> 星海(无品牌)。",
      definition: "<h3>音响品牌档次</h3><ul><li><strong>Naim(极氪)</strong>：英国国宝级，宾利同源供应商。31颗扬声器+3868W+7.2.7.8全维环绕=小型音乐厅</li><li><strong>帝瓦雷(腾势)</strong>：法国顶级音响。30颗扬声器+剧院级声场。低频震撼</li><li><strong>聆境AI(小鹏)</strong>：自研AI音响。27颗+7.1.6声道+AI自适应音效。无顶级品牌背书但效果很好</li><li><strong>丹拿(岚图)</strong>：丹麦老牌。23颗，中频人声出色</li><li><strong>BOSE(别克)</strong>：14颗，够听但和上面差距明显</li></ul>",
      examples: `<h3>车主反馈</h3><ul><li>「Naim音响一开简直音乐厅，关上门就不想下车」—— 极氪009车主</li><li>「帝瓦雷低频太震撼了」—— 腾势D9车主</li><li>「聆境AI音响比预期好太多，7.1.6声道环绕感很强」—— 小鹏X9车主</li></ul>`,
      related: ["座舱芯片", "后排娱乐屏"],
      usedIn: ["smart-cockpit"],
      sources: [{ label: "新华网：极氪009 Naim殿堂之声", url: "http://www.news.cn/auto/20260424/1d78508a9a9346e19ee40ddf68d54181/c.html" }]
    },
    "后排娱乐屏": {
      name: "后排娱乐屏 — 长途旅行的救星",
      role: "长途乘客体验",
      summary: "小鹏X9(21.4英寸/莱茵护眼/最大) > 极氪009(17英寸3K OLED吸顶屏/画质最好) ≈ 岚图/合创(17.3英寸) > 腾势D9(12.8英寸+后排生态屏) > 别克/星海(无)。",
      definition: "<h3>为什么后排屏重要？</h3><ul><li>MPV后排乘客（小孩/老人）长途看手机→晕车</li><li>后排大屏可以看电影/追剧/打游戏，不用低头看手机</li><li>家庭出行4-5小时，后排有没有娱乐差距巨大</li></ul><h3>关键差异</h3><ul><li>OLED vs LCD：OLED色彩更鲜艳、对比度无限、可视角度更大</li><li>吸顶屏 vs 头枕屏：吸顶屏全车共享，头枕屏各看各的</li><li>莱茵护眼认证(小鹏)：长时间看不伤眼，儿童使用更安心</li></ul>",
      examples: `<h3>使用场景</h3><ul><li>极氪009：17寸3K OLED + Naim音响 = 5D影院模式</li><li>小鹏X9：21.4寸最大屏 + 莱茵护眼 = 儿童长途最佳</li><li>腾势D9：12.8寸后排屏 + 磁吸生态扩展 = 灵活配件</li></ul>`,
      related: ["座舱芯片", "音响系统"],
      usedIn: ["smart-cockpit"],
      sources: [{ label: "BitAuto：极氪009座舱/17寸OLED", url: "https://www.bitauto.com/article/1003110071752/" }]
    },
    "CLTC vs 实测": {
      name: "CLTC续航 ≠ 实际续航",
      role: "续航真相",
      summary: "CLTC标称续航是理想工况，高速实测仅达到70-80%。冬季高速再打7折。700km标称→高速实跑500km→冬季高速350km。买车前一定看实测数据。",
      definition: "<h3>为什么差距这么大？</h3><ul><li>CLTC测试：25°C/不开空调/匀速+怠速/无风阻差异</li><li>实际高速：120km/h(风阻∝速度²)+开空调+满载=能耗翻倍</li><li>冬季额外衰减：电池低温活性降低+PTC加热额外耗电=再打7折</li></ul><h3>实测达成率排名</h3><ul><li>小鹏X9城市：~88%（城市能耗最优）</li><li>理想MEGA高速：76%（风阻0.215最低=高速最省电）</li><li>极氪009高速：~73%（车重+车宽=风阻大）</li></ul>",
      examples: `<h3>具体数据</h3><ul><li>MEGA标称710km→高速507km→冬季高速~355km</li><li>D9 EV标称800km→高速~570km→冬季高速~400km</li><li>X9标称740km→高速~590km→冬季高速~410km</li></ul>`,
      related: ["800V vs 400V", "增程vs纯电vs插混"],
      usedIn: ["range-charging"],
      sources: [{ label: "BitAuto：MPV续航实测对比", url: "https://www.bitauto.com/article/1003110079666/" }]
    },
    "800V vs 400V": {
      name: "800V/900V高压平台 — 充电速度的分水岭",
      role: "充电速度基础",
      summary: "900V 6C(极氪009/10min补510km) > 800V 5C(理想/小鹏/岚图/腾势闪充) >> 400V(老款/充电慢一倍)。800V是2025-2026年旗舰标配，400V已经过时。",
      definition: "<h3>800V vs 400V区别</h3><ul><li>电压越高→同功率下电流越小→线束更细更轻→充电更快</li><li>800V车+高功率桩=10-15分钟充满。400V车+同样桩=25-35分钟</li><li>900V(极氪009)比800V再快15-20%</li></ul><h3>注意</h3><ul><li>800V车必须配800V高功率桩才能发挥全部速度</li><li>用60kW公共慢桩=800V和400V差距不大</li><li>腾势闪充是特殊协议，在自家闪充桩上极速但第三方桩无此优势</li></ul>",
      examples: `<h3>充电实测</h3><ul><li>极氪009(900V/6C)：10→80%仅10分钟=补510km</li><li>腾势D9(闪充)：10→97%仅9分钟(闪充桩)=行业最快</li><li>理想MEGA(800V/5C)：30→80%仅8分钟(5C桩)</li><li>星海V9(400V)：10→80%约30分钟=慢一倍</li></ul>`,
      related: ["CLTC vs 实测", "超充站网络"],
      usedIn: ["range-charging"],
      sources: [{ label: "BitAuto：极氪009 900V架构", url: "https://www.bitauto.com/article/1003110079666/" }]
    },
    "增程vs纯电vs插混": {
      name: "增程/纯电/插混 — 选哪种补能策略？",
      role: "补能策略选择",
      summary: "纯电(最省钱/有充电焦虑) vs 增程(可油可电/无焦虑/高速油耗高) vs 插混(灵活/纯电续航短)。选择取决于：有无家充+通勤距离+长途频率。",
      definition: "<h3>三种路线对比</h3><ul><li><strong>纯电</strong>：月电费50-200元(家充) vs 燃油月油费800-1500元。但没家充/冬季/长途=焦虑</li><li><strong>增程</strong>：日常用电+长途用油，1602km(X9)综合续航彻底无焦虑。但高速亏电油耗6.5-8L</li><li><strong>插混</strong>：最灵活，纯电通勤+混动长途。但纯电续航200-401km差距大(D9 401km >> GL8 200km)</li></ul><h3>选择指南</h3><ul><li>有家充+市区通勤+偶尔长途 → 纯电</li><li>无家充 或 经常长途 → 增程/插混</li><li>完全不想管充电/加油 → 增程最省心</li></ul>",
      examples: `<h3>月度用车成本对比</h3><ul><li>纯电(家充)：月电费~100元 + 保险~800元 = ~900元</li><li>增程(混用)：月电费~50元 + 月油费~300元 + 保险~700元 = ~1050元</li><li>燃油(GL8)：月油费~1200元 + 保险~600元 + 保养~300元 = ~2100元</li></ul>`,
      related: ["CLTC vs 实测", "800V vs 400V", "用车成本"],
      usedIn: ["range-charging"],
      sources: [
        { label: "易车：如何选择纯电与混动MPV", url: "https://news.yiche.com/hao/wenzhang/109804961/" },
        { label: "中关村在线：三款40万MPV对决", url: "https://auto.zol.com.cn/1170/11707352.html" }
      ]
    },
    "零百加速": {
      name: "零百加速 — 3.9s的MPV你敢信？",
      role: "动力直观指标",
      summary: "极氪009双电机3.9s(唯一进4s的MPV) >> MEGA 5.5s > X9四驱5.7s ≈ 岚图5.9s >> 单电机/插混6.9-8s > 星海V9 9.5s(满载爬坡吃力)。",
      definition: "<h3>MPV需要快加速吗？</h3><ul><li>日常通勤：5-8s都无感知差异</li><li>高速超车：6s以内=随心所欲，8s+=需要提前规划</li><li>满载爬坡：7人+行李=3吨+，动力不足直接感知(星海V9 9.5s)</li><li>安全避险：紧急加速避让时，动力储备=安全余量</li></ul><h3>注意</h3><ul><li>3.9s(极氪009双电机)日常几乎用不到，但给信心</li><li>增程版(X9 8s)比纯电版(5.7s)慢是正常的——增程器增加了重量</li><li>别只看零百——MPV更重要的是中段加速(60→120km/h)感受</li></ul>",
      examples: `<h3>实际体验</h3><ul><li>「009的3.9s地板油，后排孩子吓哭了，以后再也不敢全力加速」—— 极氪车主</li><li>「X9增程8秒够用，又不是去赛车，家用够了」—— 小鹏车主</li><li>「星海V9满载上坡确实肉，需要踩很深才有反应」—— 星海车主</li></ul>`,
      related: ["NVH静谧性"],
      usedIn: ["performance"],
      sources: [
        { label: "BitAuto：极氪009 3.9秒破百性能解析", url: "https://www.bitauto.com/article/1003110071522/" },
        { label: "ZOL汽车：MPV NVH静谧性对比", url: "https://auto.zol.com.cn/1184/11844330.html" }
      ]
    },
    "NVH静谧性": {
      name: "NVH静谧性 — 纯电天然比燃油安静",
      role: "乘坐品质核心",
      summary: "极氪009(双层玻璃+电吸门+Naim降噪/<65dB) > 腾势D9(电吸门+隐私声盾+帝瓦雷) > MEGA(0.215风阻/最低风噪) > X9(双层玻璃) >> GL8(发动机噪) > 星海V9(隔音差)。",
      definition: "<h3>NVH三要素</h3><ul><li><strong>N(Noise噪音)</strong>：风噪+路噪+电机噪(纯电) / 发动机噪(混动)</li><li><strong>V(Vibration振动)</strong>：路面传递到车内的颠簸感(空悬车型好很多)</li><li><strong>H(Harshness粗糙感)</strong>：方向盘/踏板/座椅传递的细碎震动</li></ul><h3>为什么MPV特别需要好NVH？</h3><ul><li>后排乘客在车内聊天/休息/看视频→噪音直接影响体验</li><li>老人听力弱→需要更安静才能正常对话</li><li>纯电车没发动机噪但风噪/路噪更明显(因为没有发动机声掩盖)</li></ul>",
      examples: `<h3>车主反馈</h3><ul><li>「极氪009关上门感觉与世隔绝，高速也很安静」—— 车主</li><li>「MEGA的风阻最低=风噪最小，120km/h正常音量说话无压力」—— 车主</li><li>「GL8高速发动机嗡嗡响，和纯电比差距太大了」—— GL8车主</li></ul>`,
      related: ["零百加速", "音响系统"],
      usedIn: ["performance"],
      sources: [{ label: "ZOL：极氪009/威然/腾势D9对比", url: "https://auto.zol.com.cn/1184/11844330.html" }]
    },
    "上海绿牌政策": {
      name: "上海绿牌 — 省下10万沪牌费",
      role: "上海购车核心优惠",
      summary: "至2026.12.31：仅纯电/燃料电池免费上绿牌（插混/增程自2023年起不再享受）。省下~10万元沪牌拍卖费。条件：上海户籍or居住证+48月内累计36月社保+名下无绿牌+无燃油拍牌额度。2027年后不确定——越早买越稳。",
      definition: "<h3>绿牌政策详解</h3><ul><li>上海沪牌拍卖均价约10万元，新能源车免费上绿牌=直接省10万</li><li>纯电/插混/增程都可以——所有MPV车型都符合</li><li>通过「一网通办」线上申请，购车后即可上牌</li></ul><h3>关键限制</h3><ul><li>名下已有一块绿牌的不能再申请——需先过户或报废现有绿牌车</li><li>有未使用的燃油拍牌额度也不行——需先放弃额度</li><li>居住证+48月内累计36月社保是硬门槛——不满足的提前规划</li></ul>",
      examples: `<h3>省钱计算</h3><ul><li>沪牌拍卖：~10万元(2025年均价)</li><li>绿牌：0元</li><li>净省：~10万元</li><li>2027年如果政策不延续→10万元又要掏了</li></ul>`,
      related: ["购置税减免"],
      usedIn: ["shanghai-policy"],
      sources: [
        { label: "上海市人民政府：2026年新能源汽车实施办法", url: "https://www.shanghai.gov.cn/202603bgtwj/20260210/84cb024ac225492f82d4039da1fe320f.html" },
        { label: "上海本地宝：绿牌免费截止时间", url: "http://sh.bendibao.com/zffw/202614/303158.shtm" }
      ]
    },
    "购置税减免": {
      name: "购置税减半 — 又省1-1.5万",
      role: "2026-2027年限时优惠",
      summary: "2026-2027年新能源车购置税减半征收，每辆减免上限1.5万元。30万车省1.33万；40万+车省1.5万(封顶)。2028年恢复全额。",
      definition: "<h3>计算方法</h3><ul><li>购置税 = 车价 ÷ 1.13 × 10%</li><li>减半后实付 = 购置税 × 50%</li><li>减免上限 = 1.5万元(超过1.5万的按1.5万算)</li></ul><h3>各价位减免金额</h3><ul><li>18万(星海V9)：省0.80万</li><li>30万(X9增程)：省1.33万</li><li>36万(D9/X9纯电)：省1.5万(封顶)</li><li>41万(极氪009)：省1.5万(封顶)</li><li>53万(理想MEGA)：省1.5万(封顶)</li></ul>",
      examples: `<h3>时间窗口</h3><ul><li>2026年：减半征收 ✅</li><li>2027年：减半征收 ✅</li><li>2028年起：恢复全额征收 → 40万车多交1.5万</li></ul>`,
      related: ["上海绿牌政策"],
      usedIn: ["shanghai-policy"],
      sources: [
        { label: "财政部：延续和优化新能源汽车车辆购置税减免政策", url: "https://szs.mof.gov.cn/zhengcefabu/202306/t20230620_3891500.htm" },
        { label: "工信部：2026-2027年减免购置税技术要求", url: "https://www.miit.gov.cn/jgsj/zbys/wjfb/art/2025/art_1b43c010cb824f9ab7fedaba2750934d.html" }
      ]
    },
    "车身结构强度": {
      name: "车身结构 — 碰撞时保命的最后一道墙",
      role: "被动安全基础",
      summary: "极氪009(扭转刚度40000N·m/deg/全球MPV最高/2000MPa双A柱) > 腾势D9(36000N·m/deg/75%高强钢/3.2m超长侧气帘) > 小鹏X9(19道环形设计/A柱零变形/C-NCAP 86.6%最高分) > 岚图(31000N·m/deg/超美标追尾110km/h)。",
      definition: "<h3>核心指标</h3><ul><li><strong>扭转刚度</strong>：越高=车身越不容易变形。40000(极氪)>36000(腾势)>31000(岚图)。普通轿车约15000-25000</li><li><strong>高强钢占比</strong>：比例越高防撞越强。75%(腾势/岚图)属优秀</li><li><strong>最高钢材强度</strong>：2000MPa=约20吨力/平方厘米，A柱用这种钢=正碰不变形</li><li><strong>气囊数量</strong>：9个是同级最高标准，必须覆盖三排</li></ul><h3>为什么MPV车身强度更重要？</h3><ul><li>MPV比轿车长1米+重500kg+，碰撞能量按质量×速度²计算，远超轿车</li><li>满载7人，碰撞伤害分散到更多乘客</li><li>三排乘客离后保险杠更近，追尾时更危险</li></ul>",
      examples: `<h3>极端碰撞实测</h3><ul><li>极氪009连环追尾：60km/h撞19吨货车+被55km/h SUV追尾→A/B/C柱零变形/车门正常开启</li><li>岚图梦想家：110km/h追尾测试通过（美标仅要求80km/h）</li><li>小鹏X9：C-NCAP正面碰撞A柱零变形，14项满分</li><li>腾势D9：侧碰电池包未变形，3.2m侧气帘覆盖全部三排</li></ul>`,
      related: ["电池热失控防护", "主动安全AEB/AES", "气囊配置"],
      usedIn: ["crash-safety"],
      sources: [
        { label: "汽车之家：2026高端纯电MPV安全评测", url: "http://chejiahao.autohome.com.cn/info/24879712" },
        { label: "BitAuto：极氪009连环追尾测试", url: "https://www.bitauto.com/article/1003107141838/" }
      ]
    },
    "电池热失控防护": {
      name: "电池热失控 — 新能源车最大的安全焦虑",
      role: "新能源安全核心",
      summary: "比亚迪刀片电池(针刺不起火/热失控门槛500°C+)公认最安全 > 极氪神盾(16项极端测试/十宫格防撞) > 小鹏(24h不起火/IP68/六维电安全) > 岚图琥珀(主动预警) > 三元锂(能量密度高但热失控门槛低)。",
      definition: "<h3>什么是热失控？</h3><ul><li>电池内部温度失控→连锁反应→起火甚至爆炸</li><li>触发原因：碰撞挤压/过充/内部短路/外部高温</li><li>磷酸铁锂(LFP)热失控门槛500°C+ vs 三元锂(NCM)仅200°C+ —— 这就是为什么刀片电池安全性碾压</li></ul><h3>各电池防护技术</h3><ul><li><strong>刀片电池(腾势D9)</strong>：针刺不起火不冒烟。LFP体系天然安全+CTP结构减少连接点</li><li><strong>神盾电池(极氪009)</strong>：16项极端测试(火烧/碰撞/浸水等)全通过。十宫格防撞结构把电池包分隔保护</li><li><strong>小鹏电池</strong>：新国标24h不起火不爆炸+2000J底部抗冲击+六维电安全保护</li><li><strong>三元锂(理想MEGA)</strong>：能量密度高但热稳定性不如LFP。宁德时代CTP技术+优秀热管理弥补</li></ul>",
      examples: `<h3>安全数据</h3><ul><li>刀片电池针刺测试：表面温度仅30-60°C，无烟无火</li><li>三元锂针刺测试：迅速升温至500°C+，剧烈燃烧</li><li>极氪009火灾安全测评：五星满分</li><li>小鹏X9：满足2026年新国标（比现行标准严格3倍）</li></ul>`,
      related: ["车身结构强度", "刀片电池", "麒麟电池"],
      usedIn: ["crash-safety"],
      sources: [
        { label: "小鹏官网：X9获C-NCAP五星", url: "https://www.xiaopeng.com/news/company_news/5367.html" },
        { label: "汽车之家：MPV安全评测报告", url: "http://chejiahao.autohome.com.cn/info/24879712" }
      ]
    },
    "主动安全AEB/AES": {
      name: "AEB/AES — 比你反应更快的安全卫士",
      role: "避撞第一道防线",
      summary: "极氪009(G-AEB 130km/h+G-AES 130km/h+70项) > 第二代腾势D9(3A防护/120km/h AEB+AES+140km/h爆胎) ≈ 岚图梦想家(华为ADS3.0/实测AEB+AES 120km/h) > 小鹏X9(C-NCAP主动安全MPV最高分97.68%) >> 别克/星海(仅基础AEB)。注：一代D9实测AEB仅90km/h以下可靠。",
      definition: "<h3>AEB vs AES</h3><ul><li><strong>AEB(自动紧急制动)</strong>：检测到即将碰撞→自动刹车。速度越高越难刹停，130km/h AEB是目前天花板</li><li><strong>AES(自动紧急避让)</strong>：刹不住时自动打方向避开障碍物。比AEB更高级，需要更强算力和更精准感知</li><li><strong>爆胎稳行</strong>：高速爆胎时自动控制车辆不失控。极氪009 0.2s响应稳车，腾势D9 140km/h爆胎稳行</li></ul><h3>为什么MPV特别需要高速AEB？</h3><ul><li>MPV经常跑高速（家庭长途出行）</li><li>满载7人+3吨车重→制动距离比轿车长30%</li><li>驾驶员带老人小孩容易分心→需要电子系统兜底</li></ul>",
      examples: `<h3>真实场景对比</h3><ul><li>极氪009：130km/h前方突现障碍物→G-AEB自动刹停+G-AES自动变道避让</li><li>第二代腾势D9(2026)：120km/h进隧道遇停车→AEB刹停；140km/h爆胎→稳住车身。<em>一代D9：独立测试中100km/h未能AEB刹停</em></li><li>岚图梦想家(华为ADS3.0)：实测120km/h AEB+AES刹停/变道，表现优于一代D9</li><li>小鹏X9：C-NCAP主动安全得分97.68%(MPV最高)</li><li>别克GL8：仅有基础低速AEB，高速场景基本没有保护</li></ul>`,
      related: ["车身结构强度", "气囊配置", "主动安全AEB"],
      usedIn: ["crash-safety"],
      sources: [
        { label: "BitAuto：极氪009焕新/70项主动安全", url: "https://www.bitauto.com/article/1003110079666/" },
        { label: "BitAuto：第二代腾势D9/3A防护体系", url: "https://www.bitauto.com/article/1003109501367/" }
      ]
    },
    "气囊配置": {
      name: "气囊 — 不要为了省钱买少气囊的版本",
      role: "碰撞中的救命稻草",
      summary: "腾势D9(9气囊/3.2m三排贯穿侧气帘) ≈ 小鹏X9(9气囊/三排贯穿气帘+二排坐垫气囊+前排双腔远端) ≈ 极氪009(全方位气囊) > 理想MEGA(三排均有保护) > 岚图(6-8气囊) >> 低配仅4-6气囊。",
      definition: "<h3>MPV气囊配置的关键</h3><ul><li><strong>侧气帘长度</strong>：MPV三排乘客，侧气帘必须覆盖到三排。腾势D9的3.2m侧气帘是同级最长</li><li><strong>三排保护</strong>：很多MPV的气囊只保护前两排，三排没有→追尾时三排乘客直接暴露</li><li><strong>二排坐垫气囊</strong>：小鹏X9独有，侧碰时保护二排乘客骨盆</li><li><strong>前排远端气囊</strong>：正碰时防止驾驶员和副驾撞到一起</li></ul><h3>不要买少气囊版本</h3><ul><li>部分车型低配只有4-6个气囊（没有侧气帘/没有三排保护）</li><li>省1-2万元少4个气囊 ≠ 划算，而是拿全家人安全冒险</li><li>建议：9气囊+三排侧气帘是MPV的安全底线</li></ul>",
      examples: `<h3>气囊覆盖范围对比</h3><ul><li>小鹏X9(9个)：前排正面×2+侧面×2+双腔远端×1+贯穿三排气帘×2+二排坐垫×2</li><li>腾势D9(9个)：前排正面×2+侧面×2+3.2m贯穿气帘×2+膝部×1+中间×1+...</li><li>极氪009：前后排头部气帘+前后排侧气囊+前排中间气囊</li><li>低配别克GL8：部分版本仅6气囊，无三排保护</li></ul>`,
      related: ["车身结构强度", "主动安全AEB/AES"],
      usedIn: ["crash-safety"],
      sources: [
        { label: "小鹏官网：X9 2026配置表", url: "https://www.xiaopeng.com/x9_2026/configuration.html" },
        { label: "BitAuto：腾势D9 3.2m侧气帘", url: "https://www.bitauto.com/article/1003109501367/" }
      ]
    },
    "零重力座椅": {
      name: "零重力座椅 — 二排体验的决定性因素",
      role: "二排核心卖点",
      summary: "极氪009(NAPPA真皮+旋转+10点按摩/二排豪华感天花板) ≈ 腾势D9(Air SPA+16点按摩/按摩点数最多) > 小鹏X9(Nappa+180°躺平/最能躺) > 理想MEGA(旋转零重力/Home版独有) > 岚图(零重力+加热通风按摩)。",
      definition: "<h3>零重力座椅=什么？</h3><ul><li>模拟失重姿态（背部约120°/腿部微抬），减轻脊椎压力</li><li>配合按摩+通风+加热 = 「移动按摩椅」</li><li>是MPV二排与普通SUV二排体验差距最大的地方</li></ul><h3>各品牌差异</h3><ul><li><strong>极氪009</strong>：全NAPPA真皮+旋转+10点按摩。坐上去的「高级感」同级第一，皮质触感和填充物软硬度明显好于竞品</li><li><strong>腾势D9</strong>：Air SPA零重力+16点按摩（点数最多）+14向电动调节。按摩体验最细腻</li><li><strong>小鹏X9</strong>：10点按摩+180°完全躺平。躺平角度最大，适合「上车就睡」的乘客</li><li><strong>理想MEGA</strong>：Home版旋转零重力。座椅可以面对面变「客厅」，但白色内饰被吐槽像GL8</li></ul>",
      examples: `<h3>车主真实反馈</h3><ul><li>「领导开车我在后面睡着了不止一次」—— 腾势D9车主</li><li>「极氪009坐着最舒服，用料最豪华」—— B站大家车YYP横评</li><li>「X9二排180°躺平是我选它的核心原因」—— 小鹏社区车主</li></ul>`,
      related: ["三排平权", "中央过道"],
      usedIn: ["seating"],
      sources: [
        { label: "汽车之家：5大热门MPV实测对比", url: "https://chejiahao.autohome.com.cn/info/13783239" }
      ]
    },
    "三排平权": {
      name: "三排平权 — 全家人都坐得舒服才算好MPV",
      role: "MPV差异化关键",
      summary: "理想MEGA(3300mm轴距/三排加热/全平权) > 小鹏X9(180°躺平/1.8m无压力) > 极氪009(三排通风+加热/同级唯一全系标配) > 岚图(大角度靠背) > 腾势D9(可移动但放倒不全平)。",
      definition: "<h3>什么叫「三排平权」？</h3><ul><li>传统MPV三排 = 惩罚位：腿伸不直/头顶顶天/靠背不能调/无空调出风口/坐垫短</li><li>「平权」= 三排乘客和二排差距缩小到可接受范围</li><li>关键指标：① 腿部空间 ② 靠背角度可调 ③ 通风/加热 ④ 坐垫长度 ⑤ 独立空调出风口</li></ul><h3>优缺点</h3><ul><li><strong>优</strong>：理想MEGA/小鹏X9让三排真正可以长途乘坐，不再是凑合位</li><li><strong>缺</strong>：三排做好=牺牲后备箱空间（MEGA三排立起仍574L是例外）</li><li><strong>坑</strong>：很多车宣传「三排舒适」但实际坐垫短、靠背角度固定——必须实际试坐</li></ul>",
      examples: `<h3>实测数据</h3><ul><li>理想MEGA：三排腿部空间最大/加热标配/电动靠背</li><li>小鹏X9：三排180°躺平/加热/1.8m身高无压力</li><li>极氪009：三排通风+加热全系标配（同级唯一）</li><li>岚图：三排车厢高度和坐垫宽度实测最佳</li><li>腾势D9：三排可前后移动但放倒不全平是硬伤</li></ul>`,
      related: ["零重力座椅", "空间魔术"],
      usedIn: ["seating"],
      sources: [
        { label: "BitAuto：理想MEGA vs 小鹏X9 vs 极氪009对比", url: "https://www.bitauto.com/article/1003100327081/" }
      ]
    },
    "中央过道": {
      name: "中央过道 — 决定三排乘客的尊严",
      role: "上下车便利性",
      summary: "有过道(岚图200mm/星海200mm/小鹏180mm/腾势170mm/理想MEGA) vs 无过道(极氪009部分版本)。无过道=三排乘客必须翻折二排才能进出→极不方便。",
      definition: "<h3>为什么中央过道很重要？</h3><ul><li>有过道：三排乘客随时进出，不需要打扰二排乘客</li><li>无过道：进出三排必须翻折二排座椅→如果二排有老人/儿童安全座椅就很麻烦</li><li>过道越宽越好：200mm可以侧身通过，180mm刚好，150mm以下要挤</li></ul><h3>取舍</h3><ul><li><strong>选有过道</strong>：牺牲二排座椅宽度（理想MEGA二排略窄就是这个原因）</li><li><strong>选无过道</strong>：二排座椅更宽更舒服，但三排成「被困位」</li><li><strong>两种版本都有</strong>：小鹏X9提供有/无过道两个版本，可按需选择</li></ul>",
      examples: `<h3>实际影响</h3><ul><li>家有老人+儿童安全座椅 → 必选有过道版本</li><li>主要二排乘坐/三排少用 → 可选无过道（二排更宽）</li><li>商务接待 → 有过道更得体（客人不用弯腰翻座椅）</li></ul>`,
      related: ["零重力座椅", "上车便利性"],
      usedIn: ["seating"],
      sources: [
        { label: "汽车之家：MPV空间实测对比", url: "https://chejiahao.autohome.com.cn/info/13783239" }
      ]
    },
    "空间魔术": {
      name: "空间魔术 — 折叠变形能力决定MPV的上限",
      role: "灵活变形能力",
      summary: "小鹏X9(三排纯平一键收纳→2554L/断崖式领先) > 星海V9(4/6下沉放平/同级唯一/2616L) > 岚图(2700L) > 腾势D9(2310L/放倒不全平) > 理想MEGA(三排立起574L/得房率最高) > 极氪009(偏固定布局)。",
      definition: "<h3>为什么灵活折叠很重要？</h3><ul><li>MPV不是天天坐满7人，更多场景是4人+大量行李</li><li>三排能否完全放平 = 能否装下婴儿车/自行车/露营装备</li><li>「纯平」vs「有台阶」差别巨大——有台阶放不稳重物</li></ul><h3>各车差异</h3><ul><li><strong>小鹏X9</strong>：三排一键电动纯平收纳进地台→2554L纯平空间。这是MPV空间灵活性的天花板</li><li><strong>星海V9</strong>：4/6下沉放平（同级唯一下沉式设计），593L基础就大</li><li><strong>腾势D9</strong>：三排放倒不全平是被车主吐槽最多的点</li><li><strong>理想MEGA</strong>：三排不放倒就有574L，得房率（空间利用效率）最高</li></ul>",
      examples: `<h3>使用场景对比</h3><ul><li>露营/搬家：小鹏X9 2554L纯平 >>> 其他</li><li>日常带娃+行李：理想MEGA 574L不放排就够</li><li>偶尔拉大件：星海V9 下沉设计不怕滑</li><li>商务用途为主：极氪009固定布局反而整洁</li></ul>`,
      related: ["三排平权", "中央过道"],
      usedIn: ["seating"],
      sources: [
        { label: "BitAuto：小鹏X9空间魔术实测", url: "https://www.bitauto.com/article/1003100327081/" }
      ]
    },
    "上车便利性": {
      name: "上车便利性 — 老人小孩的第一道门槛",
      role: "老人小孩体验",
      summary: "小鹏X9(门槛39cm最低+空悬降低) > 岚图(空悬迎宾) ≈ 极氪009(空悬迎宾/但2024mm宽) > 腾势D9(1900mm车高/头部好但门槛高) > 别克GL8(侧滑门经典)。",
      definition: "<h3>影响上车便利性的因素</h3><ul><li><strong>门槛高度</strong>：越低越好，老人/小孩抬腿高度决定了上车难度。小鹏X9仅39cm是最低的</li><li><strong>空悬迎宾</strong>：空气悬架可以在停车时降低车身3-5cm，上下车更方便</li><li><strong>车门开度</strong>：侧滑门（腾势/别克/岚图）比铰链门（极氪/小鹏）在窄车位更方便</li><li><strong>车高</strong>：太高的车老人上车困难，太低进出弯腰也累</li></ul><h3>注意</h3><ul><li>极氪009虽有空悬迎宾但2024mm车宽，窄车位门都打不开</li><li>腾势D9 1900mm车高头部空间最优但门槛偏高</li></ul>",
      examples: `<h3>实测门槛高度</h3><ul><li>小鹏X9：39cm（最低/老人最友好）</li><li>极氪009：~42cm（空悬降低后）</li><li>岚图梦想家：~43cm</li><li>腾势D9：~44cm</li><li>别克GL8：~46cm</li></ul>`,
      related: ["空气悬架", "零重力座椅"],
      usedIn: ["seating"],
      sources: [
        { label: "汽车之家：5大MPV门槛高度实测", url: "https://chejiahao.autohome.com.cn/info/13783239" }
      ]
    },
    "路面预瞄": {
      name: "路面预瞄 — 提前看到坑才不会颠到人",
      role: "主动防晕核心",
      summary: "摄像头提前扫描路面→预调悬架。极氪009(定海中枢/最硬核) > 腾势D9(云辇预瞄2.0) ≈ 岚图(魔毯预瞄) > 理想MEGA(魔毯3.0) >> 无预瞄车型。",
      definition: "<h3>原理</h3><ul><li>前方摄像头扫描路面（坑洼/减速带/井盖）→ 提前0.1-0.5秒调整悬架阻尼和高度</li><li>乘客感受：车「飘」过去而不是「砸」过去</li><li>是高端MPV和普通MPV舒适性差距最大的技术</li></ul><h3>优缺点</h3><ul><li><strong>优</strong>：过减速带/坑洼几乎无感；高速路面接缝不晃</li><li><strong>缺</strong>：依赖摄像头，夜间/雨雪/逆光效果打折；侧方突然的坑无法预判</li><li><strong>数据</strong>：腾势D9云辇-C隔振率96%；极氪009 150km/h过11级横风稳如磐石</li></ul>",
      examples: `<h3>车主体验</h3><ul><li>「过坎像飞毯，高速稳定性出色」—— 腾势D9车主</li><li>「150km/h过11级风，车内没有任何感觉」—— 极氪009测试</li><li>「走烂路完全不传到车内」—— 岚图梦想家车主</li></ul>`,
      related: ["防晕车算法", "空气悬架", "CDC减震器"],
      usedIn: ["motion-sick"],
      sources: [
        { label: "腾讯新闻：腾势D9云辇预瞄路面技术解析", url: "https://news.qq.com/rain/a/20250417A047IL00" }
      ]
    },
    "防晕车算法": {
      name: "6D防晕车算法 — 用软件解决硬件问题",
      role: "软件定义舒适",
      summary: "小鹏X9独有的6D防晕车算法：每秒1000次路况扫描+提前300ms预判+AI路面记忆系统+能量回收优化。用纯软件+硬件结合方案达到接近极氪009的防晕效果。",
      definition: "<h3>原理</h3><ul><li>6个维度(前后/左右/上下各2)实时监测车身姿态变化</li><li>每秒1000次路况扫描，提前300ms预判路面特征（减速带/坑洼/弯道）</li><li>AI路面记忆系统：云端共享路面数据，可提前0.5秒预判颠簸路段</li><li>能量回收力度自动优化，消除「松油门=刹车」的突兀感</li></ul><h3>优缺点</h3><ul><li><strong>优</strong>：软硬件结合方案(双腔空悬+6D算法)，OTA可持续改进；车主反馈「老人全程不晕」</li><li><strong>缺</strong>：极端路况（连续S弯+大坑洼）厚重感不如极氪009的CCD电磁减震；算法需要学习期</li><li><strong>数据</strong>：1000Hz扫描频率/300ms预判时间/200ms爆胎响应/垂向加速度降低42%</li></ul>",
      examples: `<h3>车主反馈</h3><ul><li>「6D防晕车名不虚传，我妈第一次坐电车没晕」—— 小鹏X9增程首批车主</li><li>「过减速带几乎没震动，双腔空悬+6D算法组合拳」—— 小鹏社区</li><li>「智驾整体轻松，车辆在6D模式下加减速非常丝滑」—— 小鹏社区2800km实测</li></ul>`,
      related: ["路面预瞄", "能量回收晕感", "防晕车技术"],
      usedIn: ["motion-sick"],
      sources: [
        { label: "小鹏官网：X9 6D防晕车算法", url: "https://www.xiaopeng.com/x9_2026.html" }
      ]
    },
    "能量回收晕感": {
      name: "能量回收 — 电动MPV晕车的元凶",
      role: "电动MPV通病",
      summary: "松油门=立刻减速(能量回收)→后排前后晃→晕车。所有电动MPV都有这个问题，只是程度不同。解法：调低回收/关单踏板/6D算法/雪地模式。",
      definition: "<h3>为什么能量回收会让人晕？</h3><ul><li>燃油车松油门→缓慢减速（有变速箱缓冲）</li><li>电动车松油门→立刻减速（电机反向发电=制动）</li><li>后排乘客体感：频繁的「推-拽-推-拽」→ 前庭失调 → 晕</li><li>后排感受是前排的3-5倍（前排有方向盘参照物+视觉预判）</li></ul><h3>解决方案</h3><ul><li><strong>调低回收力度</strong>：几乎所有电车都可设置，但低回收=费电</li><li><strong>关闭单踏板</strong>：让松油门时不减速，像燃油车一样滑行</li><li><strong>6D算法</strong>（小鹏）：自动平滑加减速曲线</li><li><strong>雪地模式</strong>（岚图等）：降低加减速灵敏度，防晕效果明显</li></ul>",
      examples: `<h3>数据</h3><ul><li>后排晕车率：电动MPV约30-50% vs 燃油MPV约10-15%（非官方统计/论坛汇总）</li><li>调低回收后晕车率降到15-20%</li><li>6D算法+调低回收：降到5-10%（接近燃油车水平）</li></ul>`,
      related: ["防晕车算法", "路面预瞄"],
      usedIn: ["motion-sick"],
      sources: [
        { label: "新浪：焕新极氪009智能恒稳防晕系统", url: "https://finance.sina.com.cn/roll/2026-05-20/doc-inhypxki6928624.shtml" }
      ]
    },
    "价格梯队": {
      name: "价格梯队 — 选对区间比选对车更重要",
      role: "预算分档",
      summary: "20万内：星海V9(唯一选项)。30万档：小鹏X9增程/岚图冠军版/腾势D9 DM(三足鼎立)。35-45万：腾势D9/极氪009/小鹏X9纯电(甜蜜区)。50万+：理想MEGA(独占)。",
      definition: "<h3>各价格档推荐</h3><ul><li><strong>20万以下</strong>：只有星海V9(17.99万起)，没得选但务实够用</li><li><strong>30万档(30.98-30.99万)</strong>：3款车差价不到1000元，竞争最激烈。小鹏X9增程(配置最高)+岚图冠军版(华为智驾)+腾势D9 DM(品牌最稳)</li><li><strong>35-45万(主力战场)</strong>：钱多了就是买更好的电池/底盘/品质。腾势D9 EV/小鹏X9纯电35.98万起=甜蜜区；极氪009 41.38万起=豪华区</li><li><strong>50万以上</strong>：理想MEGA 52.98万，产品力拉满但受众窄</li></ul>",
      examples: `<h3>同价位配置对比</h3><ul><li>30.98万小鹏X9增程 vs 30.99万岚图冠军版：X9智驾更强+空间更灵活；岚图底盘更好+华为生态</li><li>35.98万腾势D9 EV vs 35.98万小鹏X9纯电：D9续航800km+闪充；X9智驾XNGP+后轮转向</li><li>41.38万极氪009 vs 52.98万理想MEGA：009底盘品质更高+6C补能；MEGA空间更大+电耗更低</li></ul>`,
      related: ["保值率", "配置含金量"],
      usedIn: ["price-value"],
      sources: [
        { label: "网通社：小鹏X9最新报价", url: "https://auto.news18a.com/6691/" }
      ]
    },
    "保值率": {
      name: "保值率 — 3年后还值多少钱",
      role: "二手残值",
      summary: "小鹏X9(3年~58%) ≈ 腾势D9(3年55-58%) > 极氪009(52-54%) > 理想MEGA(未满3年/1年80%) > 岚图(~48%) >> 合创(30-35%/存续风险)。注：新能源MPV整体低于燃油MPV(赛那71%/GL8 60%+)。",
      definition: "<h3>影响保值率的因素</h3><ul><li><strong>销量</strong>：保有量大=二手市场流通性好。腾势D9累计30万+台遥遥领先</li><li><strong>品牌力</strong>：比亚迪>吉利>理想>小鹏>岚图>合创</li><li><strong>改款频率</strong>：频繁改款=老款贬值快。极氪009改款最少</li><li><strong>质量口碑</strong>：极氪009十万公里长测电池衰减极小(SOH 97%+)，底盘无异响</li></ul><h3>注意</h3><ul><li>新能源车保值率整体不如燃油车（技术迭代快）</li><li>「首任车主终身质保」转手后失效→直接影响二手价格</li><li>智驾能力越强的车保值率反而可能更好（软件可OTA升级）</li></ul>",
      examples: `<h3>3年保值率(2026Q1数据)</h3><ul><li>小鹏X9：~58%（35.98万→3年后约21万）— 来源：全联车商2026Q1报告</li><li>腾势D9：55-58%（35.98万→3年后约20-21万）— 瓜子二手车/全联车商</li><li>极氪009：52-54%（41.38万→3年后约21-22万）— 来源：纯电车保值率榜单</li><li>合创V09：30-35%（31.88万→3年后约10-11万/品牌风险大）</li></ul><p><em>注：保值率数据因统计口径差异较大，以上为多源综合估算。新能源MPV整体保值率低于燃油MPV约10-15个百分点。</em></p>`,
      related: ["价格梯队", "质保政策"],
      usedIn: ["price-value"],
      sources: [
        { label: "易车：MPV保值率与降价幅度分析", url: "https://news.yiche.com/hao/wenzhang/109804961/" }
      ]
    },
    "配置含金量": {
      name: "配置含金量 — 同样30万谁给得最多",
      role: "同价位配置对比",
      summary: "小鹏X9增程30.98万(后轮转向+6D防晕+XNGP+双腔空悬+1602km)配置含金量最高。岚图冠军版30.99万(华为ADS4+空悬+后转向)紧随。腾势D9 30.98万(云辇-C+闪充)品牌最稳。",
      definition: "<h3>30万档配置对比</h3><ul><li><strong>小鹏X9增程 30.98万</strong>：后轮转向✅ + 双腔空悬✅ + XNGP全场景智驾✅ + 6D防晕车✅ + 1602km综合续航 = 配置含金量断崖式第一</li><li><strong>岚图冠军版 30.99万</strong>：后轮转向✅ + 空悬✅ + 华为ADS4(鲲鹏版)✅ + 双电机四驱✅ = 底盘+智驾全有</li><li><strong>腾势D9 DM 30.98万</strong>：后轮转向❌ + 空悬❌(云辇-C/CDC) + 基础辅助驾驶 + 16点按摩 = 品牌和舒适见长但配置不如前两者</li></ul><h3>为什么配置重要？</h3><ul><li>后轮转向（值2-3万）：有vs无 = 停车天堂vs地狱</li><li>空气悬架（值1.5-2万）：有vs无 = 飞毯vs搓板</li><li>高阶智驾（值3-5万）：有vs无 = 解放双手vs全程专注</li></ul>",
      examples: `<h3>如果按配置单独购买</h3><ul><li>后轮转向：选装约2-3万元</li><li>双腔空悬：选装约1.5-2万元</li><li>高阶智驾包：订阅约3-5万元</li><li>小鹏X9增程30.98万全标配 = 相当于其他车型35-38万的配置水平</li></ul>`,
      related: ["价格梯队", "保值率"],
      usedIn: ["price-value"],
      sources: [
        { label: "BitAuto：30万级MPV岚图vs腾势D9", url: "https://www.bitauto.com/article/1003108401691/" }
      ]
    },
    "六维评分体系": {
      name: "六维评分 — 不偏不倚的综合评判",
      role: "综合评判标准",
      summary: "续航补能(20%)+空间舒适(20%)+智能驾驶(20%)+底盘质感(15%)+品牌保值(10%)+性价比(15%)。加权后小鹏X9和腾势D9并列88分第一，极氪009和理想MEGA并列87分。",
      definition: "<h3>评分维度和权重</h3><ul><li><strong>续航补能 20%</strong>：续航里程+充电速度+充电网络</li><li><strong>空间舒适 20%</strong>：二排三排体验+后备箱+灵活性</li><li><strong>智能驾驶 20%</strong>：城市NOA+高速领航+泊车+AEB</li><li><strong>底盘质感 15%</strong>：悬架类型+滤震+防晕+操控</li><li><strong>品牌保值 10%</strong>：品牌力+销量+保值率+售后网络</li><li><strong>性价比 15%</strong>：配置/价格比值+落地成本</li></ul><h3>为什么这样设权重？</h3><ul><li>续航/空间/智驾各20% — 这是买MPV最核心的三件事</li><li>底盘15% — 直接影响乘坐舒适性/防晕</li><li>品牌10% — 影响保值和售后但不是决定性因素</li><li>性价比15% — 30-50万价格区间，钱花得值不值很重要</li></ul>",
      examples: `<h3>总分排名</h3><ul><li>第1：小鹏X9 — 88分（智驾+性价比拉高总分）</li><li>第1：腾势D9 — 88分（均衡无短板+品牌保值高）</li><li>第3：极氪009 — 87分（底盘天花板但性价比和智驾拉分）</li><li>第3：理想MEGA — 87分（产品力强但价格门槛拉低性价比分）</li><li>第5：岚图梦想家 — 85分（全面但品牌保值拉分）</li></ul>`,
      related: ["场景化选车"],
      usedIn: ["recommendation"],
      sources: [
        { label: "有驾：2026年6款MPV新车对比", url: "https://www.yoojia.com/article/9719667727110849604.html" }
      ]
    },
    "场景化选车": {
      name: "场景化选车 — 没有最好只有最适合",
      role: "按需求匹配",
      summary: "家用二胎→小鹏X9增程；商务接待→极氪009六座；智能科技→小鹏X9纯电；长途重度→理想MEGA；底盘舒适→极氪009；30万预算→小鹏X9增程/岚图冠军版；20万→星海V9。",
      definition: "<h3>为什么要按场景选车？</h3><ul><li>MPV不像轿车/SUV有「全能选手」——每款车都有明确的最佳场景</li><li>用错场景=花冤枉钱：买极氪009来跑网约车是暴殄天物，买星海V9做商务接待是丢面子</li></ul><h3>场景匹配逻辑</h3><ul><li><strong>家用优先</strong>：防晕车+智驾+空间灵活 → 小鹏X9</li><li><strong>商务优先</strong>：豪华感+品质+静谧 → 极氪009/腾势D9</li><li><strong>科技优先</strong>：XNGP+算力+OTA迭代 → 小鹏X9</li><li><strong>长途优先</strong>：补能速度+电耗+充电网络 → 理想MEGA/极氪009</li><li><strong>预算优先</strong>：同价位配置最高 → 小鹏X9增程/岚图冠军版</li></ul>",
      examples: `<h3>真实用户选择</h3><ul><li>「两孩+老人=选X9增程，后轮转向+6D防晕征服了我」—— 小鹏社区</li><li>「接待客户=选009六座，坐进去就是不一样的品质感」—— 小红书</li><li>「北京到湖南2000多公里全程华为智驾=选岚图」—— 腾讯新闻</li><li>「综合优惠近8万拿下009，40万级性价比能打」—— 新浪汽车</li></ul>`,
      related: ["六维评分体系", "价格梯队"],
      usedIn: ["recommendation"],
      sources: [
        { label: "易车：2026年家用MPV选购指南", url: "https://hao.yiche.com/wenzhang/107335432/" }
      ]
    },
    "超充站网络": {
      name: "超充站 — 长途出行的安心底线",
      role: "补能基础",
      summary: "比亚迪5500+站(年底2万/1500kW兆瓦闪充) > 理想4088站(70%为5C桩) > 小鹏3150+站 > 极氪2100+站(1300kW V4极充) >> 岚图121站 >> 别克/传祺/星海(无自建)。",
      definition: "<h3>为什么自建超充站很重要？</h3><ul><li>第三方公共桩功率参差不齐（很多还是60kW慢桩），你的车支持5C超充但桩跟不上=白搭</li><li>自建超充站功率有保证：比亚迪闪充1500kW、极氪V4极充1300kW、理想5C桩</li><li>长途出行规划：自建站分布合理（沿高速），第三方桩可能偏离路线</li></ul><h3>各品牌充电网络优缺点</h3><ul><li><strong>比亚迪/腾势</strong>：数量碾压(5000+站)+功率最高(1500kW)+年底目标2万站。唯一问题是闪充桩是比亚迪专属协议，其他品牌车用不到最高功率</li><li><strong>理想</strong>：4088站/70%为5C桩/覆盖280+城市。补能体验接近加油站</li><li><strong>小鹏</strong>：3150+站/大湾区超充县县通。但全国均匀度不如比亚迪/理想</li><li><strong>极氪</strong>：单桩功率行业第一(1300kW)，但总站数不够多</li><li><strong>岚图</strong>：仅121站，严重依赖第三方。但支持800V，第三方高功率桩也能快充</li></ul>",
      examples: `<h3>长途出行充电体验对比</h3><ul><li>北京→上海(1300km)：比亚迪D9/理想MEGA全程自建站覆盖，充1-2次即可到达</li><li>同样路线极氪009：部分路段需找第三方桩，但900V架构在任何高功率桩都能快充</li><li>同样路线岚图：大部分路段需要第三方桩，但5C快充也不慢</li><li>同样路线别克GL8插混：混动不焦虑，但纯电续航150km，跑高速全程吃油</li></ul>`,
      related: ["质保政策", "用车成本"],
      usedIn: ["charging-service"],
      sources: [
        { label: "CNMO：各车企最新超充站数量一览", url: "https://smartcar.cnmo.com/news/806546.html" },
        { label: "36氪：比亚迪2万闪充站计划", url: "https://36kr.com/p/3716964991759752" }
      ]
    },
    "售后网络": {
      name: "售后网点 — 下沉市场是真正的试金石",
      role: "维修保障",
      summary: "比亚迪2300+家(下沉到县级) >> 广汽2000+ > 理想543家 > 极氪470家 > 小鹏372家 > 岚图200+家。在三四线城市，比亚迪和传统品牌完胜新势力。",
      definition: "<h3>售后网点多=什么？</h3><ul><li>维修等待时间短（不用排队几天）</li><li>配件供应快（热门品牌配件充足/冷门品牌等1-2周）</li><li>不用跨城维修（三四线城市尤其重要）</li></ul><h3>各品牌售后服务特色</h3><ul><li><strong>比亚迪/腾势</strong>：2300+网点，30km外空白区域提供定点服务。配件最充足价格最亲民</li><li><strong>极氪</strong>：470家+移动服务车(完成85%常规保养)+98.7%一次性修复率。30分钟救援覆盖95%地级市</li><li><strong>小鹏</strong>：372家+1对1鹏管家+免费上门取送车(1年不限次)</li><li><strong>理想</strong>：543家但规模在收缩(2026年前5月净减少18家)。三四线维修需跨城</li><li><strong>岚图</strong>：200+直营+500授权。偏远地区不足</li></ul>",
      examples: `<h3>车主真实售后体验</h3><ul><li>"比亚迪售后网络最完善，修个小毛病当天搞定" — 腾势D9车主</li><li>"极氪移动服务车上门保养，不用跑4S店" — 极氪009车主</li><li>"周边最近的岚图网点距离较远，维修不太方便" — 岚图梦想家车主</li></ul>`,
      related: ["质保政策", "用车成本"],
      usedIn: ["repair-network"],
      sources: [
        { label: "比亚迪官网：售后服务网点", url: "https://www.byd.com/cn/after-sales-service" },
        { label: "BitAuto：新能源MPV售后网络对比", url: "https://www.bitauto.com/article/1003107413236/" }
      ]
    },
    "用车成本": {
      name: "用车成本 — 纯电MPV养车=燃油的一半",
      role: "长期花费",
      summary: "纯电月均700-1300元 vs 燃油GL8月均2500元。省在：保养趋近0(无机油机滤)+电费仅油费1/6。坑在：保险贵(8000-12000/年)+轮胎贵(1500/条)+商充比家充贵3倍。",
      definition: "<h3>省钱的地方</h3><ul><li><strong>保养费趋近0</strong>：纯电无机油/机滤/火花塞，保养=检查三电+换空调滤。年保养费0-1000元 vs 燃油3000-5000元</li><li><strong>电费仅油费1/6</strong>：家充0.5元/度×18kWh/100km=9元/百公里 vs 92号油8元/L×8L/100km=64元/百公里</li><li><strong>刹车片不用换</strong>：动能回收承担80%制动，刹车片寿命是燃油车3-5倍</li></ul><h3>贵的地方</h3><ul><li><strong>保险费</strong>：新能源零整比高，首年保费7000-12000元。极氪009(~10500元)和理想MEGA(~12000元)最贵</li><li><strong>轮胎</strong>：MPV轮胎大且重(车重2500-3000kg磨损快)，每条1200-2000元</li><li><strong>商充 vs 家充</strong>：没有家充条件→年电费从2200元涨到5500-7000元</li><li><strong>过保电池更换</strong>：10-15万元（但8-10年内正常使用不太会遇到）</li></ul>",
      examples: `<h3>3年/6万km总用车成本对比</h3><ul><li>小鹏X9纯电：~27000元(月均761元) — 最省</li><li>岚图梦想家纯电：~27700元(月均770元)</li><li>腾势D9纯电：~30700元(月均853元)</li><li>极氪009纯电：~46900元(月均1303元) — 保险最贵</li><li>别克GL8燃油：~100000元(月均2780元) — 对比基准</li></ul><p><strong>结论：纯电MPV 3年省下5-7万养车费，几乎能多买一辆代步车。</strong></p>`,
      related: ["超充站网络", "质保政策"],
      usedIn: ["maintenance-cost"],
      sources: [
        { label: "汽车之家：腾势D9月均花费853元", url: "https://chejiahao.autohome.com.cn/info/18734019" },
        { label: "BitAuto：小鹏X9月均花费761元", url: "https://www.bitauto.com/zh-us/news/100399807920.html" },
        { label: "汽车之家：MPV养车成本分析", url: "https://chejiahao.autohome.com.cn/info/18734019" }
      ]
    },
    "质保政策": {
      name: "质保 — 岚图终身免费保养是最大亮点",
      role: "购车保障",
      summary: "岚图(终身整车质保+终身免费保养/首任)诚意最高 > 腾势(6年15万km整车+三电终身) ≈ 极氪(6年15万km+三电终身/空悬老化免换) > 小鹏(5年12万km+三电终身) > 理想(5年10万km/里程最短) >> 别克(3年10万km/无终身)。",
      definition: "<h3>质保≠保养，区别很大</h3><ul><li><strong>质保</strong> = 坏了免费修（配件+工时全免）</li><li><strong>保养</strong> = 常规维护（检查/换滤芯/换液等），需自费或品牌赠送</li><li>大部分品牌只给终身质保不给终身保养，岚图例外</li></ul><h3>各品牌质保诚意排名</h3><ul><li><strong>岚图梦想家 — S级</strong>：三电终身质保 + 终身免费保养（首任）+ 5年15万km整车。「买了就不用操心维修保养费」</li><li><strong>腾势D9 — A+级</strong>：三电终身 + 6年15万km整车（整车质保最长）。比亚迪体系配件便宜</li><li><strong>极氪009 — A级</strong>：三电终身 + 6年15万km整车 + 空悬/减震老化免费更换（首任）。保养需自费但无免费终身保养</li><li><strong>小鹏X9 — A级</strong>：三电终身(非营运) + 5年12万km。鹏管家服务好</li><li><strong>理想MEGA — B+级</strong>：三电终身 + 5年10万km。52.98万的车仅10万km整车质保偏短</li><li><strong>别克GL8 — C级</strong>：3年10万km + 8年16万km电池。无终身质保，传统车企思维</li></ul>",
      examples: `<h3>质保「坑」要注意</h3><ul><li>「首任车主」限制：卖二手后质保缩减为8年16万km → 影响二手残值</li><li>年里程上限：部分品牌要求每年≤3万km，超出不保</li><li>必须按时去官方保养：漏保一次可能失去终身质保资格</li><li>营运车辆不保：网约车/公司用车可能不享受终身质保</li></ul>`,
      related: ["售后网络", "用车成本"],
      usedIn: ["warranty"],
      sources: [
        { label: "有驾：豪华MPV售后大比拼", url: "https://youjia-pc.bdstatic.com/article/9443902243638465182.html" },
        { label: "新浪：2026纯电MPV选购评测/售后保障维度", url: "https://k.sina.com.cn/article_7896226602_1d6a6db2a00101mkam.html" }
      ]
    },
    "端到端大模型": {
      name: "端到端大模型 — 智驾的iPhone时刻",
      role: "智驾架构",
      summary: "传统智驾=感知→规划→控制三个独立模块，靠人写规则。端到端=一个大模型直接从摄像头画面输出方向盘/油门指令。进化速度快10倍+。小鹏/理想/华为已量产，极氪/腾势跟进中。",
      definition: "<h3>为什么端到端是革命？</h3><ul><li><strong>传统智驾</strong>：感知模块识别红绿灯 → 规划模块算路径 → 控制模块执行。三个模块之间信息丢失，且人工规则无法覆盖所有场景（如中国特色的无标线路口）</li><li><strong>端到端</strong>：一个神经网络从摄像头/雷达原始数据直接输出驾驶决策。好处=自我学习/自我进化，用数据驱动替代人工规则</li></ul><h3>各家端到端进度</h3><ul><li><strong>小鹏 — 第二代VLA（最快）</strong>：物理世界大模型，2天迭代一次，18个月智驾能力提升30倍。全国无图覆盖，端到端最成熟</li><li><strong>理想 — 端到端+VLM</strong>：Thor-U芯片运行端到端+VLM双系统，全域NOA成熟</li><li><strong>华为ADS4 — GOD大模型</strong>：用在岚图乾崑版，城市NOA效率高</li><li><strong>腾势/极氪</strong>：在跟进端到端，但目前仍以传统架构为主</li></ul><h3>对买车人的影响</h3><p>端到端意味着智驾会越用越好（OTA升级）。选有端到端的车=选了一个会持续进化的AI司机。选传统智驾的车=功能止步于交付那天。</p>",
      examples: `<h3>端到端 vs 传统的实际差异</h3><ul><li>遇到施工路段/无标线路口：端到端靠视觉理解直接通过；传统智驾因为没有高精地图规则 → 退出/接管</li><li>OTA迭代速度：小鹏端到端2天一次 vs 传统方案每月一次</li><li>开城速度：小鹏端到端全国无图一次性开通 vs 传统方案逐城市测试验证</li></ul>`,
      related: ["智驾芯片", "城市NOA"],
      usedIn: ["adas"],
      sources: [
        { label: "小鹏官网：第二代VLA物理世界大模型推送", url: "https://www.xiaopeng.com/news/company_news/5539.html" },
        { label: "理想MEGA智驾焕新版：双Orin-X升级Thor-U", url: "https://www.bitauto.com/news/100398897439.html" }
      ]
    },
    "智驾芯片": {
      name: "智驾芯片 — 算力就是智驾的天花板",
      role: "硬件基础",
      summary: "图灵2250TOPS(小鹏)=能跑最大模型。Thor-U 700TOPS(极氪/理想)=够用但无余量。Orin-X 254TOPS(岚图/腾势/翼真)=只够跑当前模型。J6M ~128TOPS(腾势低配)=仅高速。别克/星海<100TOPS=只能基础L2。",
      definition: "<h3>为什么算力很重要？</h3><p>端到端大模型需要巨大算力运行。算力不够 → 模型被迫缩小 → 智驾能力受限。类比手机：旗舰芯片能流畅运行3A大作，入门芯片连微信都卡。</p><h3>各芯片优缺点</h3><ul><li><strong>图灵AI 2250TOPS（小鹏自研）</strong><br>优点：算力碾压，专为端到端大模型定制，编译效率12倍提升<br>缺点：自研芯片生态封闭，仅小鹏可用</li><li><strong>Thor-U 700-750TOPS（英伟达）</strong><br>优点：行业通用方案，算力充足，支持VLA大模型<br>缺点：单芯片750TOPS上限，未来大模型可能不够用</li><li><strong>Orin-X 254TOPS（英伟达）</strong><br>优点：成熟稳定，生态最完善，价格比Thor-U便宜<br>缺点：算力已是瓶颈，无法运行最新最大的端到端模型</li><li><strong>J6M ~128TOPS（地平线）</strong><br>优点：国产替代，成本最低<br>缺点：仅够高速NOA，城市NOA勉强</li></ul>",
      examples: `<h3>算力对智驾体验的直接影响</h3><ul><li>2250TOPS（小鹏）：能同时运行感知+决策+规划三个大模型 → 智驾最流畅</li><li>700TOPS（极氪/理想）：能运行端到端+VLM双系统 → 够用</li><li>254TOPS（岚图/腾势高配）：只能运行精简版模型 → 城市NOA可用但不够丝滑</li><li><100TOPS（别克/星海）：只够基础L2 → 别指望智驾</li></ul>`,
      related: ["端到端大模型", "城市NOA"],
      usedIn: ["adas"],
      sources: [
        { label: "BitAuto：焕新极氪009全栈900V+700TOPS智驾", url: "https://www.bitauto.com/article/1003110091432/" },
        { label: "小鹏官网：图灵AI芯片2250TOPS", url: "https://www.xiaopeng.com/news/company_news/5539.html" }
      ]
    },
    "城市NOA": {
      name: "城市NOA — 通勤解放的关键",
      role: "高阶功能",
      summary: "城市NOA=在城市道路自动驾驶（红绿灯/路口/变道/绕行）。小鹏全国无图量产最成熟，理想全域NOA紧随，华为ADS4(岚图)效率最高但限乾崑版。腾势/极氪在追赶。别克/星海/传祺=完全没有。",
      definition: "<h3>城市NOA vs 高速NOA</h3><p>高速NOA相对简单（匀速直行/偶尔变道），90%车企都能做。城市NOA才是真正考验：红绿灯识别/无保护左转/行人横穿/非机动车混行/施工绕行。能力差距巨大。</p><h3>各品牌城市NOA实力排名</h3><ul><li><strong>小鹏XNGP — S级</strong>：全国无图/端到端VLA/2天迭代/全量用户。车主：「XNGP通勤简直解放」。但偶发接管（「简单题有时犯错」）</li><li><strong>理想全域NOA — A+级</strong>：Thor-U+端到端+VLM/全域覆盖/体验稳定。但52.98万门槛高</li><li><strong>华为ADS4（岚图乾崑）— A级</strong>：GOD大模型/城市NOA效率高（「通过复杂路口速度明显更快」）。但仅乾崑版有</li><li><strong>腾势天神之眼 — B+级</strong>：城市领航已推送/策略保守但安心（「安心感D9略胜」）。OTA还在完善中</li><li><strong>极氪千里浩瀚H7 — B级</strong>：2026年5月刚上线/逐步开城/需要时间验证</li><li><strong>翼真L380/合创V09 — C级</strong>：硬件有但软件投入不足</li><li><strong>别克/传祺/星海 — 无</strong></li></ul>",
      examples: `<h3>城市NOA车主真实反馈</h3><ul><li>"XNGP通勤简直解放" — 小鹏X9车主</li><li>"一上高速就不想自己开了" — 岚图梦想家乾崑版车主</li><li>"看细节安心感D9略胜，看效率梦想家更强" — B站智驾对比评测</li><li>"智驾日常够用但部分承诺功能还没完全落地" — 岚图梦想家车主</li></ul>`,
      related: ["端到端大模型", "智驾芯片", "智能泊车"],
      usedIn: ["adas"],
      sources: [
        { label: "车东西：腾势D9全系标配天神之眼/城市NOA", url: "https://chedongxi.com/p/332405.html" },
        { label: "小鹏官网：XNGP全国无图覆盖", url: "https://www.xiaopeng.com/news/company_news/5191.html" }
      ]
    },
    "智能泊车": {
      name: "智能泊车 — MPV 最高频的智驾场景",
      role: "日常功能",
      summary: "5m+大车停车是噩梦。小鹏(免遥控离车泊入/断头位/跨楼层记忆)最强 > 极氪(车位到车位领航)=理想(全场景) > 岚图(华为泊车230+车位)=腾势(智能泊车) >> 别克/星海(仅倒车影像)。",
      definition: "<h3>为什么MPV最需要智能泊车？</h3><p>MPV 车长5m+/车宽2m+，在中国城市的停车位（标准宽2.5m/长5.3m）里停车极其痛苦。尤其是极氪009(宽2024mm)和理想MEGA(长5350mm)。智能泊车能力直接影响日常使用幸福感。</p><h3>各品牌泊车能力对比</h3><ul><li><strong>小鹏 — 最强</strong>：免遥控离车泊入（下车后车自己停好）、迎宾出库、跨楼层记忆泊车、断头位/侧方位一把到位。可泊车位比传统多3倍</li><li><strong>极氪009</strong>：车位到车位领航辅助（从车位开到目的地车位）、多种车位多种方式泊车</li><li><strong>理想MEGA</strong>：全场景泊车、540度全景影像透明底盘</li><li><strong>岚图(华为)</strong>：支持230+种车位类型、代客泊车</li><li><strong>腾势D9</strong>：智能泊车（但车主反馈「自动泊车扫描车位不灵敏」）</li><li><strong>别克GL8/星海V9</strong>：仅基础倒车影像+雷达 → 全靠自己</li></ul>",
      examples: `<h3>泊车场景真实痛点</h3><ul><li>极氪009(宽2024mm)车主："唯一让我头疼的就是宽度，老小区每次停车都得收耳朵+屏息"</li><li>理想MEGA(长5350mm)车主："5米35没后转向，地库停车要来回揉好几把"</li><li>小鹏X9车主："后轮转向+AI泊车，地下车库随便钻，下车让它自己停"</li></ul>`,
      related: ["城市NOA", "后轮转向"],
      usedIn: ["adas"],
      sources: [
        { label: "小鹏520 AI DAY：全球首个量产免遥控离车泊入", url: "https://www.xiaopeng.com/news/company_news/5307.html" },
        { label: "BitAuto：焕新极氪009车位到车位领航泊车", url: "https://www.bitauto.com/article/1003110090347/" }
      ]
    },
    "主动安全AEB": {
      name: "AEB — 关键时刻救命的主动刹车",
      role: "安全基础",
      summary: "第二代腾势D9(2026) AEB=120km/h+AES+ESA(3A防护) ≈ 岚图梦想家(华为ADS3.0实测120km/h AEB+AES) > 极氪009=AEB+爆胎0.2s稳车+150km/h防横风 > 小鹏/理想(高速AEB有效) >> 别克/星海(基础AEB)。注意：一代D9实测AEB仅80-90km/h可靠。",
      definition: "<h3>什么是AEB？</h3><p>AEB = 自动紧急制动。检测到即将碰撞时自动刹车。MPV满载一家老小，AEB是最重要的安全配置。</p><h3>各品牌AEB能力</h3><ul><li><strong>第二代腾势D9(2026) — 120km/h AEB + AES + ESA 3A防护</strong>：标配天神之眼5.0/3激光雷达，日间隧道120km/h刹停，140km/h爆胎稳行。<em>重要提醒：一代D9(2022-2025)实测AEB在90km/h以上不可靠，独立媒体测试中100km/h未能刹停，对儿童假人识别也较弱</em></li><li><strong>岚图梦想家(华为ADS3.0) — 实测120km/h AEB+AES</strong>：独立媒体实测中表现优于一代D9，AEB+AES在120km/h仍能刹停或变道避让</li><li><strong>极氪009 — 安全三重保障</strong>：G-AEB 130km/h + G-AES 130km/h + 120km/h爆胎0.2秒稳车 + 150km/h防横风。安全冗余最高</li><li><strong>小鹏X9</strong>：AI保镖功能，C-NCAP主动安全得分97.68%(MPV最高)，端到端感知提前预判风险</li><li><strong>理想MEGA</strong>：AEB+激光雷达双重保障，主动安全可靠</li><li><strong>别克GL8/星海V9</strong>：仅基础AEB，低速有效，高速不可靠</li></ul>",
      examples: `<h3>为什么MPV的AEB比轿车更重要？</h3><ul><li>MPV整备质量2500-3000kg，制动距离天然比轿车长10-20%</li><li>满载7人=惯性更大，需要更早介入才能刹停</li><li>后排乘客（老人/儿童）更脆弱，碰撞后果更严重</li></ul><p><strong>选购建议：</strong>AEB能力是安全底线。极氪009(G-AEB 130km/h+爆胎+横风控制)安全冗余最高；第二代腾势D9的3A防护体系也很强但注意区分一代/二代；岚图梦想家华为ADS3.0方案实测表现优秀。</p>`,
      related: ["智驾芯片", "端到端大模型"],
      usedIn: ["adas"],
      sources: [
        { label: "新华网：第二代腾势D9(2026)AEB120km/h+AES+ESA 3A防护", url: "http://www.news.cn/auto/20260429/cf89ba25ca1a45588cd51479bbe2a158/c.html" },
        { label: "AutoLab：岚图vs一代D9 AEB实测对比(D9在100km/h未刹停)", url: "http://www.autolab.cn/2025/03/78111/" },
        { label: "新浪财经：极氪009爆胎0.2秒稳车+防横风", url: "https://finance.sina.com.cn/roll/2026-05-20/doc-inhypxki6928624.shtml" }
      ]
    },
    "热管理系统": {
      name: "热管理 — 超充安不安全全看它",
      role: "安全技术",
      summary: "5C充电=12min灌100度电，发热巨大。热管理差→冬天充电极慢、夏天限功率、电池加速老化。各家差距很大。",
      definition: "<h3>为什么超充必须有好的热管理？</h3><p>5C 充电 = 100kWh 电池以 500kW 功率灌电，12 分钟产生的热量足以烧开 50 升水。如果散热不好：</p><ul><li><strong>析锂</strong>：锂金属沉积在负极表面，可能刺穿隔膜导致短路→起火</li><li><strong>限功率</strong>：BMS 为保护电池自动降低充电功率，标称 5C 实际可能只有 2C</li><li><strong>加速老化</strong>：高温充电每增加 10°C，电池寿命缩短 30-50%</li></ul><h3>各品牌热管理实力排名</h3><ul><li><strong>S 级</strong>：宁德时代麒麟（双大面水冷，4倍换热面积）— 用在极氪009/理想MEGA</li><li><strong>S 级</strong>：比亚迪刀片（液冷直贴+内阻降50%，极寒仅多3min）— 用在腾势D9</li><li><strong>A 级</strong>：理想双呼吸散热（官方称 5C 充电不伤电池）— MEGA 专属</li><li><strong>A 级</strong>：巨湾 XFC（40万公里极速快充无衰减）— 合创V09 超充版</li><li><strong>B 级</strong>：中创新航常规液冷 — 小鹏X9/合创V09 620</li><li><strong>C 级</strong>：别克GL8/星海V9 — 常规热管理，无特殊技术</li></ul>",
      examples: `<h3>热管理差的真实后果（车主反馈）</h3><ul><li>冬天快充：热管理差的车充电前先花 10-15 分钟给电池加热，实际充满要 40-50 分钟</li><li>夏天长途：连续快充 2-3 次后 BMS 降功率，第 3 次充电时间翻倍</li><li>电池寿命：热管理差的车 3 年后 SOH 降到 85%（好的如极氪009 十万公里 97%+）</li></ul><p><strong>选购建议：</strong>如果你经常跑长途需要多次超充，热管理水平比 C 倍率标称更重要。</p>`,
      related: ["C倍率", "800V高压平台", "麒麟电池", "刀片电池"],
      usedIn: ["battery"]
    }
  }
};
