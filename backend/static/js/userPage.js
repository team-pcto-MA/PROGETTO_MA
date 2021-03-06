url = new URL(window.location.href);
const vett = url.pathname.split('/');
const user = vett[2];
const card = $('#rspi').text();
let userInfo = $('#userInfoHtml').text();

//_______________________________________________________________________________

const sensors = async (mac) => {
  if (mac) {
    try {
      const Res = await fetch(`${url.origin}/sensor?mac=${mac}`);
      const res = await Res.json();
      console.log(res);
      let sensors = [];
      if (res.status != '200') {
        alert(`Error: ${res.status} : ${res.message}`);
      } else {
        if (res.data.length == 0) {
          $('#logs').append('<h2>This RSPI has no sensor</h2>');
        } else {
          let c = 0;
          res.data.forEach((el) => {
            console.log(el.dev_id);
            $('#sensors').append(
              `<div class="" id="sensor${c}">${el.dev_id}</div>`
            );
            sensors.push($(`#sensor${c}`));
            c += 1;
          });
          console.log(sensors);
          sensors.forEach((el) => {
            el.click(() => {
              $('#logs').empty();

              el.siblings().attr('class', '');
              el.attr('class', 'active_2');

              const id_s = el.text();
              $('#logs').append(
                `<input type="num" style="color:black;" id="mode-set"></input> <button type="button" class="btn" onclick="sendMode('${mac}')" style="color:black;">SEND MODE</button>`
              );

              fetch(`${url.origin}/log/sensorLogs`, {
                method: 'POST',
                body: JSON.stringify({ id_s: id_s }),
              })
                .then((log) => log.json())
                .then((Log) => {
                  console.log(Log);
                  if (Log.status != '200') {
                    alert(`Error, ${Log.status}: ${Log.message}`);
                  } else {
                    if (Log.data.length == 0) {
                      $('#logs').append('<h2>This sensor have no logs</h2>');
                    } else {
                      Log.data.forEach((log) => {
                        console.log('ciao');
                        $('#logs').append(
                          `<h3>Event: ${log.event}.  When: ${log.whenEvent}</h3>`
                        );
                      });
                    }
                  }
                })
                .catch((er) => {
                  console.log(er);
                });
            });
          });
        }
      }
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  }
};

const togglePopup = (mac) => {
  console.log(mac);
  var popup = document.getElementById('popup');
  popup.classList.toggle('active');
  $('#logs').empty();

  $('#sensors').empty();
  sensors(mac);
};

$(document).ready(async () => {
  console.log('ready');
  console.log(url);
  console.log(vett);
  console.log(card);
  $('#contenitore').append(card);
});

//_______________________________________________________________________________
$('#logout').click(async () => {
  console.log('ciao');
  const rowRes = await fetch(`/user/logOut`);
  const res = await rowRes.json();

  if (res.status == '200') {
    console.log(res.status);
    window.location.href = 'login';
  }
});
//_______________________________________________________________________________
$('#add').click(async () => {
  window.location.href = `${url.origin}/view/${user}/rspreg`;
});

[$('#rspiList'), $('#userInfo'), $('#add'), $('#logout')].forEach((el) => {
  el.click(() => {
    $('#contenitore').empty();
    if (el.attr('id') == 'rspiList') {
      console.log(card);
      $('#contenitore').append(card);
    } else if (el.attr('id') == 'userInfo') {
      console.log(userInfo);
      fetch(`${url.origin}/user`)
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          res = res.data;
          userInfo = userInfo.replace('%username%', res.username);
          userInfo = userInfo.replace('%name%', res.name);
          userInfo = userInfo.replace('%surname%', res.surname);
          userInfo = userInfo.replace('%email%', res.email);
          userInfo = userInfo.replace(
            '%tel%',
            res.phone ? res.phone : 'no phone number'
          );
          $('#contenitore').append(userInfo);
        })
        .catch((err) => {
          console.log(`Error: ${err}`);
        });
    }
    el.attr('class', 'active');
    el.siblings().attr('class', '');
  });
});

const changeName = async (mac) => {
  console.log('ciao');
  console.log(`mac: ${mac}`);
  console.log(document.getElementById(`newName,${mac}`));
  const name = document.getElementById(`newName,${mac}`).value;
  console.log(name);

  const data = { mac: mac, name: name, ownerName: user };
  console.log(JSON.stringify(data));
  try {
    let res = await fetch(`${url.origin}/RSPi/setName`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    res = await res.json();
    console.log(res);
    alert(`${res.message}`);
  } catch (err) {
    console.log(`error: ${err}`);
  }
};

const sendMode = async (mac) => {
  console.log(mac);
  const data = { mac: mac, mode: $('#mode-set').val() };
  console.log(data);
  try {
    let res = await fetch(`${url.origin}/RSPi/sendMode`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    res = await res.text();
    console.log(res);
    alert(`${res}`);
  } catch (err) {
    console.log(`error: ${err}`);
  }
};
