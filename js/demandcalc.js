document.addEventListener("DOMContentLoaded", function () {
    const aprmInput = document.getElementById("aprm");
    const demandInput = document.getElementById("demand");
    const feedwaterInput = document.getElementById("feedwater");
    const genLoadInput = document.getElementById("gen-load");
    const siteUsage = document.getElementById("site-usage");

    let suppressTB_Demand = false;
    let suppressTB_APRM = false;

    const CalcType = {
        MWtoAPRM: 'MWtoAPRM',
        APRMtoMW: 'APRMtoMW'
    };

    let usage = 61.32;

  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarlinks = document.querySelector('.navbar-links');
  const navbar = document.querySelector('.navbar');

  if (navbarToggle && navbar && navbarlinks) {
    navbarToggle.addEventListener('click', function () {
      navbarlinks.classList.toggle('show');
      navbar.classList.toggle('show');
    });
  } else {
    console.error("Navbar toggle or navbar elements not found!");
  }


    class Calculator {
        constructor(usage) {
            this.usage = usage
        }

        setUsage(value) {
            this.usage = isNaN(value) || value < 0 ? 61.32 : value;
        }

        calc(type, value){
            let result;
            if (type === CalcType.APRMtoMW) {
                result = this.APRMtoMW(value);
            }
            else if (type === CalcType.MWtoAPRM) {
                result = this.MWtoAPRM(value);
            }
            return result;
        }

        APRMtoMW(aprm){
            let mw = this.CalcGenLoad(aprm);

            if (mw > 0) {
                return (mw -((1.299 * aprm) - 13)).toFixed(0);
            }else{
                return 0;
            }
        }

        MWtoAPRM(mw){
            return parseFloat(this.CalcAprm(mw).toFixed(2));
        }

        calcFlow(mw){
            let flow;

            flow = 82.8 + (13.7 * mw) + (5.87 * Math.pow(10, -3) * Math.pow(mw, 2));

            return Math.round(flow) + 2;
        }


        CalcGenLoad(mw) {
            let gen_load = -135 + (13 * mw) + (5.33 * Math.pow(10, -3) * Math.pow(mw, 2));

          return Math.max(0, Math.round(gen_load));
        }

        CalcAprm(mw) {
            let aprm;
            aprm = (mw + this.usage + 163) / 14.3;
            return parseFloat(aprm.toFixed(2));
        }

    }

    const calculator = new Calculator(usage);


    siteUsage.addEventListener("input", function() {
        let x = siteUsage.value;
        x = parseFloat(x);
        calculator.setUsage(x);
    });



    demandInput.addEventListener('input', function () {
        if (suppressTB_Demand) return;

        suppressTB_APRM = true;

        let a;
        let invalid = 0;

        try {
            a = parseFloat(demandInput.value);
            if (isNaN(a) || a < 0) {
                invalid = 2;
                a = 0;
            }
        } catch (ex) {
            invalid = 1;
            a = 0;
        }

        const lbError = document.getElementById('error');

        if (invalid === 2) {
            demandInput.style.backgroundColor = 'red';
            lbError.classList.add('visible');
            lbError.textContent = 'The values in the fields must be greater than 0!';
        } else if (invalid === 1) {
            demandInput.style.backgroundColor = 'red';
            lbError.classList.add('visible');
            lbError.textContent = 'The values in the fields must be numbers!';
        } else {
            demandInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        const y = calculator.calc(CalcType.MWtoAPRM, a)
        aprmInput.value = y;

        if (y > 108) {
            lbError.classList.add('visible');
            lbError.textContent = 'It is generally not recommended to exceed 108% APRM';
            aprmInput.style.backgroundColor = 'red';
        } else if (invalid !== 2 && invalid !== 1) {
            aprmInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        feedwaterInput.value = calculator.calcFlow(y);
        genLoadInput.value = calculator.CalcGenLoad(y);

        suppressTB_APRM = false;
    });

    aprmInput.addEventListener('input', function () {
        if (suppressTB_APRM) return;

        suppressTB_Demand = true;

        let a;
        let invalid = 0;
        let y;

        try {
            a = parseFloat(aprmInput.value);
            if (isNaN(a) || a < 0) {
                invalid = 2;
                a = 0;
            }
        } catch (ex) {
            invalid = 1;
            a = 0;
        }

        const lbError = document.getElementById('error');

        if (invalid === 2) {
            aprmInput.style.backgroundColor = 'red';
            lbError.classList.add('visible');
            lbError.textContent = 'The values in the fields must be greater than 0!';
        } else if (invalid === 1) {
            aprmInput.style.backgroundColor = 'red';
            lbError.classList.add('visible');
            lbError.textContent = 'The values in the fields must be numbers!';
        } else {
            aprmInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        y = calculator.calc(CalcType.APRMtoMW, a);


        demandInput.value = y;

        if (a > 108) {
            lbError.classList.add('visible');
            lbError.textContent = 'It is generally not recommended to exceed 108% APRM';
            aprmInput.style.backgroundColor = 'red';
        } else if (invalid !== 2 && invalid !== 1) {
            aprmInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        feedwaterInput.value = calculator.calcFlow(a);
        genLoadInput.value = calculator.CalcGenLoad(a);

        suppressTB_Demand = false;
    });
});
        /*
        mw = -135 + (13 * therm) + (5.33 * Math.pow(10, -3) * Math.pow(therm, 2));
        mw + 135 = (13 * therm) + (5.33 * Math.pow(10, -3) * Math.pow(therm, 2));
        mw + 135 - (13 * therm) = 5.33 * Math.pow(10, -3) * Math.pow(therm, 2);
        mw + 135 - (13 * therm) / 5.33 * Math.pow(10, -3) = Math.pow(therm, 2);
        mw + 135 - 13 * -therm / 5.33 * Math.pow(10, -3) = math.pow(therm, 2);
        mw + 135 - 13 = math.pow(therm, 2) / -therm / 5.33 * Math.pow(10, -3);
        mw + 135 - 13 * (5.33 * Math.pow(10, -3)) = math.pow(therm, 2) / -therm;

        therm = Math.sqrt((mw + 135 - 13) / -therm / 5.33 * Math.pow(10, -3));

        mw = -135 + (13 * therm) + (5.33 * Math.pow(10, -3) * Math.pow(therm, 2));
        mw = -135 + (13 * therm) + 5.33 * Math.pow(10, -3) * Math.pow(therm, 2);
        mw / Math.pow(therm, 2) = -135 + 13 * therm + 5.33 * Math.pow(10, -3);
        mw / Math.pow(therm, 2) / therm = -135 + 13 + 5.33 * Math.pow(10, -3);
        Math.pow(therm, 2) / therm = (-135 + 13 + 5.33 * Math.pow(10, -3)) * mw;

        therm = (-135 + 13 + 5.33 * Math.pow(10, -3)) * mw;

        mw = 14.3 * therm - 163 - 42.7
        mw + 42.7 = 14.3 * therm - 163
        mw + 42.7 + 163 = 14.3 * therm
        (mw + 42.7 + 163) / 14.3 = therm
        */
        /* 61.32 represents the avg. site usage. if i manage to get a accurate reading regarding that,
        i might be able to make the conversion more accurate*/
